import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Correo electrónico requerido' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Si el usuario no existe o ya está verificado, respondemos éxito genérico para no filtrar emails
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si la dirección está registrada y pendiente de verificación, se ha enviado un nuevo enlace.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: false,
        error: 'Esta cuenta ya está verificada. Puedes iniciar sesión directamente.',
      });
    }

    // Generar nuevo token con 24 horas de expiración
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || 'https://elysiumpad.com';
    const verificationUrl = `${origin}/api/auth/verify-email?token=${verificationToken}`;

    sendVerificationEmail({
      to: user.email,
      name: user.name || undefined,
      verificationUrl,
    }).catch((err) => {
      console.error('[Resend Verification Error]', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Te hemos enviado un nuevo correo de activación. Por favor revisa tu bandeja de entrada (y la carpeta de spam).',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
