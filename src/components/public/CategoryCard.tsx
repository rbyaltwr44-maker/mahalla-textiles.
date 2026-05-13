import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { Category } from '@/types/database.types'

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-slate-100 block card-hover"
    >
      <div className="aspect-[4/3] relative">
        {category.cover_image ? (
          <Image
            src={category.cover_image}
            alt={category.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-slate-200 flex items-center justify-center">
            <span className="text-4xl">🧵</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-right">
        <h3 className="text-xl font-bold text-white mb-1">{category.title}</h3>
        <span className="inline-flex items-center gap-1 text-sm text-indigo-300 font-medium group-hover:gap-2 transition-all">
          استعرض المنتجات <ArrowLeft className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}
