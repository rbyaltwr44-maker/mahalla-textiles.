import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mahalla-textiles.vercel.app'

  const supabase = await createClient()

  // Fetch categories and products
  const { data: categories } = await supabase.from('categories').select('slug, created_at')
  const { data: products } = await supabase.from('products').select('slug, created_at, categories(slug)')

  const sitemapUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  categories?.forEach((cat) => {
    sitemapUrls.push({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: cat.created_at ? new Date(cat.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  products?.forEach((prod) => {
    const cats = prod.categories as any
    const catSlug = Array.isArray(cats) ? cats[0]?.slug : cats?.slug
    if (catSlug) {
      sitemapUrls.push({
        url: `${baseUrl}/${catSlug}/${prod.slug}`,
        lastModified: prod.created_at ? new Date(prod.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  })

  return sitemapUrls
}
