import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, valid: false, error: 'Ingresa un código promocional.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `El cupón "${cleanCode}" no existe.`,
      }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Este cupón de descuento ya no está activo.',
      }, { status: 400 });
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Este cupón ha caducado.',
      }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Este cupón ha alcanzado el límite máximo de usos disponibles.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        description: coupon.description,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, valid: false, error: error.message }, { status: 500 });
  }
}
