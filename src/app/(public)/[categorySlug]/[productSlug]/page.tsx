import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MessageCircle, ChevronLeft, Factory, TrendingUp, ShieldCheck } from 'lucide-react'
import ProductGallery from '@/components/public/ProductGallery'
import { Metadata } from 'next'
import Script from 'next/script'

export const revalidate = 3600

type PageProps = {
  params: Promise<{ categorySlug: string; productSlug: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const resolvedParams = await props.params
  const productSlug = decodeURIComponent(resolvedParams.productSlug)
  
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description, images, categories(title)')
    .eq('slug', productSlug)
    .single()

  if (!product) return { title: 'المنتج غير موجود' }

  const categories = product.categories as any
  const categoryTitle = Array.isArray(categories) 
    ? categories[0]?.title 
    : categories?.title;
    
  const fullProductName = categoryTitle ? `${categoryTitle} ${product.name}` : product.name;

  return {
    title: `${fullProductName} بسعر الجملة`,
    description: `تفاصيل ${fullProductName} من احسن مصانع منسوجات في المحلة الكبرى. متاح للتصنيع وتجارة الجملة بأسعار المصنع الحقيقية.`,
    openGraph: {
      title: `${fullProductName} | دليل منسوجات المحلة`,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    }
  }
}

export default async function ProductPage(props: PageProps) {
  const resolvedParams = await props.params
  const categorySlug = decodeURIComponent(resolvedParams.categorySlug)
  const productSlug = decodeURIComponent(resolvedParams.productSlug)
  
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(title, slug)')
    .eq('slug', productSlug)
    .single()

  if (!product) return notFound()

  const cats = product.categories as any
  const category = Array.isArray(cats) ? cats[0] : cats

  const whatsappNumber = '201553631120' 
  const whatsappMessage = encodeURIComponent(
    `مرحباً! أنا مهتم بمنتج "${product.name}" وأريد الاستفسار عن تفاصيل التصنيع عند الطلب للحصول على أفضل سعر.`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  const gallery = product.images ?? []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `منتج ${product.name} بأسعار الجملة من المحلة الكبرى.`,
    image: gallery,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: product.estimated_cost || 0,
      priceCurrency: 'EGP',
    },
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right">
      <Script 
        id="product-schema"
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-8 flex-wrap">
          <a href="/" className="hover:text-indigo-600 transition-colors">الرئيسية</a>
          <ChevronLeft className="w-4 h-4" />
          <a href={`/${categorySlug}`} className="hover:text-indigo-600 transition-colors">
            {category?.title || 'القسم'}
          </a>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <ProductGallery images={gallery} name={product.name} />

          {/* ── Product Info ── */}
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wide">
                {category?.title || 'منتج متميز'}
              </span>
              <span className="inline-block text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                متاح للتصنيع الخاص
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {product.name}
            </h1>
            
            {product.product_code && product.show_product_code && (
              <div className="mb-4 inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-mono border border-slate-200">
                كود المنتج: <span dir="ltr">{product.product_code}</span>
              </div>
            )}
            
            {product.estimated_cost && product.show_estimated_cost && (
              <div className="bg-indigo-600 text-white rounded-2xl p-5 mb-8 shadow-xl shadow-indigo-600/20 inline-block min-w-[200px]">
                <div className="text-xs opacity-80 mb-1 font-medium">التكلفة التقديرية</div>
                <div className="text-3xl font-black">
                  <span dir="ltr">{Number(product.estimated_cost).toFixed(2)} ج.م</span>
                </div>
              </div>
            )}

            {/* ── قسم التصنيع عند الطلب ── */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-indigo-100">ميزة التصنيع عند الطلب</h3>
              </div>
              
              <p className="text-slate-300 mb-8 leading-relaxed">
                بصفتي مندوبك في المحلة، أوفر لك <span className="text-white font-bold text-lg underline decoration-indigo-500 underline-offset-4">التصنيع الخاص</span> أو شراء البضائع الجاهزة بأفضل سعر ممكن لزيادة أرباحك:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">تخطي هوامش تجار الجملة</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">ستحصل على البضاعة بسعر المصنع الحقيقي، مما يتيح لك هامش ربح ممتاز لم يكن متاحاً لك من قبل.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">نافس بقوة في منطقتك</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">بهذا السعر، يمكنك البيع بسعر أرخص من منافسيك مع الاحتفاظ بربح جيد، والتعامل بالدفع الكاش بمرونة.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-sm font-medium text-indigo-300 italic">"اصنع علامتك التجارية الخاصة بمواصفاتك وسعرنا"</p>
              </div>
            </div>

            {product.description && (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 mb-8 shadow-sm">
                <h2 className="font-bold text-slate-900 mb-4 text-xl">المواصفات الفنية</h2>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* WhatsApp CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full px-8 py-5 bg-[#25D366] hover:bg-[#20c05c] text-white font-black rounded-2xl transition-all hover:shadow-2xl hover:shadow-green-500/40 text-xl group"
            >
              <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
              ناقش طلبك مع فريق المبيعات
            </a>
            <p className="text-center text-sm text-slate-400 mt-4 font-medium">
              الرد سريع ومتاح تنفيذ جميع المواصفات الفنية والكميات
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
