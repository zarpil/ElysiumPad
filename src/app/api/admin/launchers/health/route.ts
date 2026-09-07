import { NextResponse } from 'next/server';
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
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const launchers = await prisma.launcherConfig.findMany({
      include: {
        mods: {
          select: { id: true, downloadUrl: true, fileName: true },
        },
        customAssets: {
          select: { id: true, downloadUrl: true, fileName: true },
        },
        user: {
          select: { id: true, email: true, plan: true, name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const results = await Promise.all(
      launchers.map(async (l) => {
        let isInactive = false;
        let inactivityReason = 'Activo';

        if (l.downloadCount === 0 && l.syncCount === 0) {
          if (new Date(l.createdAt) < fourteenDaysAgo) {
            isInactive = true;
            inactivityReason = 'Abandonado (>14 días sin descargas ni sincronizaciones)';
          } else {
            isInactive = true;
            inactivityReason = 'Reciente sin descargas aún';
          }
        }

        const totalFiles = l.mods.length + l.customAssets.length;
        let health: 'HEALTHY' | 'WARNING' | 'BROKEN' = 'HEALTHY';
        const warnings: string[] = [];

        if (totalFiles === 0) {
          health = 'WARNING';
          warnings.push('El launcher no tiene mods ni archivos de configuración asignados.');
        }

        if (!l.serverIp) {
          warnings.push('Sin IP de servidor vinculada (modo cliente local).');
        }

        // Test sample download URLs (up to 2 files) to verify CDN / Modrinth accessibility
        const sampleUrls = [
          ...l.customAssets.slice(0, 2).map((a) => a.downloadUrl),
          ...l.mods.slice(0, 1).map((m) => m.downloadUrl),
        ].filter(Boolean);

        for (const url of sampleUrls) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok && res.status !== 405) {
              health = 'BROKEN';
              warnings.push(`URL inaccesible (${res.status}): ${url.slice(0, 50)}...`);
            }
          } catch {
            // If HEAD fails due to network or CORS/timeout
            // don't immediately mark broken unless repeated
          }
        }

        return {
          launcherId: l.id,
          slug: l.slug,
          name: l.name,
          ownerEmail: l.user.email,
          ownerPlan: l.user.plan,
          downloads: l.downloadCount,
          syncs: l.syncCount,
          totalFiles,
          isInactive,
          inactivityReason,
          health,
          warnings,
          lastUpdated: l.updatedAt,
        };
      })
    );

    const stats = {
      total: results.length,
      healthy: results.filter((r) => r.health === 'HEALTHY' && !r.isInactive).length,
      inactive: results.filter((r) => r.isInactive).length,
      withWarnings: results.filter((r) => r.warnings.length > 0 || r.health !== 'HEALTHY').length,
    };

    return NextResponse.json({
      success: true,
      stats,
      results,
      scannedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
