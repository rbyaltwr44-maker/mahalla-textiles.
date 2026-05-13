'use client'
import { useState } from 'react'
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

export default function NewCategoryPage() {
  const router = useRouter()
  const supabase = createClient()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null
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
      
      // Auto-generate slug from title behind the scenes
      const autoSlug = values.title.trim().toLowerCase().replace(/\s+/g, '-')

      const { error } = await supabase.from('categories').insert({
        title: values.title,
        slug: autoSlug,
        cover_image: coverImageUrl,
      })

      if (error) {
        setServerError(error.message)
      } else {
        router.push('/dashboard/categories')
        router.refresh()
      }
    } catch (e) {
      setServerError('حدث خطأ أثناء حفظ القسم')
    }
  }

  const busy = isSubmitting || isUploading

  return (
    <div className="text-right">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/categories" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إضافة قسم جديد</h1>
          <p className="text-slate-500 text-sm mt-1">أدخل اسم القسم وصورة الغلاف فقط</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم القسم *</label>
            <input 
              {...register('title')} 
              placeholder="مثال: مناشف الفنادق، أطقم السرير" 
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
                <input 
                  type="file" 
                  id="cat-img" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFile}
                />
                <label 
                  htmlFor="cat-img" 
                  className="inline-flex items-center px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-all shadow-sm"
                >
                  {preview ? 'تغيير الصورة' : 'اختر صورة للقسم'}
                </label>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">يفضل استخدام صورة عالية الجودة بحجم 800x600 بكسل.</p>
              </div>
            </div>
          </div>
        </div>

        {serverError && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm">
            {serverError}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all disabled:opacity-60 shadow-lg shadow-indigo-600/20"
          >
            {busy && <Loader2 className="w-5 h-5 animate-spin" />}
            {isUploading ? 'جاري رفع الصورة...' : 'إنشاء القسم'}
          </button>
          <Link href="/dashboard/categories" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
