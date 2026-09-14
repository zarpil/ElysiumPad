import { MetadataRoute } from 'next';
import { getAllPublishedPosts } from '@/lib/blog-service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://elysiumpad.com';
  const posts = await getAllPublishedPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/docs/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.createdAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...postEntries,
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}

