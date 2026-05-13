'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function DeleteProductButton({ productId, productName }: { productId: string, productName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف المنتج "${productName}"؟\nلا يمكن التراجع عن هذا الإجراء.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) throw error
      
      router.refresh()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('حدث خطأ أثناء الحذف')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="حذف"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
