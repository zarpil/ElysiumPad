import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
    const body = await req.json();
    const {
      maintenanceMode,
      registrationsOpen,
      bannerAnnouncement,
      bannerType,
      freePlanMaxLaunchers,
      adsEnabled,
      adBannerImg,
      adBannerLink,
      adBannerText,
    } = body;

    const data: any = {};
    if (typeof maintenanceMode === 'boolean') data.maintenanceMode = maintenanceMode;
    if (typeof registrationsOpen === 'boolean') data.registrationsOpen = registrationsOpen;
    if (bannerAnnouncement !== undefined) data.bannerAnnouncement = bannerAnnouncement === '' ? null : bannerAnnouncement;
    if (bannerType && ['INFO', 'WARNING', 'CRITICAL', 'PROMO'].includes(bannerType)) data.bannerType = bannerType;
    if (typeof freePlanMaxLaunchers === 'number') data.freePlanMaxLaunchers = Math.max(1, freePlanMaxLaunchers);
    if (typeof adsEnabled === 'boolean') data.adsEnabled = adsEnabled;
    if (adBannerImg !== undefined) data.adBannerImg = adBannerImg === '' ? null : adBannerImg;
    if (adBannerLink !== undefined) data.adBannerLink = adBannerLink === '' ? null : adBannerLink;
    if (adBannerText !== undefined) data.adBannerText = adBannerText === '' ? null : adBannerText;

    const settings = await prisma.globalSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: {
        id: 'default',
        ...data,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'GLOBAL_SETTINGS_UPDATED',
        details: `Ajustes globales actualizados: Mantenimiento=${settings.maintenanceMode}, Registros=${settings.registrationsOpen}, Banner=${settings.bannerAnnouncement || 'Ninguno'}`,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
