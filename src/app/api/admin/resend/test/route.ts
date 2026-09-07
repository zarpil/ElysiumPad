import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';

async function verifyAdmin() {
  const authUser = await getCurrentUser();
  if (!authUser || authUser.role !== 'ADMIN') {
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    const body = await req.json();
    const { targetEmail } = body;

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresa un correo de destino válido.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const isConfigured = !!apiKey;

    if (!isConfigured) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY no está configurada en las variables de entorno de tu servidor o archivo .env.',
      }, { status: 400 });
    }

    const result = await sendEmail({
      to: targetEmail,
      subject: '🧪 Prueba de Conexión de Correo - ElysiumPad',
      html: `
        <div style="font-family: sans-serif; background: #0b0f17; color: #fff; padding: 24px; border-radius: 12px;">
          <h2 style="color: #10b981;">✅ ¡Prueba Exitosa de Resend en ElysiumPad!</h2>
          <p style="color: #94a3b8; font-size: 14px;">Este es un mensaje de prueba enviado desde tu Panel de SuperAdmin en ElysiumPad.</p>
          <p style="color: #cbd5e1; font-size: 13px;">Tu integración con <strong>Resend.com</strong> está funcionando correctamente.</p>
          <div style="margin-top: 20px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px;">
            Timestamp: ${new Date().toISOString()} • ElysiumPad SuperAdmin
          </div>
        </div>
      `,
      text: '¡Prueba de Resend exitosa! Tu servicio de correos transaccionales en ElysiumPad está funcionando.',
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Error desconocido al enviar correo vía Resend.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: `¡Correo de prueba enviado con éxito a ${targetEmail}!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
