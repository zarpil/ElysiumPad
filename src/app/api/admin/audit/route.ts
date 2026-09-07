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

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const action = searchParams.get('action') || '';

    const where: any = {};
    if (query) {
      where.OR = [
        { details: { contains: query } },
        { action: { contains: query } },
        { user: { email: { contains: query } } },
      ];
    }
    if (action && action !== 'ALL') {
      where.action = action;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
