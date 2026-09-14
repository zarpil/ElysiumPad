import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/terms',
          '/privacy',
          '/contact',
          '/docs',
          '/d/',
          '/login',
          '/register',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/dashboard',
          '/dashboard/',
          '/profile',
          '/profile/',
          '/api/',
          '/reset-password',
          '/forgot-password',
        ],
      },
      {
        // Aseguramos acceso explícito para el bot de rastreo de AdSense
        userAgent: 'Mediapartners-Google',
        allow: ['/', '/terms', '/privacy', '/contact', '/docs', '/d/'],
        disallow: ['/admin', '/admin/', '/dashboard', '/dashboard/', '/api/'],
      },
    ],
    sitemap: 'https://elysiumpad.com/sitemap.xml',
  };
}
