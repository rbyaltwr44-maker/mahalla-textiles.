import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mahalla-textiles.vercel.app'),
  title: {
    template: '%s | دليل منسوجات المحلة',
    default: 'احسن مصانع منسوجات في المحلة | أسعار الجملة والمصنع',
  },
  description:
    'بوابتك لمنتجات ومصانع المحلة الكبرى. نوفر للمحلات والتجار منسوجات ومفروشات بأسعار المصنع الحقيقية لتخطي وسطاء الجملة، مع توفر بضائع جاهزة وتصنيع عند الطلب.',
  keywords: ['دليل مصانع المحلة', 'بضائع من المحلة للمحلات', 'منسوجات المحلة بأسعار المصنع', 'مفروشات المحلة بالجملة', 'تجار جملة المحلة', 'مصنع فوط المحلة'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    siteName: 'منسوجات المحلة',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'SlLKJxi9Y9-qfF9UMqfE4P6-uN_uQw_E1Be3HjXgFxM',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="antialiased font-sans">
        {children}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'دليل منسوجات المحلة',
              description: 'وسيط تجاري لتوفير المنسوجات والمفروشات بأسعار المصنع مباشرة من المحلة الكبرى.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'المحلة الكبرى',
                addressCountry: 'EG',
              },
            }),
          }}
        />
      </body>
    </html>
  )
}
