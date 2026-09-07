import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }
    const totalUsers = await prisma.user.count();
    const freeUsers = await prisma.user.count({ where: { plan: 'FREE' } });
    const proUsers = await prisma.user.count({ where: { plan: 'PRO' } });
    const lifetimeUsers = await prisma.user.count({ where: { plan: 'LIFETIME' } });
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } });
    const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } });

    const totalLaunchers = await prisma.launcherConfig.count();
    const totalMods = await prisma.modItem.count();
    const totalCustomAssets = await prisma.customAsset.count();

    // Aggregates
    const statsAgg = await prisma.launcherConfig.aggregate({
      _sum: {
        downloadCount: true,
        syncCount: true,
      },
    });

    // Pricing & MRR calculations
    const PRO_PRICE = 4.99;
    const LIFETIME_PRICE = 49.0;
    const estimatedMrr = proUsers * PRO_PRICE;
    const estimatedArr = estimatedMrr * 12;
    const estimatedTotalRevenue = proUsers * PRO_PRICE + lifetimeUsers * LIFETIME_PRICE;

    // Conversion rate
    const paidUsers = proUsers + lifetimeUsers;
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
    const arpu = totalUsers > 0 ? estimatedTotalRevenue / totalUsers : 0;

    // Breakdown by Loaders
    const fabricCount = await prisma.launcherConfig.count({ where: { loader: 'FABRIC' } });
    const forgeCount = await prisma.launcherConfig.count({ where: { loader: 'FORGE' } });
    const neoforgeCount = await prisma.launcherConfig.count({ where: { loader: 'NEOFORGE' } });
    const quiltCount = await prisma.launcherConfig.count({ where: { loader: 'QUILT' } });

    // Recent activity count
    const recentAuditCount = await prisma.auditLog.count();

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          free: freeUsers,
          pro: proUsers,
          lifetime: lifetimeUsers,
          active: activeUsers,
          suspended: suspendedUsers,
        },
        financials: {
          mrr: estimatedMrr,
          arr: estimatedArr,
          totalRevenue: estimatedTotalRevenue,
          arpu: arpu,
          conversionRate: conversionRate,
        },
        launchers: {
          total: totalLaunchers,
          totalMods,
          totalCustomAssets,
          totalDownloads: statsAgg._sum.downloadCount || 0,
          totalSyncs: statsAgg._sum.syncCount || 0,
        },
        breakdowns: {
          loaders: {
            fabric: fabricCount,
            forge: forgeCount,
            neoforge: neoforgeCount,
            quilt: quiltCount,
          },
        },
        recentAuditCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
