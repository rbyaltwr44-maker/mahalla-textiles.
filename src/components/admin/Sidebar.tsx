'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Tag, LogOut, Layers, ExternalLink, Menu, X } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'الإحصائيات', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/categories', label: 'الأقسام', icon: Tag },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    document.cookie = "dev_admin_access=; path=/; max-age=0"
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 right-0 left-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50 text-white">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Layers className="w-5 h-5 text-indigo-400" />
          لوحة الإدارة
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 right-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen text-right transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="hidden md:flex px-6 py-5 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </div>
            لوحة الإدارة
          </Link>
        </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout & Catalog */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <Link 
          href="/" 
          target="_blank"
          className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4" />
            معاينة الموقع
          </div>
          <ExternalLink className="w-3 h-3 opacity-50" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
    </>
  )
}
