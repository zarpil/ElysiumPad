import { prisma } from './prisma';
import { SEED_POSTS, BlogPostData } from './posts-data';

/**
 * Obtiene todos los artículos publicados.
 * Prioriza la base de datos si está disponible; si no, responde con los posts semilla de alta calidad.
 */
export async function getAllPublishedPosts(): Promise<BlogPostData[]> {
  try {
    const dbPosts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });

    if (dbPosts && dbPosts.length > 0) {
      return dbPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || '',
        content: p.content,
        category: p.category,
        coverImage: p.coverImage || undefined,
        published: p.published,
        readingTime: p.readingTime || '5 min',
        views: p.views,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }
  } catch (error) {
    // Si la base de datos está offline o no tiene la tabla aún, fallback transparente a los posts semilla
  }

  return SEED_POSTS;
}

/**
 * Obtiene un post por su slug.
 */
export async function getPostBySlug(slug: string): Promise<BlogPostData | null> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (post && post.published) {
      // Incrementar contador de visitas de forma asíncrona
      prisma.blogPost
        .update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
        })
        .catch(() => {});

      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content,
        category: post.category,
        coverImage: post.coverImage || undefined,
        published: post.published,
        readingTime: post.readingTime || '5 min',
        views: post.views,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      };
    }
  } catch (error) {
    // Fallback a posts semilla
  }

  const found = SEED_POSTS.find((p) => p.slug === slug);
  return found || null;
}

/**
 * Obtiene todos los posts para el panel de administración.
 */
export async function getAdminPosts(): Promise<BlogPostData[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (posts && posts.length > 0) {
      return posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || '',
        content: p.content,
        category: p.category,
        coverImage: p.coverImage || undefined,
        published: p.published,
        readingTime: p.readingTime || '5 min',
        views: p.views,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }));
    }
  } catch (error) {
    // Fallback
  }

  return SEED_POSTS;
}
