import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
        launchers: {
          include: {
            mods: { select: { id: true } },
            customAssets: { select: { id: true } },
            newsItems: { select: { id: true, isActive: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    const totalDownloads = user.launchers.reduce((acc, l) => acc + (l.downloadCount || 0), 0);
    const totalMods = user.launchers.reduce((acc, l) => acc + l.mods.length, 0);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        stats: {
          totalLaunchers: user.launchers.length,
          totalDownloads,
          totalMods,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword, confirmPassword } = body;

    const userInDb = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!userInDb) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    const updateData: any = {};

    // Update name
    if (name !== undefined) {
      updateData.name = name.trim() || null;
    }

    // Change password if requested
    if (newPassword || currentPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Debes introducir tu contraseña actual' },
          { status: 400 }
        );
      }

      if (!userInDb.passwordHash) {
        return NextResponse.json(
          { success: false, error: 'La cuenta no tiene contraseña configurada' },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, userInDb.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, error: 'La contraseña actual no es correcta' },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { success: false, error: 'La confirmación de la nueva contraseña no coincide' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
