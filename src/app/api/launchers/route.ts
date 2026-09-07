import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 }
      );
    }
    const launchers = await prisma.launcherConfig.findMany({
      where: { userId: user.id },
      include: {
        mods: true,
        customAssets: true,
        newsItems: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      launchers,
      userPlan: user.plan,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado. Inicia sesión para continuar.' },
        { status: 401 }
      );
    }
    const body = await req.json();

    // Verificación de limitación Freemium: solo 1 launcher si es FREE
    if (user.plan === 'FREE') {
      const count = await prisma.launcherConfig.count({
        where: { userId: user.id },
      });
      if (count >= 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'El plan FREE solo permite 1 launcher activo. Actualiza a PRO para crear ilimitados.',
            isUpgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    const {
      name,
      slug,
      description,
      mcVersion,
      loader,
      loaderVersion,
      primaryColor,
      serverIp,
      serverPort,
      allowOffline,
      recommendedRamGb,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'Nombre e identificador (slug) son obligatorios' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const existing = await prisma.launcherConfig.findUnique({
      where: { slug: cleanSlug },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un launcher con ese identificador slug' },
        { status: 409 }
      );
    }

    const newLauncher = await prisma.launcherConfig.create({
      data: {
        userId: user.id,
        name,
        slug: cleanSlug,
        description,
        mcVersion: mcVersion || '1.20.1',
        loader: loader || 'FABRIC',
        loaderVersion: loaderVersion || null,
        primaryColor: primaryColor || '#10b981',
        serverIp: serverIp || null,
        serverPort: Number(serverPort) || 25565,
        allowOffline: allowOffline ?? true,
        recommendedRamGb: Number(recommendedRamGb) || 4,
      },
    });

    return NextResponse.json({ success: true, launcher: newLauncher });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
