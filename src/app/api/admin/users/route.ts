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
    const planFilter = searchParams.get('plan') || undefined;
    const roleFilter = searchParams.get('role') || undefined;
    const statusFilter = searchParams.get('status') || undefined;

    const where: any = {};
    if (query) {
      where.OR = [
        { email: { contains: query } },
        { name: { contains: query } },
      ];
    }
    if (planFilter && ['FREE', 'PRO', 'LIFETIME'].includes(planFilter)) {
      where.plan = planFilter;
    }
    if (roleFilter && ['USER', 'ADMIN'].includes(roleFilter)) {
      where.role = roleFilter;
    }
    if (statusFilter && ['ACTIVE', 'SUSPENDED'].includes(statusFilter)) {
      where.status = statusFilter;
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        launchers: {
          select: {
            id: true,
            slug: true,
            name: true,
            mcVersion: true,
            loader: true,
            _count: {
              select: { mods: true, customAssets: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, users });
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
    const { userId, plan, status, role } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId es requerido' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(plan ? { plan } : {}),
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_USER_UPDATED',
        details: `Usuario ${updatedUser.email} actualizado: Plan=${updatedUser.plan}, Status=${updatedUser.status}, Role=${updatedUser.role}`,
        userId: updatedUser.id,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'id requerido' }, { status: 400 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_USER_DELETED',
        details: `Usuario ${deletedUser.email} (${deletedUser.id}) eliminado por el Administrador`,
      },
    });

    return NextResponse.json({ success: true, message: 'Usuario eliminado' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
