import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/resend';

import { getPublicOrigin } from '@/lib/origin';

export async function GET(req: NextRequest) {
  const origin = getPublicOrigin(req);

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.redirect(new URL('/login?error=token_missing', origin));
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=token_invalid_or_expired', origin));
    }

    // Activar usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Auditoría
    await prisma.auditLog.create({
      data: {
        action: 'EMAIL_VERIFIED',
        details: `Correo verificado exitosamente para: ${updatedUser.email} (${updatedUser.id})`,
        userId: updatedUser.id,
      },
    });

    // Enviar correo de bienvenida oficial
    sendWelcomeEmail({ to: updatedUser.email, name: updatedUser.name || undefined }).catch((err) => {
      console.error('[Resend Welcome Error]', err);
    });

    // Autologin directo: generar cookie de sesión
    const jwtToken = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      plan: updatedUser.plan,
    });

    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:' || origin.startsWith('https:');
    const targetPath = updatedUser.role === 'ADMIN' ? '/admin?verified=true' : '/dashboard?verified=true';
    const redirectUrl = new URL(targetPath, origin);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: jwtToken,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', origin));
  }
}
