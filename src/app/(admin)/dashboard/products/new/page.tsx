'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UploadCloud, Loader2, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/types/database.types'

const schema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 حروف على الأقل'),
  description: z.string().optional(),
  supplier: z.string().optional(),
  product_code: z.string().optional(),
  estimated_cost: z.string().optional().or(z.literal('')),
  categoryId: z.string().uuid('يرجى اختيار قسم صحيح'),
})

type FormValues = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      estimated_cost: '',
    }
  })

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data as Category[])
    })
  }, [supabase])

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(prev => [...prev, ...arr])
    const newPreviews = arr.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    setIsUploading(true)
    const urls: string[] = []
    try {
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (!error) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path)
          urls.push(data.publicUrl)
        }
      }
    } finally {
      setIsUploading(false)
    }
    return urls
  }

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    try {
      const imageUrls = files.length > 0 ? await uploadImages() : []
      const costNum = values.estimated_cost ? parseFloat(values.estimated_cost) : null
      
      // Auto-generate slug from name behind the scenes
      const autoSlug = values.name.trim().toLowerCase().replace(/\s+/g, '-')

      const { error } = await supabase.from('products').insert({
        name: values.name,
        slug: autoSlug,
        description: values.description || null,
        supplier: values.supplier || null,
        product_code: values.product_code || null,
        estimated_cost: costNum,
        category_id: values.categoryId,
        images: imageUrls,
      } as any)

      if (error) {
        setServerError(error.message)
      } else {
        router.push('/dashboard/products')
        router.refresh()
      }
    } catch (e) {
      setServerError('حدث خطأ أثناء حفظ المنتج')
    }
  }

  const busy = isSubmitting || isUploading

  return (
    <div className="text-right">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/products" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إضافة منتج جديد</h1>
          <p className="text-slate-500 text-sm mt-1">أدخل تفاصيل المنتج ليظهر في الكتالوج العام</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm">
              <h2 className="font-semibold text-slate-800 border-b border-slate-50 pb-3">المعلومات الأساسية</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">اسم المنتج *</label>
                <input 
                  {...register('name')} 
                  placeholder="مثال: فوطة قطن مطرزة 600 جرام" 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">المواصفات الفنية / الوصف</label>
                <textarea
                  {...register('description')}
                  rows={6}
                  placeholder="الخامة: قطن مصري 100%&#10;الوزن: 600 جرام&#10;المقاسات المتاحة: 50×90، 70×140"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                />
              </div>
            </div>

            {/* Images */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-4 border-b border-slate-50 pb-3">صور المنتج</h2>
              <label
                htmlFor="img-upload"
                className="block border-2 border-dashed border-indigo-100 rounded-xl p-10 text-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <UploadCloud className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-600">اضغط لرفع صور المنتج</p>
                <p className="text-xs text-slate-400 mt-2">يمكنك اختيار أكثر من صورة (JPG, PNG, WEBP)</p>
                <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>
              
              {previews.length > 0 && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="معاينة" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-sm">
              <h2 className="font-semibold text-slate-800 border-b border-slate-50 pb-3">الإعدادات</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">القسم *</label>
                <select 
                  {...register('categoryId')} 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all appearance-none"
                >
                  <option value="">اختر القسم المخصص…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">المورد - اختياري</label>
                <input 
                  {...register('supplier')} 
                  placeholder="اسم المورد" 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">كود المنتج - اختياري</label>
                <input 
                  {...register('product_code')} 
                  placeholder="مثال: PRD-001" 
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-left" 
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">التكلفة التقديرية - اختياري</label>
                <div className="relative">
                  <input 
                    {...register('estimated_cost')} 
                    type="text" 
                    placeholder="0.00" 
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-left" 
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {serverError && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm">{serverError}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all disabled:opacity-60 shadow-lg shadow-indigo-600/20"
            >
              {busy && <Loader2 className="w-5 h-5 animate-spin" />}
              {isUploading ? 'جاري رفع الصور...' : 'حفظ ونشر المنتج'}
            </button>
            <Link href="/dashboard/products" className="block w-full text-center py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors">
              إلغاء التعديلات
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
