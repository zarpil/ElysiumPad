import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendPlanUpgradedEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { plan, couponCode } = body;

    if (!plan || !['PRO', 'LIFETIME'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Plan inválido. Debe ser PRO o LIFETIME' },
        { status: 400 }
      );
    }

    let appliedDiscount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date() <= new Date(coupon.expiresAt)) && coupon.usedCount < coupon.maxUses) {
        appliedDiscount = coupon.discountPercent;
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    // Activación instantánea para autosuficiencia / desarrollo / pagos directos
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: { plan },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'USER_PLAN_UPGRADED',
        details: `Usuario ${updatedUser.email} actualizó al plan ${plan}${appliedDiscount > 0 ? ` con cupón ${couponCode} (${appliedDiscount}% desc)` : ''}`,
        userId: updatedUser.id,
      },
    });

    // Enviar correo transaccional de confirmación en segundo plano
    sendPlanUpgradedEmail({
      to: updatedUser.email,
      name: updatedUser.name || undefined,
      plan: updatedUser.plan,
    }).catch((err) => {
      console.error('[Resend Upgrade Email Error]', err);
    });

    return NextResponse.json({
      success: true,
      upgraded: true,
      plan: updatedUser.plan,
      message: `¡Felicidades! Tu cuenta ha sido actualizada al plan ${plan}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
