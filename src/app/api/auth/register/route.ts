import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import crypto from 'crypto';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/resend';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar si los registros están abiertos en la plataforma
    const settings = await prisma.globalSettings.findUnique({
      where: { id: 'default' },
    });

    if (settings && settings.registrationsOpen === false) {
      return NextResponse.json(
        { success: false, error: 'El registro de nuevas cuentas está temporalmente deshabilitado por el administrador.' },
        { status: 403 }
      );
    }

    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Validación de formato de email
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa un correo electrónico válido' },
        { status: 400 }
      );
    }

    // 3. Validación de longitud de contraseña
    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener entre 6 y 128 caracteres' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una cuenta con este correo electrónico' },
        { status: 409 }
      );
    }

    // El primer usuario registrado en una BD vacía se convierte en ADMIN, todos los demás en USER
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    const role = isFirstUser ? 'ADMIN' : 'USER';

    // El primer admin se marca como verificado automáticamente; las demás cuentas nuevas requieren verificación
    const emailVerified = isFirstUser;
    const verificationToken = isFirstUser ? null : crypto.randomBytes(32).toString('hex');
    const verificationExpires = isFirstUser ? null : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const passwordHash = await bcrypt.hash(password, 10);
    const cleanName = (name ? String(name).trim() : cleanEmail.split('@')[0]).slice(0, 50);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        role,
        plan: 'FREE',
        emailVerified,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        details: `Nuevo usuario registrado: ${user.email} (${user.id}) - Requiere verificación: ${!emailVerified}`,
        userId: user.id,
      },
    });

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || 'https://elysiumpad.com';

    // Si requiere verificación de correo electrónico
    if (!emailVerified && verificationToken) {
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
        requireVerification: true,
        email: user.email,
        message: '¡Cuenta creada! Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada para activar tu cuenta.',
      });
    }

    // Para el primer Admin inicial verificado automáticamente
    sendWelcomeEmail({ to: user.email, name: user.name || undefined }).catch((err) => {
      console.error('[Resend Welcome Error]', err);
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });

    const response = NextResponse.json({
      success: true,
      requireVerification: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
    });

    // Solo marcar secure si la petición realmente vino por HTTPS (evita que navegadores descarten la cookie en conexiones HTTP)
    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
