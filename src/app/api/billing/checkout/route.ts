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
    const { plan } = body;

    if (!plan || !['PRO', 'LIFETIME'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Plan inválido. Debe ser PRO o LIFETIME' },
        { status: 400 }
      );
    }

    // Si hay credenciales de Stripe configuradas, se crearía una sesión de Stripe Checkout
    if (process.env.STRIPE_SECRET_KEY) {
      // Integración Stripe futura para producción
      // const session = await stripe.checkout.sessions.create(...)
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
        details: `Usuario ${updatedUser.email} actualizó su suscripción al plan ${plan}`,
        userId: updatedUser.id,
      },
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
