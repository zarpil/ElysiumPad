import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getAdminPosts } from '@/lib/blog-service';

async function verifyAdmin() {
  const authUser = await getCurrentUser();
  return authUser && authUser.role === 'ADMIN';
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const posts = await getAdminPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, slug, excerpt, content, category, coverImage, published, readingTime } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'El título y el contenido son obligatorios.' },
        { status: 400 }
      );
    }

    // Generar slug limpio
    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const newPost = await prisma.blogPost.create({
      data: {
        title,
        slug: cleanSlug,
        excerpt: excerpt || null,
        content,
        category: category || 'Minecraft',
        coverImage: coverImage || null,
        published: published ?? true,
        readingTime: readingTime || '5 min',
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe una publicación con ese slug o título similar.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
