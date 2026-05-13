import Link from 'next/link'
import { Layers, MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              منسوجات المحلة
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              وسيطك الموثوق في المحلة الكبرى، مصر.
              نوفر للمحلات والتجار منسوجات ومفروشات بأسعار المصنع الحقيقية.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-right">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-right">
              <li><Link href="/" className="hover:text-indigo-400 transition-colors">الرئيسية</Link></li>
              <li><Link href="/#categories" className="hover:text-indigo-400 transition-colors">كتالوج المنتجات</Link></li>
              <li><Link href="/#why-us" className="hover:text-indigo-400 transition-colors">لماذا نحن؟</Link></li>
              <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors">لوحة التحكم</Link></li>
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-right">اتصل بنا</h3>
            <ul className="space-y-3 text-sm text-right">
              <li className="flex items-start gap-2 justify-end">
                <span>المنطقة الصناعية، المحلة الكبرى، الغربية، مصر</span>
                <MapPin className="w-4 h-4 mt-0.5 text-indigo-400 shrink-0" />
              </li>
              <li className="flex items-center gap-2 justify-end">
                <a href="tel:+201553631120" className="hover:text-indigo-400 transition-colors" dir="ltr">0155 363 1120</a>
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
              </li>
              <li className="flex items-center gap-2 justify-end">
                <a href="https://wa.me/201553631120" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors" dir="ltr">تواصل عبر الواتساب</a>
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} منسوجات المحلة. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  )
}
