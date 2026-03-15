import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://your-ecommerce-site.com";

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
          '/*?sort=',    // Blocks duplicate content from sorting
          '/*?filter=',  // Blocks faceted navigation crawl waste
          '/*?search=',  // Prevents internal search result indexing
        ],
      },
      {
        userAgent: 'GPTBot', // Modern 2026 practice: separate rules for AI bots
        disallow: ['/'],     // Optional: block AI from scraping products for training
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}