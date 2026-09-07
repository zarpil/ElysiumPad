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
        mods: true,
        customAssets: true,
        newsItems: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, launcher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    const existing = await prisma.launcherConfig.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para modificar este launcher' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      slug: newSlug,
      description,
      mcVersion,
      loader,
      loaderVersion,
      primaryColor,
      serverIp,
      serverPort,
      logoUrl,
      bannerUrl,
      windowTitle,
      allowOffline,
      minRamGb,
      recommendedRamGb,
      jvmArgs,
      broadcastEnabled,
      broadcastTitle,
      broadcastMessage,
      broadcastTag,
      broadcastLink,
      broadcastBtnText,
      broadcastImage,
    } = body;

    const isPremiumUser = user.plan === 'PRO' || user.plan === 'LIFETIME' || user.role === 'ADMIN';
    let targetSlug = existing.slug;

    if (newSlug && newSlug !== existing.slug) {
      if (!isPremiumUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Modificar el Slug URL es una función exclusiva PRO / LIFETIME.',
            isUpgradeRequired: true,
          },
          { status: 403 }
        );
      }

      const cleanNewSlug = String(newSlug).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      if (cleanNewSlug.length < 2) {
        return NextResponse.json(
          { success: false, error: 'El slug debe tener al menos 2 caracteres' },
          { status: 400 }
        );
      }

      const slugTaken = await prisma.launcherConfig.findUnique({
        where: { slug: cleanNewSlug },
      });
      if (slugTaken && slugTaken.id !== existing.id) {
        return NextResponse.json(
          { success: false, error: 'Este slug ya está en uso por otro launcher' },
          { status: 409 }
        );
      }

      targetSlug = cleanNewSlug;
    }

    const launcher = await prisma.launcherConfig.update({
      where: { slug },
      data: {
        slug: targetSlug,
        name,
        description,
        mcVersion,
        loader,
        loaderVersion,
        primaryColor,
        serverIp: serverIp ? serverIp.trim() : null,
        serverPort: Number(serverPort) || 25565,
        logoUrl,
        bannerUrl,
        windowTitle,
        allowOffline: allowOffline ?? true,
        minRamGb: Number(minRamGb) || 2,
        recommendedRamGb: Number(recommendedRamGb) || 4,
        jvmArgs,
        broadcastEnabled: broadcastEnabled ?? false,
        broadcastTitle: broadcastTitle ?? null,
        broadcastMessage: broadcastMessage ?? null,
        broadcastTag: broadcastTag ?? 'NOVEDAD',
        broadcastLink: broadcastLink ?? null,
        broadcastBtnText: broadcastBtnText ?? 'Ver Más',
        broadcastImage: broadcastImage ?? null,
      },
    });

    return NextResponse.json({ success: true, launcher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    const existing = await prisma.launcherConfig.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    if (existing.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para eliminar este launcher' },
        { status: 403 }
      );
    }

    await prisma.launcherConfig.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true, message: 'Launcher eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
