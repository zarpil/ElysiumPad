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

    // Verificación de limitación Freemium configurable desde Ajustes Globales
    if (user.plan === 'FREE') {
      const settings = await prisma.globalSettings.findUnique({ where: { id: 'default' } });
      const maxAllowed = settings?.freePlanMaxLaunchers ?? 1;
      const count = await prisma.launcherConfig.count({
        where: { userId: user.id },
      });
      if (count >= maxAllowed) {
        return NextResponse.json(
          {
            success: false,
            error: `El plan FREE permite hasta ${maxAllowed} launcher${maxAllowed > 1 ? 's' : ''} activo${maxAllowed > 1 ? 's' : ''}. Actualiza a PRO para crear ilimitados.`,
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

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'El nombre del launcher es obligatorio' },
        { status: 400 }
      );
    }

    const isPremiumUser = user.plan === 'PRO' || user.plan === 'LIFETIME' || user.role === 'ADMIN';
    let cleanSlug = '';

    if (!isPremiumUser) {
      // Para usuarios FREE, el slug se genera de forma aleatoria (srv-xxxxxx).
      // Si intentan forzar un slug personalizado sin ser PRO:
      if (slug && !slug.startsWith('srv-')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Personalizar el Slug URL es una función exclusiva PRO / LIFETIME. En el plan gratuito se asigna un enlace aleatorio.',
            isUpgradeRequired: true,
          },
          { status: 403 }
        );
      }
      cleanSlug = slug && slug.startsWith('srv-')
        ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
        : `srv-${Math.random().toString(36).substring(2, 8)}`;
    } else {
      if (!slug || slug.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'El slug URL personalizado es obligatorio (mínimo 2 caracteres)' },
          { status: 400 }
        );
      }
      cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }

    // Asegurar unicidad del slug
    let attempts = 0;
    while (await prisma.launcherConfig.findUnique({ where: { slug: cleanSlug } })) {
      if (!isPremiumUser) {
        cleanSlug = `srv-${Math.random().toString(36).substring(2, 8)}`;
        attempts++;
        if (attempts > 10) break;
      } else {
        return NextResponse.json(
          { success: false, error: 'Ya existe un launcher con ese identificador slug personalizado' },
          { status: 409 }
        );
      }
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
