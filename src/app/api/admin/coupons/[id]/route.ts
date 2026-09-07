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

// Actualizar estado activo o detalles del cupón
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(typeof body.isActive === 'boolean' && { isActive: body.isActive }),
        ...(body.maxUses !== undefined && { maxUses: Number(body.maxUses) }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Eliminar un cupón
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Cupón eliminado correctamente.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
