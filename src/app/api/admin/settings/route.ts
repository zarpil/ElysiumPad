import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function verifyAdmin() {
  const authUser = await getCurrentUser();
  if (!authUser || authUser.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    let settings = await prisma.globalSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: {
          id: 'default',
          maintenanceMode: false,
          registrationsOpen: true,
          bannerAnnouncement: null,
          bannerType: 'INFO',
          freePlanMaxLaunchers: 1,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      maintenanceMode,
      registrationsOpen,
      bannerAnnouncement,
      bannerType,
      freePlanMaxLaunchers,
      adsEnabled,
      adProvider,
      adMavenTagScript,
      adMavenBannerHtml,
      adMavenPopunderUrl,
      adCustomScript,
      adBannerImg,
      adBannerLink,
      adBannerText,
      adsWebDashboard,
      adsWebDownload,
      adsLauncher,
    } = body;

    const settings = await prisma.globalSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(typeof maintenanceMode === 'boolean' ? { maintenanceMode } : {}),
        ...(typeof registrationsOpen === 'boolean' ? { registrationsOpen } : {}),
        ...(bannerAnnouncement !== undefined ? { bannerAnnouncement } : {}),
        ...(bannerType ? { bannerType } : {}),
        ...(freePlanMaxLaunchers ? { freePlanMaxLaunchers: Number(freePlanMaxLaunchers) } : {}),
        ...(typeof adsEnabled === 'boolean' ? { adsEnabled } : {}),
        ...(adProvider ? { adProvider } : {}),
        ...(adMavenTagScript !== undefined ? { adMavenTagScript } : {}),
        ...(adMavenBannerHtml !== undefined ? { adMavenBannerHtml } : {}),
        ...(adMavenPopunderUrl !== undefined ? { adMavenPopunderUrl } : {}),
        ...(adCustomScript !== undefined ? { adCustomScript } : {}),
        ...(adBannerImg !== undefined ? { adBannerImg } : {}),
        ...(adBannerLink !== undefined ? { adBannerLink } : {}),
        ...(adBannerText !== undefined ? { adBannerText } : {}),
        ...(typeof adsWebDashboard === 'boolean' ? { adsWebDashboard } : {}),
        ...(typeof adsWebDownload === 'boolean' ? { adsWebDownload } : {}),
        ...(typeof adsLauncher === 'boolean' ? { adsLauncher } : {}),
      },
      create: {
        id: 'default',
        maintenanceMode: maintenanceMode ?? false,
        registrationsOpen: registrationsOpen ?? true,
        bannerAnnouncement: bannerAnnouncement ?? null,
        bannerType: bannerType ?? 'INFO',
        freePlanMaxLaunchers: Number(freePlanMaxLaunchers) || 1,
        adsEnabled: adsEnabled ?? true,
        adProvider: adProvider ?? 'CUSTOM',
        adMavenTagScript: adMavenTagScript ?? null,
        adMavenBannerHtml: adMavenBannerHtml ?? null,
        adMavenPopunderUrl: adMavenPopunderUrl ?? null,
        adCustomScript: adCustomScript ?? null,
        adBannerImg: adBannerImg ?? null,
        adBannerLink: adBannerLink ?? null,
        adBannerText: adBannerText ?? 'Alojamiento de Minecraft de alto rendimiento • Patrocinado',
        adsWebDashboard: adsWebDashboard ?? true,
        adsWebDownload: adsWebDownload ?? true,
        adsLauncher: adsLauncher ?? true,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
