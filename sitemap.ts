import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com';
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/size-guide`, lastModified: new Date() },
    { url: `${baseUrl}/sustainability`, lastModified: new Date() },
    { url: `${baseUrl}/foundation`, lastModified: new Date() },
  ];
}