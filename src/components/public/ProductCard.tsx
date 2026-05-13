import Link from 'next/link'
import Image from 'next/image'
import { Tag } from 'lucide-react'
import type { Product } from '@/types/database.types'

export default function ProductCard({ product, categorySlug }: { product: Product; categorySlug: string }) {
  return (
    <Link
      href={`/${categorySlug}/${product.slug}`}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden card-hover flex flex-col text-right"
    >
      <div className="aspect-square relative bg-slate-50">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-5xl opacity-30">🧶</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1 leading-relaxed">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 flex-row-reverse">
          {product.price ? (
            <span className="font-bold text-indigo-600" dir="ltr">${product.price.toFixed(2)}</span>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> السعر عند الطلب
            </span>
          )}
          <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
            التفاصيل ←
          </span>
        </div>
      </div>
    </Link>
  )
}
