import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ONR-fashion-live-gy5v.vercel.app";

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cart',
          '/checkout',
          '/my-account',
          '/api/',
          '/*?sort=',    
          '/*?filter=',  
          '/*?search=',  
        ],
      },
      {
        userAgent: 'GPTBot', 
        disallow: ['/'],     
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}