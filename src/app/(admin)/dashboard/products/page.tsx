'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Pencil, ExternalLink, Package, GripVertical, FilterX } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'
import { useSearchParams } from 'next/navigation'

function ProductsList() {
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('category_id')
  
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('*, categories(title, slug)')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
      const { data: catData } = await supabase.from('categories').select('title').eq('id', categoryId).single()
      if (catData) setCategoryName(catData.title)
    } else {
      setCategoryName(null)
    }

    const { data } = await query
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [categoryId])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain')
    if (sourceId === targetId || !sourceId) return

    const newItems = [...products]
    const sourceIndex = newItems.findIndex(p => p.id === sourceId)
    const targetIndex = newItems.findIndex(p => p.id === targetId)

    const [moved] = newItems.splice(sourceIndex, 1)
    newItems.splice(targetIndex, 0, moved)

    setProducts(newItems)
    setDraggedId(null)

    const updates = newItems.map((p, idx) => ({ id: p.id, order_index: idx }))
    for (const update of updates) {
      await supabase.from('products').update({ order_index: update.order_index }).eq('id', update.id)
    }
  }

  return (
    <div className="text-right">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {categoryName ? `المنتجات في قسم: ${categoryName}` : 'المنتجات'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 text-sm">إجمالي المنتجات: {products.length}</p>
            {categoryId && (
              <a href="/dashboard/products" className="text-xs flex items-center gap-1 text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">
                <FilterX className="w-3 h-3" /> إزالة الفلتر
              </a>
            )}
          </div>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> إضافة منتج
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="w-10 px-4 py-4"></th>
                  <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">المنتج</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">القسم</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">التكلفة / الكود</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">المورد</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-700 whitespace-nowrap">خيارات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length > 0 ? products.map((p) => {
                  const category = Array.isArray(p.categories) ? p.categories[0] : p.categories
                  const isDragging = draggedId === p.id
                  
                  return (
                    <tr 
                      key={p.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, p.id)}
                      className={`hover:bg-slate-50/50 transition-colors group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 bg-slate-100' : ''}`}
                    >
                      <td className="px-4 py-4 text-slate-300 group-hover:text-slate-500">
                        <GripVertical className="w-5 h-5" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 pointer-events-none">
                            {p.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-5 h-5" /></div>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-base">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{category?.title ?? '—'}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {p.estimated_cost ? <div className="font-medium">{p.estimated_cost} ج.م</div> : '—'}
                        {p.product_code && <div className="text-xs text-slate-400 font-mono mt-1" dir="ltr">{p.product_code}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 font-medium">{p.supplier || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start gap-2">
                          {category && (
                            <Link
                              href={`/${category.slug}/${p.slug}`}
                              target="_blank"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="عرض في الموقع"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/dashboard/products/${p.id}/edit`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <DeleteProductButton productId={p.id} productName={p.name} />
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      لا توجد منتجات حالياً. <Link href="/dashboard/products/new" className="text-indigo-600 hover:underline font-medium">أضف أول منتج الآن ←</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400">جاري التحميل...</div>}>
      <ProductsList />
    </Suspense>
  )
}
