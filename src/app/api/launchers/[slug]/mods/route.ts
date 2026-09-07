import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { slug } = await params;
    const launcher = await prisma.launcherConfig.findUnique({
      where: { slug },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    if (launcher.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await req.json();
    const {
      modrinthId,
      versionId,
      title,
      fileName,
      downloadUrl,
      fileSize,
      sha1,
      sha512,
      iconUrl,
    } = body;

    const existing = await prisma.modItem.findFirst({
      where: {
        launcherId: launcher.id,
        modrinthId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Este mod ya está añadido al launcher' },
        { status: 400 }
      );
    }

    const mod = await prisma.modItem.create({
      data: {
        launcherId: launcher.id,
        modrinthId,
        versionId,
        title,
        fileName,
        downloadUrl,
        fileSize: Number(fileSize) || 0,
        sha1: sha1 || null,
        sha512: sha512 || null,
        iconUrl: iconUrl || null,
      },
    });

    return NextResponse.json({ success: true, mod });
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
    const launcher = await prisma.launcherConfig.findUnique({
      where: { slug },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    if (launcher.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const modId = searchParams.get('modId');

    if (!modId) {
      return NextResponse.json({ success: false, error: 'modId requerido' }, { status: 400 });
    }

    const mod = await prisma.modItem.findFirst({
      where: { id: modId, launcherId: launcher.id },
    });

    if (!mod) {
      return NextResponse.json({ success: false, error: 'Mod no encontrado en este launcher' }, { status: 404 });
    }

    await prisma.modItem.delete({
      where: { id: modId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
