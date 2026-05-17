import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/public/ProductCard'

export const revalidate = 3600

type Props = { params: Promise<{ categorySlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params
  const supabase = await createClient()
  const { data: cat } = await supabase
    .from('categories')
    .select('title')
    .eq('slug', categorySlug)
    .single()

  if (!cat) return { title: 'الفئة غير موجودة' }
  return {
    title: `${cat.title} بأسعار المصنع`,
    description: `تصفح قسم ${cat.title} من احسن مصانع منسوجات في المحلة. جودة عالية بأسعار الجملة للشركات والمحلات.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug: rawSlug } = await params
  const categorySlug = decodeURIComponent(rawSlug)
  console.log('Searching for category slug:', categorySlug)
  
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()

  if (!category) notFound()

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50 text-right">
      {/* Category Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="text-sm text-slate-500 mb-4 flex items-center gap-2">
            <a href="/" className="hover:text-indigo-600 transition-colors">الرئيسية</a>
            <span>/</span>
            <span className="text-slate-900 font-medium">{category.title}</span>
          </nav>
          <h1 className="text-4xl font-bold text-slate-900">{category.title}</h1>
          <p className="mt-2 text-slate-500">
            {products?.length ?? 0} منتج متاح في هذه الفئة
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🧵</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">لا يوجد منتجات حالياً</h3>
            <p className="text-slate-400">سيتم إضافة المنتجات قريباً من قبل فريق الإدارة.</p>
          </div>
        )}
      </div>
    </div>
  )
}
