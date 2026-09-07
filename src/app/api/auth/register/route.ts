import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/resend';

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
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const passwordHash = await bcrypt.hash(password, 10);
    const cleanName = (name ? String(name).trim() : cleanEmail.split('@')[0]).slice(0, 50);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        role,
        plan: 'FREE',
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        action: 'USER_REGISTERED',
        details: `Nuevo usuario registrado: ${user.email} (${user.id})`,
        userId: user.id,
      },
    });

    // Enviar correo transaccional de bienvenida con Resend (en segundo plano)
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
