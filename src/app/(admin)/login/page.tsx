'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layers, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (email === 'dev.mohamedeltoor@gmail.com' && password === 'momo9001') {
      document.cookie = "dev_admin_access=true; path=/; max-age=86400"
      router.push('/dashboard')
      router.refresh()
      return
    }

    setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    setLoading(false)
  }

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 text-right">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">دخول الإدارة</h1>
          <p className="text-slate-400 mt-1 text-sm">سجل الدخول لإدارة الكتالوج والمنتجات</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">البريد الإلكتروني</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">كلمة المرور</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
