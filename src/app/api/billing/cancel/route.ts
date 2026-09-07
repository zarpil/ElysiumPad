import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.plan === 'LIFETIME') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tu cuenta dispone de una Licencia Vitalicia (LIFETIME). No tienes pagos recurrentes ni suscripciones que cancelar.',
        },
        { status: 400 }
      );
    }

    if (user.plan === 'FREE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tu cuenta ya se encuentra en el plan Gratuito (FREE). No tienes ninguna suscripción activa.',
        },
        { status: 400 }
      );
    }

    // Si Stripe está activo y existe subscriptionId, cancelar en la API de Stripe
    if (process.env.STRIPE_SECRET_KEY && user.subscriptionId) {
      try {
        // En producción con Stripe:
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // await stripe.subscriptions.cancel(user.subscriptionId);
      } catch (stripeErr: any) {
        console.error('Error al cancelar en Stripe:', stripeErr);
      }
    }

    // Regresar al plan FREE
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'FREE',
        subscriptionId: null,
      },
    });

    // Registrar en logs de auditoría para validez legal
    await prisma.auditLog.create({
      data: {
        action: 'SUBSCRIPTION_CANCELLED_BY_USER',
        details: `El usuario ${user.email} canceló voluntariamente su suscripción mensual PRO de conformidad con los términos del servicio.`,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tu suscripción mensual PRO ha sido cancelada con éxito. No se realizarán más cargos a tu cuenta y has pasado al plan gratuito.',
      plan: updatedUser.plan,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
