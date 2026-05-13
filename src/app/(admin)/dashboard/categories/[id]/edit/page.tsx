'use client'
import { useState, useEffect, use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  title: z.string().min(3, 'الاسم يجب أن يكون 3 حروف على الأقل'),
})

type FormValues = z.infer<typeof schema>

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    supabase.from('categories').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setValue('title', data.title)
        setPreview(data.cover_image)
      }
      setIsLoading(false)
    })
  }, [id, supabase, setValue])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return preview // Return existing image if no new file
    setIsUploading(true)
    const ext = file.name.split('.').pop()
    const path = `categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (error) {
      setIsUploading(false)
      return null
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    setIsUploading(false)
    return data.publicUrl
  }

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    try {
      const coverImageUrl = await uploadImage()
      const autoSlug = values.title.trim().toLowerCase().replace(/\s+/g, '-')

      const { error } = await supabase.from('categories').update({
        title: values.title,
        slug: autoSlug,
        cover_image: coverImageUrl,
      }).eq('id', id)

      if (error) {
        setServerError(error.message)
      } else {
        router.push('/dashboard/categories')
        router.refresh()
      }
    } catch (e) {
      setServerError('حدث خطأ أثناء التحديث')
    }
  }

  if (isLoading) return <div className="p-10 text-center">جاري التحميل...</div>

  return (
    <div className="text-right">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/categories" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تعديل القسم</h1>
          <p className="text-slate-500 text-sm mt-1">تحديث بيانات القسم المختار</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم القسم *</label>
            <input 
              {...register('title')} 
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">صورة الغلاف</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {preview ? (
                  <img src={preview} alt="معاينة" className="w-full h-full object-cover" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1">
                <input type="file" id="cat-img-edit" accept="image/*" className="hidden" onChange={handleFile} />
                <label htmlFor="cat-img-edit" className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-all">
                  تغيير الصورة
                </label>
              </div>
            </div>
          </div>
        </div>

        {serverError && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{serverError}</div>}

        <div className="flex gap-4">
          <button type="submit" disabled={isSubmitting || isUploading} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20">
            {(isSubmitting || isUploading) && <Loader2 className="w-5 h-5 animate-spin" />}
            حفظ التغييرات
          </button>
          <Link href="/dashboard/categories" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
