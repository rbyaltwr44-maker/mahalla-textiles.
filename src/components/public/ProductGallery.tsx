'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function ProductGallery({ images, name }: { images: string[], name: string }) {
  const [activeImage, setActiveImage] = useState<string | null>(images.length > 0 ? images[0] : null)

  return (
    <div className="space-y-4">
      <div className="aspect-square relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm group">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-8xl opacity-20">🧶</span>
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div 
              key={i} 
              onClick={() => setActiveImage(img)}
              className={`aspect-square relative rounded-xl overflow-hidden bg-white border-2 cursor-pointer transition-all ${
                activeImage === img ? 'border-indigo-600 shadow-md' : 'border-transparent hover:border-slate-300'
              }`}
            >
              <Image 
                src={img} 
                alt={`${name} ${i + 1}`} 
                fill 
                className="object-cover" 
                sizes="20vw" 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
