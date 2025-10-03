import type { MetadataRoute } from 'next';

const baseUrl = 'https://returnmetags.raitehu.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
