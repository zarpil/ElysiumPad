import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function verifyAdmin() {
  const authUser = await getCurrentUser();
  return authUser && authUser.role === 'ADMIN';
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Publicación eliminada correctamente.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        coverImage: body.coverImage,
        published: body.published,
        readingTime: body.readingTime,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
