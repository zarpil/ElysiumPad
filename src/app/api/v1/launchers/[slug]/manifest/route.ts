import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
          where: { isActive: true },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        },
        user: {
          select: { plan: true },
        },
      },
    });

    if (!launcher) {
      return NextResponse.json(
        { success: false, error: 'Launcher no encontrado o inexistente' },
        { status: 404 }
      );
    }

    const isFree = launcher.user.plan === 'FREE';

    const globalSettings = await prisma.globalSettings.findUnique({
      where: { id: 'default' },
    });

    // Generar manifiesto compatible con el Launcher
    const manifest = {
      schemaVersion: 1,
      id: launcher.id,
      slug: launcher.slug,
      name: launcher.name,
      description: launcher.description,
      
      // Minecraft & Loader
      game: {
        version: launcher.mcVersion,
        loader: launcher.loader,
        loaderVersion: launcher.loaderVersion,
      },

      // Publicidad en Launcher (Estilo Aternos: solo en servidores Plan FREE)
      ads: {
        enabled: isFree && (globalSettings?.adsEnabled ?? true),
        bannerImg: globalSettings?.adBannerImg || null,
        link: globalSettings?.adBannerLink || null,
        text: globalSettings?.adBannerText || 'Servidores de Minecraft de alto rendimiento • Patrocinado',
      },

      // Novedades y Anuncios Comunitarios del Servidor (Exclusivo PRO / LIFETIME)
      news: !isFree
        ? launcher.newsItems.map((item) => ({
            id: item.id,
            tag: item.tag,
            title: item.title,
            content: item.content,
            link: item.link,
            buttonText: item.btnText,
            image: item.imageUrl,
            isPinned: item.isPinned,
            createdAt: item.createdAt,
          }))
        : [],

      // Anuncio destacado principal
      broadcast: (!isFree && (launcher.newsItems.length > 0 || (launcher.broadcastEnabled && launcher.broadcastTitle)))
        ? {
            enabled: true,
            tag: launcher.newsItems[0]?.tag || launcher.broadcastTag || 'NOVEDAD',
            title: launcher.newsItems[0]?.title || launcher.broadcastTitle || '',
            message: launcher.newsItems[0]?.content || launcher.broadcastMessage || '',
            link: launcher.newsItems[0]?.link || launcher.broadcastLink || null,
            buttonText: launcher.newsItems[0]?.btnText || launcher.broadcastBtnText || 'Ver Más',
            image: launcher.newsItems[0]?.imageUrl || launcher.broadcastImage || null,
          }
        : {
            enabled: false,
          },

      // Configuración estética y cliente
      ui: {
        primaryColor: launcher.primaryColor,
        windowTitle: launcher.windowTitle || launcher.name,
        logoUrl: launcher.logoUrl,
        bannerUrl: launcher.bannerUrl,
        showWatermark: isFree, // Branding "Powered by ElysiumPad" si es Free
      },

      // Servidor preconfigurado
      server: launcher.serverIp
        ? {
            ip: launcher.serverIp,
            port: launcher.serverPort,
          }
        : null,

      // Reglas de ejecución
      runtime: {
        javaVersion: (() => {
          const v = launcher.mcVersion || '';
          if (v.startsWith('1.7') || v.startsWith('1.8') || v.startsWith('1.12') || v.startsWith('1.16')) return 8;
          if (v.startsWith('1.17') || v.startsWith('1.18') || v.startsWith('1.19') || v === '1.20' || v.startsWith('1.20.1') || v.startsWith('1.20.2') || v.startsWith('1.20.3') || v.startsWith('1.20.4')) return 17;
          return 21;
        })(),
        allowOffline: launcher.allowOffline,
        minRamGb: launcher.minRamGb,
        recommendedRamGb: launcher.recommendedRamGb,
        jvmArgs: launcher.jvmArgs,
      },

      // Archivos a sincronizar
      files: {
        mods: launcher.mods.map((mod) => ({
          id: mod.id,
          name: mod.fileName,
          path: `mods/${mod.fileName}`,
          url: mod.downloadUrl,
          size: mod.fileSize,
          hashes: {
            sha1: mod.sha1,
            sha512: mod.sha512,
          },
          required: mod.isRequired,
          clientSide: mod.clientSide,
        })),
        
        custom: isFree
          ? [] // Clientes FREE no tienen mods custom de R2
          : launcher.customAssets.map((asset) => ({
              id: asset.id,
              name: asset.fileName,
              path: asset.fileName,
              url: asset.downloadUrl,
              size: asset.fileSize,
              hashes: {
                sha1: asset.sha1,
                sha256: asset.sha256,
              },
              type: asset.assetType,
            })),
      },
    };

    return NextResponse.json(manifest, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, s-maxage=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
