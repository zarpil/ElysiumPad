import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const launcher = await prisma.launcherConfig.findUnique({
      where: { slug },
      include: {
        newsItems: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, news: launcher.newsItems });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { title, content, tag, link, btnText, imageUrl, isPinned, isActive } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'El título y el contenido son obligatorios' },
        { status: 400 }
      );
    }

    const launcher = await prisma.launcherConfig.findUnique({
      where: { slug },
      include: { user: { select: { plan: true } } },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    if (launcher.user.plan === 'FREE') {
      return NextResponse.json(
        { success: false, error: 'La publicación de noticias comunitarias requiere Plan PRO o Lifetime' },
        { status: 403 }
      );
    }

    const newsItem = await prisma.launcherNews.create({
      data: {
        launcherId: launcher.id,
        title: title.trim(),
        content: content.trim(),
        tag: tag || 'NOVEDAD',
        link: link ? link.trim() : null,
        btnText: btnText ? btnText.trim() : 'Ver Más',
        imageUrl: imageUrl ? imageUrl.trim() : null,
        isPinned: Boolean(isPinned),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, newsItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { id, title, content, tag, link, btnText, imageUrl, isPinned, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de noticia requerido' }, { status: 400 });
    }

    const updated = await prisma.launcherNews.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
        ...(tag !== undefined && { tag }),
        ...(link !== undefined && { link: link ? link.trim() : null }),
        ...(btnText !== undefined && { btnText: btnText ? btnText.trim() : 'Ver Más' }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? imageUrl.trim() : null }),
        ...(isPinned !== undefined && { isPinned: Boolean(isPinned) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, newsItem: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get('newsId');

    if (!newsId) {
      return NextResponse.json({ success: false, error: 'ID de noticia requerido' }, { status: 400 });
    }

    await prisma.launcherNews.delete({
      where: { id: newsId },
    });

    return NextResponse.json({ success: true, message: 'Noticia eliminada' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
