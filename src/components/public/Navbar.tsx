'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Layers } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            منسوجات المحلة
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">الرئيسية</Link>
            <Link href="/#categories" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">الكتالوج</Link>
            <Link href="/#why-us" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">لماذا نحن؟</Link>
            <a
              href="https://wa.me/201553631120"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              تواصل معنا
            </a>
          </nav>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          <Link href="/" onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700 py-2">الرئيسية</Link>
          <Link href="/#categories" onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700 py-2">الكتالوج</Link>
          <Link href="/#why-us" onClick={() => setOpen(false)} className="block text-sm font-medium text-slate-700 py-2">لماذا نحن؟</Link>
          <a href="https://wa.me/201553631120" target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">تواصل معنا</a>
        </div>
      )}
    </header>
  )
}
