/**
 * Servicio de Envío de Correos Transaccionales con Resend (resend.com)
 * Utiliza la API REST nativa de Resend mediante fetch()
 */

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY no está configurada. Correo omitido en desarrollo/demo.');
    return {
      success: true,
      skipped: true,
      error: 'RESEND_API_KEY no configurada en las variables de entorno.',
    };
  }

  // Remitente por defecto: onboarding@resend.dev (cuenta de pruebas de Resend) o remitente personalizado
  const sender = from || process.env.RESEND_FROM_EMAIL || 'ElysiumPad <onboarding@resend.dev>';
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: recipients,
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Resend Error]', data);
      return {
        success: false,
        error: data.message || `Error de Resend HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (err: any) {
    console.error('[Resend Network Error]', err);
    return {
      success: false,
      error: err.message || 'Error de red al conectar con Resend',
    };
  }
}

/**
 * Plantilla de Bienvenida a ElysiumPad
 */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name?: string;
}): Promise<SendEmailResult> {
  const displayName = name || 'Gamer';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #111622; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 1px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; margin-bottom: 16px; }
    h1 { color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .btn { display: inline-block; background-color: #10b981; color: #022c22; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin: 20px 0; }
    .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">⚔️ Bienvenido a ElysiumPad</div>
    <h1>¡Hola, ${displayName}!</h1>
    <p>Te damos la bienvenida a <strong>ElysiumPad</strong>, la plataforma para crear, sincronizar y compartir launchers personalizados de Minecraft para tu comunidad.</p>
    <p>Tu cuenta ha sido creada exitosamente. Ya puedes acceder al panel de control para crear tu primer launcher, seleccionar la versión de Minecraft, agregar mods de Modrinth y conectar la IP de tu servidor.</p>
    <div style="text-align: center;">
      <a href="https://elysiumpad.com/dashboard" class="btn">Ir al Panel de Control</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ElysiumPad • El creador de launchers de Minecraft para servidores.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: '🎮 ¡Bienvenido a ElysiumPad! Crea tu primer launcher',
    html,
    text: `¡Hola ${displayName}! Bienvenido a ElysiumPad. Tu cuenta ya está lista para crear y compartir tus launchers de Minecraft. Accede a tu panel en https://elysiumpad.com/dashboard`,
  });
}

/**
 * Plantilla de Notificación de Suscripción PRO o LIFETIME
 */
export async function sendPlanUpgradedEmail({
  to,
  name,
  plan,
}: {
  to: string;
  name?: string;
  plan: string;
}): Promise<SendEmailResult> {
  const displayName = name || 'Gamer';
  const isLifetime = plan === 'LIFETIME';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #111622; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background-color: ${isLifetime ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isLifetime ? '#f59e0b' : '#10b981'}; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 1px solid ${isLifetime ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}; text-transform: uppercase; margin-bottom: 16px; }
    h1 { color: #ffffff; font-size: 24px; font-weight: 800; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
    ul { font-size: 13px; color: #cbd5e1; line-height: 1.8; }
    .btn { display: inline-block; background-color: ${isLifetime ? '#f59e0b' : '#10b981'}; color: #022c22; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin: 20px 0; }
    .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">👑 Plan ${plan} Activado</div>
    <h1>¡Gracias por apoyar a ElysiumPad, ${displayName}!</h1>
    <p>Tu cuenta ha sido actualizada al <strong>Plan ${plan}</strong> con éxito.</p>
    <p>A partir de ahora dispones de todas las ventajas premium sin limitaciones:</p>
    <ul>
      <li>✨ Launchers ilimitados para todas tus comunidades y eventos.</li>
      <li>✨ Subida de archivos y configuraciones .jar personalizadas.</li>
      <li>✨ Tablón de novedades y anuncios con imágenes dentro del launcher.</li>
      <li>✨ 100% Marca Blanca sin marcas de agua ni publicidad.</li>
    </ul>
    <div style="text-align: center;">
      <a href="https://elysiumpad.com/dashboard" class="btn">Gestionar Servidores</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ElysiumPad • Soporte garantizado para tu comunidad.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `👑 ¡Tu plan ${plan} de ElysiumPad ya está activo!`,
    html,
    text: `¡Hola ${displayName}! Tu cuenta de ElysiumPad ha sido actualizada al Plan ${plan}. Disfruta de launchers ilimitados, subida de configs y marca blanca completa.`,
  });
}

/**
 * Plantilla de Recuperación de Contraseña
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name?: string;
  resetUrl: string;
}): Promise<SendEmailResult> {
  const displayName = name || 'Gamer';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #e2e8f0; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #111622; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background-color: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; border: 1px solid rgba(239, 68, 68, 0.3); text-transform: uppercase; margin-bottom: 16px; }
    h1 { color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .btn { display: inline-block; background-color: #10b981; color: #022c22; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin: 20px 0; }
    .note { font-size: 12px; color: #64748b; background-color: #0b0f17; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; margin-top: 20px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">🔒 Seguridad de la Cuenta</div>
    <h1>Restablecer tu Contraseña</h1>
    <p>Hola <strong>${displayName}</strong>,</p>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>ElysiumPad</strong>.</p>
    <p>Haz clic en el siguiente botón para elegir una nueva contraseña:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Restablecer Mi Contraseña</a>
    </div>
    <div class="note">
      <p style="margin: 0;">Este enlace es válido durante <strong>1 hora</strong>. Si tú no solicitaste este cambio, puedes ignorar este correo; tu contraseña actual continuará siendo segura.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ElysiumPad • Seguridad y Protección para tu Cuenta.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: '🔐 Restablecer contraseña de ElysiumPad',
    html,
    text: `Hola ${displayName}. Para restablecer tu contraseña de ElysiumPad, accede al siguiente enlace (válido por 1 hora): ${resetUrl}`,
  });
}

