'use client'
import { useState, useEffect, use } from 'react'
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

export default function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const productId = params.id

  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  
  const [files, setFiles] = useState<File[]>([]) 
  const [previews, setPreviews] = useState<string[]>([]) 
  const [existingImages, setExistingImages] = useState<string[]>([]) 
  
  const [isUploading, setIsUploading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      estimated_cost: '',
    }
  })

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('products').select('*').eq('id', productId).single()
    ]).then(([catsRes, prodRes]) => {
      if (catsRes.data) setCategories(catsRes.data as Category[])
      
      if (prodRes.data) {
        const product = prodRes.data
        reset({
          name: product.name,
          description: product.description || '',
          supplier: product.supplier || '',
          product_code: product.product_code || '',
          estimated_cost: product.estimated_cost ? product.estimated_cost.toString() : '',
          categoryId: product.category_id,
        })
        if (product.images) {
          setExistingImages(product.images)
        }
      } else if (prodRes.error) {
        setServerError('لم يتم العثور على المنتج')
      }
      setIsLoading(false)
    })
  }, [supabase, productId, reset])

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const arr = Array.from(selected)
    setFiles(prev => [...prev, ...arr])
    const newPreviews = arr.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeNewFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
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
      let newImageUrls: string[] = []
      if (files.length > 0) {
        newImageUrls = await uploadImages()
      }
      
      const allImages = [...existingImages, ...newImageUrls]
      
      const costNum = values.estimated_cost ? parseFloat(values.estimated_cost) : null
      const autoSlug = values.name.trim().toLowerCase().replace(/\s+/g, '-')

      const { error } = await supabase.from('products').update({
        name: values.name,
        slug: autoSlug,
        description: values.description || null,
        supplier: values.supplier || null,
        product_code: values.product_code || null,
        estimated_cost: costNum,
        category_id: values.categoryId,
        images: allImages,
      }).eq('id', productId)

      if (error) {
        setServerError(error.message)
      } else {
        router.push('/dashboard/products')
        router.refresh()
      }
    } catch (e) {
      setServerError('حدث خطأ أثناء حفظ التعديلات')
    }
  }

  const busy = isSubmitting || isUploading || isLoading

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
  }

  return (
    <div className="text-right">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/products" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">تعديل المنتج</h1>
          <p className="text-slate-500 text-sm mt-1">تعديل تفاصيل المنتج الحالي</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
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

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h2 className="font-semibold text-slate-800 mb-4 border-b border-slate-50 pb-3">صور المنتج</h2>
              <label
                htmlFor="img-upload"
                className="block border-2 border-dashed border-indigo-100 rounded-xl p-10 text-center bg-indigo-50/30 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <UploadCloud className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-600">اضغط لرفع صور إضافية</p>
                <p className="text-xs text-slate-400 mt-2">يمكنك اختيار أكثر من صورة (JPG, PNG, WEBP)</p>
                <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>
              
              {(existingImages.length > 0 || previews.length > 0) && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {existingImages.map((src, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="صورة حالية" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {previews.map((src, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden border border-indigo-400 group shadow-sm">
                      <div className="absolute top-1 right-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded z-10">جديد</div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="معاينة" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute top-1.5 left-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
              {isUploading ? 'جاري رفع الصور...' : 'حفظ التعديلات'}
            </button>
            <Link href="/dashboard/products" className="block w-full text-center py-3 text-slate-500 font-medium hover:text-slate-700 transition-colors">
              إلغاء
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
