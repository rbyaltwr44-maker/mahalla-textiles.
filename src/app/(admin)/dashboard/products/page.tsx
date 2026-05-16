import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, ExternalLink, Package } from 'lucide-react'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(title, slug)')
    .order('created_at', { ascending: false })

  return (
    <div className="text-right">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المنتجات</h1>
          <p className="text-slate-500 text-sm mt-1">إجمالي المنتجات: {products?.length ?? 0}</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> إضافة منتج
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">المنتج</th>
                <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">القسم</th>
                <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">التكلفة / الكود</th>
                <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">الرابط (Slug)</th>
                <th className="text-left px-6 py-4 font-bold text-slate-700 whitespace-nowrap">خيارات</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100">
            {products && products.length > 0 ? products.map((p) => {
              const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
              return (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
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
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono" dir="ltr">{p.slug}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-start gap-2">
                      <Link
                        href={`/${category?.slug}/${p.slug}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="عرض في الموقع"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                  لا توجد منتجات حالياً. <Link href="/dashboard/products/new" className="text-indigo-600 hover:underline font-medium">أضف أول منتج الآن ←</Link>
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
