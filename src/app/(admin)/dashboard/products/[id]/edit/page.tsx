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
  
  type ImageItem = { id: string; type: 'existing' | 'new'; url: string; file?: File };
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false) 
  const [showProductCode, setShowProductCode] = useState(true)
  const [showEstimatedCost, setShowEstimatedCost] = useState(true)
  
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
          setImages(product.images.map((url: string, i: number) => ({
            id: `existing-${Date.now()}-${i}`,
            type: 'existing',
            url
          })))
        }
        setShowProductCode(product.show_product_code ?? true)
        setShowEstimatedCost(product.show_estimated_cost ?? true)
      } else if (prodRes.error) {
        setServerError('لم يتم العثور على المنتج')
      }
      setIsLoading(false)
    })
  }, [supabase, productId, reset])

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    const newItems = Array.from(selected).map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      type: 'new' as const,
      url: URL.createObjectURL(f),
      file: f
    }))
    setImages(prev => [...prev, ...newItems])
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false) }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }
  const handleDropSort = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return
    const newImages = [...images]
    const [moved] = newImages.splice(sourceIndex, 1)
    newImages.splice(targetIndex, 0, moved)
    setImages(newImages)
  }
  const handleDragOverSort = (e: React.DragEvent) => e.preventDefault()

  const onSubmit = async (values: FormValues) => {
    setServerError('')
    try {
      setIsUploading(true)
      const allImages: string[] = []
      
      for (const img of images) {
        if (img.type === 'existing') {
          allImages.push(img.url)
        } else if (img.type === 'new' && img.file) {
          const ext = img.file.name.split('.').pop()
          const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { error } = await supabase.storage.from('product-images').upload(path, img.file)
          if (!error) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(path)
            allImages.push(data.publicUrl)
          }
        }
      }
      setIsUploading(false)
      
      const costNum = values.estimated_cost ? parseFloat(values.estimated_cost) : null
      const autoSlug = values.name.trim().toLowerCase().replace(/\s+/g, '-')

      const { error } = await supabase.from('products').update({
        name: values.name,
        slug: autoSlug,
        description: values.description || null,
        supplier: values.supplier || null,
        product_code: values.product_code || null,
        estimated_cost: costNum,
        show_product_code: showProductCode,
        show_estimated_cost: showEstimatedCost,
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
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`block border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${isDragOver ? 'border-indigo-500 bg-indigo-100' : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50'}`}
              >
                <UploadCloud className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-600">اسحب الصور وأفلتها هنا، أو اضغط للرفع</p>
                <p className="text-xs text-slate-400 mt-2">يمكنك السحب والإفلات لترتيب الصور لاحقاً</p>
                <input id="img-upload" type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </label>
              
              {images.length > 0 && (
                <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {images.map((img, i) => (
                    <div 
                      key={img.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDrop={(e) => handleDropSort(e, i)}
                      onDragOver={handleDragOverSort}
                      className={`relative aspect-square rounded-xl overflow-hidden border group shadow-sm cursor-grab active:cursor-grabbing ${img.type === 'new' ? 'border-indigo-400' : 'border-slate-200'}`}
                    >
                      {img.type === 'new' && <div className="absolute top-1 right-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded z-10 pointer-events-none">جديد</div>}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="صورة" className="w-full h-full object-cover pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className={`absolute top-1.5 ${img.type === 'new' ? 'left-1.5' : 'right-1.5'} w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-1.5 right-1.5 bg-slate-900/60 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 backdrop-blur-sm pointer-events-none">
                        رقم {i + 1}
                      </div>
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
                <button
                  type="button"
                  onClick={() => setShowProductCode(v => !v)}
                  className={`mt-2 flex items-center gap-2 text-xs font-medium transition-colors ${showProductCode ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 transition-colors ${showProductCode ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${showProductCode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                  {showProductCode ? 'ظاهر على الموقع' : 'مخفي عن الزوار'}
                </button>
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
                <button
                  type="button"
                  onClick={() => setShowEstimatedCost(v => !v)}
                  className={`mt-2 flex items-center gap-2 text-xs font-medium transition-colors ${showEstimatedCost ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  <span className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 transition-colors ${showEstimatedCost ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'}`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${showEstimatedCost ? 'translate-x-4' : 'translate-x-0'}`} />
                  </span>
                  {showEstimatedCost ? 'ظاهر على الموقع' : 'مخفي عن الزوار'}
                </button>
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
