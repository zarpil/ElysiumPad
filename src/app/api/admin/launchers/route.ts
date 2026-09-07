import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const loader = searchParams.get('loader') || '';

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { slug: { contains: query } },
        { serverIp: { contains: query } },
        { user: { email: { contains: query } } },
      ];
    }
    if (loader && loader !== 'ALL') {
      where.loader = loader;
    }

    const launchers = await prisma.launcherConfig.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            plan: true,
          },
        },
        mods: {
          select: {
            id: true,
            title: true,
            fileName: true,
            isRequired: true,
          },
        },
        _count: {
          select: {
            mods: true,
            customAssets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, launchers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id es requerido' }, { status: 400 });
    }

    const launcher = await prisma.launcherConfig.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    await prisma.launcherConfig.delete({
      where: { id },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_LAUNCHER_DELETED',
        details: `Launcher "${launcher.name}" (${launcher.slug}) del usuario ${launcher.user.email} fue eliminado por moderación.`,
      },
    });

    return NextResponse.json({ success: true, message: 'Launcher eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
