import { createClient } from '@/lib/supabase/server'
import { Package, Tag, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const [{ count: productCount }, { count: categoryCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentProducts } = await supabase
    .from('products')
    .select('id, name, slug, price, created_at, categories(title, slug)')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'إجمالي المنتجات', value: productCount ?? 0, icon: Package, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'عدد الأقسام', value: categoryCount ?? 0, icon: Tag, color: 'bg-violet-50 text-violet-600' },
    { label: 'مشاهدات الكتالوج', value: '—', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="text-right">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">نظرة عامة</h1>
        <p className="text-slate-500 mt-1 text-sm">مرحباً بك مجدداً. إليك ملخص نشاط الكتالوج الخاص بك.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link href="/dashboard/products/new" className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-5 font-semibold transition-all shadow-lg shadow-indigo-600/20">
          <Package className="w-5 h-5" /> إضافة منتج جديد
        </Link>
        <Link href="/dashboard/categories/new" className="flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl px-6 py-5 font-semibold border border-slate-200 transition-all shadow-sm">
          <Tag className="w-5 h-5" /> إضافة قسم جديد
        </Link>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">أحدث المنتجات المضافة</h2>
          <Link href="/dashboard/products" className="text-sm text-indigo-600 hover:underline">عرض الكل</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentProducts && recentProducts.length > 0 ? recentProducts.map((p) => {
             const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
             return (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 text-sm">{p.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {category?.title} · {p.price ? <span dir="ltr">${p.price}</span> : 'السعر عند الطلب'}
                  </div>
                </div>
                <Link
                  href={`/${category?.slug}/${p.slug}`}
                  target="_blank"
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="عرض في الموقع"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )
          }) : (
            <div className="px-6 py-10 text-center text-slate-400 text-sm">لا توجد منتجات حالياً.</div>
          )}
        </div>
      </div>
    </div>
  )
}
