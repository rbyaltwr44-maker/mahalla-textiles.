import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CategoryCard from '@/components/public/CategoryCard'
import { ArrowLeft, Award, Globe, Truck, Users } from 'lucide-react'

export const revalidate = 3600

export const metadata: Metadata = {
  title: {
    absolute: 'احسن مصانع منسوجات في المحلة الكبرى | بيع بالجملة وتصنيع',
  },
  description: 'دليلك المباشر للشراء من احسن مصانع منسوجات في المحلة الكبرى بأسعار المصنع الحقيقية. تصفح الكتالوج واطلب كمياتك الآن.',
  openGraph: {
    title: 'احسن مصانع منسوجات في المحلة الكبرى | بيع بالجملة وتصنيع',
    description: 'كتالوج المنتجات الفاخرة من قلب المحلة الكبرى بأسعار الجملة.',
    images: ['/og-home.jpg'],
  },
}

const WHY_US = [
  {
    icon: Award,
    title: 'أرباح أكبر لمحلك',
    desc: 'نوفر لك البضاعة بسعر المصنع الحقيقي (بدون هوامش كبار التجار) لتستفيد بفرق السعر وتنافس بقوة في منطقتك.',
  },
  {
    icon: Users,
    title: 'عينك في سوق المحلة',
    desc: 'بصفتنا متواجدين في قلب الصناعة، نختار لك أفضل المصانع والخامات ونوفر عليك عناء السفر والبحث.',
  },
  {
    icon: Globe,
    title: 'تصنيع عند الطلب',
    desc: 'نصنع لك الكميات والمواصفات التي تحتاجها خصيصاً لك بأفضل تكلفة لتأسيس علامتك التجارية.',
  },
  {
    icon: Truck,
    title: 'بضائع جاهزة وتسليم سريع',
    desc: 'بجانب التصنيع، نوفر لك بضائع جاهزة ومصنعة للتسليم الفوري لتلبية احتياجات محلك السريعة.',
  },
]

export default async function HomePage() {
  let fetchedCategories = null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
    fetchedCategories = data
  } catch (e) {
    console.error('Supabase fetch failed:', e)
  }

  const mockCategories = [
    { id: '1', title: 'مناشف قطنية فاخرة', slug: 'bath-towels', cover_image: null },
    { id: '2', title: 'مفروشات فندقية', slug: 'bed-linens', cover_image: null },
    { id: '3', title: 'أقمشة صناعية', slug: 'industrial-fabrics', cover_image: null },
  ]

  const categories = (fetchedCategories && fetchedCategories.length > 0) 
    ? fetchedCategories 
    : mockCategories

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero-gradient min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-indigo-300 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            المحلة الكبرى · قلعة الصناعة المصرية
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up animation-delay-100">
            من قلب مصانع المحلة<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              مباشرة إلى محلك
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
            وسيطك الموثوق لتوفير المنسوجات بأسعار المصنع الحقيقية. استكشف البضائع الجاهزة أو اطلب تصنيع مواصفاتك الخاصة لتحقق أعلى هامش ربح وتنافس في منطقتك.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-300">
            <Link
              href="/#categories"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-600/30 flex items-center gap-2"
            >
              استعرض الكتالوج <ArrowLeft className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/201553631120"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 glass hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
            >
              تواصل عبر واتساب
            </a>
          </div>
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-in-up animation-delay-400">
            {[['سعر', 'المصنع'], ['تصنيع', 'حسب الطلب'], ['بضائع', 'جاهزة'], ['شحن', 'لكل المحافظات']].map(([num, label]) => (
              <div key={label} className="glass rounded-2xl p-5">
                <div className="text-3xl font-bold text-white">{num}</div>
                <div className="text-slate-400 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">كتالوج المنتجات</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">تصفح حسب الفئة</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              من المناشف القطنية الفاخرة إلى الأقمشة الصناعية - استكشف مجموعتنا الكاملة.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section id="why-us" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">لماذا نحن؟</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">مميزات منسوجات المحلة</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_US.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-slate-100 card-hover text-right">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">هل أنت جاهز لتقديم طلبك؟</h2>
          <p className="text-slate-300 mb-8 text-lg">
            تواصل مع مندوب المبيعات مباشرة عبر الواتساب للحصول على عروض الأسعار والخصومات.
          </p>
          <a
            href="https://wa.me/201553631120"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#25D366] hover:bg-[#20c05c] text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/30 text-lg"
          >
            تحدث معنا الآن
          </a>
        </div>
      </section>
    </>
  )
}
