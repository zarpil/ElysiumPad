import { NextResponse } from 'next/server';

interface MojangVersion {
  id: string;
  type: string;
  url: string;
  time: string;
  releaseTime: string;
}

interface MojangManifest {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: MojangVersion[];
}

// Fallback por si Mojang API estuviese temporalmente caída
const FALLBACK_VERSIONS = [
  '26.2', '26.1.2', '26.1.1', '26.1',
  '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21',
  '1.20.6', '1.20.5', '1.20.4', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19',
  '1.18.2', '1.18.1', '1.17.1',
  '1.16.5', '1.16.4', '1.12.2', '1.8.9', '1.7.10'
];

export async function GET() {
  try {
    const res = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json', {
      next: { revalidate: 3600 }, // Caché de 1 hora
      headers: {
        'User-Agent': 'ElysiumPad-LauncherSaaS/1.0',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al consultar Mojang`);
    }

    const data: MojangManifest = await res.json();
    const releases = data.versions
      .filter((v) => v.type === 'release')
      .map((v) => v.id);

    return NextResponse.json({
      success: true,
      latest: data.latest,
      releases: releases.length > 0 ? releases : FALLBACK_VERSIONS,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error fetching Mojang versions:', error);
    return NextResponse.json({
      success: true,
      fallback: true,
      latest: {
        release: FALLBACK_VERSIONS[0],
        snapshot: `${FALLBACK_VERSIONS[0]}-pre`,
      },
      releases: FALLBACK_VERSIONS,
    });
  }
}
