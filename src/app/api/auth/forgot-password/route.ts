import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Por favor introduce un correo electrónico válido.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Para evitar enumeración de usuarios, devolvemos siempre respuesta genérica positiva
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si la dirección está registrada, recibirás un correo con las instrucciones en breve.',
      });
    }

    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validez

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET_REQUESTED',
        details: `Solicitud de restablecimiento de contraseña para: ${user.email}`,
        userId: user.id,
      },
    });

    const origin = req.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Enviar correo con Resend en segundo plano
    sendPasswordResetEmail({
      to: user.email,
      name: user.name || undefined,
      resetUrl,
    }).catch((err) => {
      console.error('[Resend Reset Email Error]', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Si la dirección está registrada, recibirás un correo con las instrucciones en breve.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
