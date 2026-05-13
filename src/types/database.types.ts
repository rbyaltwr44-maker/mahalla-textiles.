// src/types/database.types.ts
export interface Category {
  id: string
  title: string
  slug: string
  cover_image: string | null
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  price: number | null
  images: string[]
  created_at: string
  updated_at: string
  categories?: { title: string; slug: string }
}
