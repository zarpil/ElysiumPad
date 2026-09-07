import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.globalSettings.findUnique({
      where: { id: 'default' },
      select: {
        maintenanceMode: true,
        registrationsOpen: true,
        bannerAnnouncement: true,
        bannerType: true,
        adsEnabled: true,
        adBannerImg: true,
        adBannerLink: true,
        adBannerText: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings: settings || {
        maintenanceMode: false,
        registrationsOpen: true,
        bannerAnnouncement: null,
        bannerType: 'INFO',
        adsEnabled: true,
        adBannerImg: null,
        adBannerLink: null,
        adBannerText: 'Servidores de Minecraft de alto rendimiento • Patrocinado',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      settings: {
        maintenanceMode: false,
        registrationsOpen: true,
        bannerAnnouncement: null,
        bannerType: 'INFO',
        adsEnabled: true,
        adBannerImg: null,
        adBannerLink: null,
        adBannerText: 'Servidores de Minecraft de alto rendimiento • Patrocinado',
      },
    });
  }
}
