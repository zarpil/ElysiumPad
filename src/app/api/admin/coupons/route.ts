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

// Listar todos los cupones
export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Se requieren privilegios de Administrador.' },
        { status: 403 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Crear un nuevo cupón
export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, discountPercent, maxUses, expiresAt, description } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Código de cupón requerido.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const discount = Number(discountPercent);

    if (isNaN(discount) || discount <= 0 || discount > 100) {
      return NextResponse.json({ success: false, error: 'El porcentaje de descuento debe estar entre 1 y 100%.' }, { status: 400 });
    }

    // Verificar si ya existe
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: `El código "${cleanCode}" ya existe.` }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountPercent: discount,
        maxUses: maxUses ? Number(maxUses) : 100,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description: description?.trim() || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
