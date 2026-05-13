'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CategoriesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${title}"؟ سيتم حذف جميع المنتجات التابعة له أيضاً.`)) return
    
    setDeletingId(id)
    const { error } = await supabase.from('categories').delete().eq('id', id)
    
    if (error) {
      alert('خطأ أثناء الحذف: ' + error.message)
      setDeletingId(null)
    } else {
      fetchCategories()
      router.refresh()
    }
  }

  return (
    <div className="text-right">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الأقسام</h1>
          <p className="text-slate-500 text-sm mt-1">إجمالي الأقسام: {categories.length}</p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> إضافة قسم
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400">جاري التحميل...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">القسم</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">الرابط (Slug)</th>
                  <th className="text-right px-6 py-4 font-bold text-slate-700 whitespace-nowrap">تاريخ الإضافة</th>
                  <th className="text-left px-6 py-4 font-bold text-slate-700 whitespace-nowrap">خيارات</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length > 0 ? categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {c.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.cover_image} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Tag className="w-5 h-5" /></div>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 text-base">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono" dir="ltr">{c.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(c.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-start gap-2">
                      <Link 
                        href={`/dashboard/categories/${c.id}/edit`} 
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(c.id, c.title)}
                        disabled={deletingId === c.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                        title="حذف"
                      >
                        {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                    لا توجد أقسام حالياً.
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
