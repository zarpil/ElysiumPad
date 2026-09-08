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
    console.warn('[Resend] RESEND_API_KEY no configurada. Correo omitido en desarrollo.');
    return {
      success: true,
      skipped: true,
      error: 'RESEND_API_KEY no configurada en las variables de entorno.',
    };
  }

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
 * Plantilla Base Limpia y Profesional (Estilo Vercel / Linear / Stripe)
 */
function getEmailBaseHtml({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #fafafa;
      color: #18181b;
      margin: 0;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      overflow: hidden;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .logo {
      font-size: 15px;
      font-weight: 700;
      color: #18181b;
      letter-spacing: -0.3px;
      margin-bottom: 24px;
      display: inline-block;
    }
    h1 {
      color: #18181b;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.4px;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #52525b;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .btn-container {
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background-color: #18181b;
      color: #ffffff !important;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      padding: 12px 22px;
      border-radius: 8px;
    }
    .note {
      font-size: 12px;
      color: #71717a;
      line-height: 1.5;
      background-color: #f4f4f5;
      border-radius: 8px;
      padding: 12px 16px;
      margin-top: 24px;
    }
    .link-alt {
      color: #18181b;
      word-break: break-all;
      font-size: 12px;
    }
    .footer {
      font-size: 12px;
      color: #a1a1aa;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #f4f4f5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">ElysiumPad</div>
    ${content}
    <div class="footer">
      © ${new Date().getFullYear()} ElysiumPad. Plataforma de launchers de Minecraft.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Verificación de Correo Electrónico
 */
export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: {
  to: string;
  name?: string;
  verificationUrl: string;
}): Promise<SendEmailResult> {
  const greeting = name ? `Hola ${name},` : 'Hola,';

  const content = `
    <h1>Verifica tu dirección de correo electrónico</h1>
    <p>${greeting}</p>
    <p>Gracias por crear una cuenta en ElysiumPad. Para completar tu registro y acceder a la plataforma, confirma tu dirección de correo pulsando el botón a continuación:</p>
    <div class="btn-container">
      <a href="${verificationUrl}" class="btn">Verificar correo electrónico</a>
    </div>
    <div class="note">
      <p style="margin: 0 0 6px 0;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
      <a href="${verificationUrl}" class="link-alt">${verificationUrl}</a>
      <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 11px;">Este enlace caducará en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Verifica tu correo electrónico - ElysiumPad',
    html: getEmailBaseHtml({ title: 'Verificación de Correo', content }),
    text: `${greeting} Para verificar tu cuenta de ElysiumPad, accede al siguiente enlace: ${verificationUrl}`,
  });
}

/**
 * Bienvenida a ElysiumPad
 */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name?: string;
}): Promise<SendEmailResult> {
  const greeting = name ? `Hola ${name},` : 'Hola,';

  const content = `
    <h1>Bienvenido a ElysiumPad</h1>
    <p>${greeting}</p>
    <p>Tu cuenta ha sido activada correctamente. Ya puedes acceder al panel de control para crear tu primer servidor, seleccionar la versión de Minecraft, añadir mods desde Modrinth y generar tu launcher oficial.</p>
    <div class="btn-container">
      <a href="https://elysiumpad.com/dashboard" class="btn">Ir al panel de control</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Bienvenido a ElysiumPad',
    html: getEmailBaseHtml({ title: 'Bienvenido a ElysiumPad', content }),
    text: `${greeting} Tu cuenta de ElysiumPad ya está activa. Accede a tu panel en https://elysiumpad.com/dashboard`,
  });
}

/**
 * Recuperación de Contraseña
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
  const greeting = name ? `Hola ${name},` : 'Hola,';

  const content = `
    <h1>Restablecer tu contraseña</h1>
    <p>${greeting}</p>
    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ElysiumPad.</p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn">Restablecer contraseña</a>
    </div>
    <div class="note">
      <p style="margin: 0;">Este enlace es válido durante 1 hora. Si no has solicitado este cambio, puedes ignorar este correo y tu contraseña actual seguirá siendo la misma.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Restablecer contraseña - ElysiumPad',
    html: getEmailBaseHtml({ title: 'Restablecer contraseña', content }),
    text: `${greeting} Para restablecer tu contraseña de ElysiumPad, accede al siguiente enlace (válido por 1 hora): ${resetUrl}`,
  });
}

/**
 * Suscripción de Plan
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
  const greeting = name ? `Hola ${name},` : 'Hola,';

  const content = `
    <h1>Plan ${plan} activado</h1>
    <p>${greeting}</p>
    <p>Tu cuenta ha sido actualizada al <strong>Plan ${plan}</strong> con éxito.</p>
    <p>Ya dispones de las características ampliadas:</p>
    <ul style="font-size: 13px; color: #52525b; line-height: 1.8; padding-left: 20px;">
      <li>Launchers ilimitados</li>
      <li>Subida de archivos y configuraciones .jar propias</li>
      <li>Tablón de noticias en el launcher</li>
      <li>Cero publicidad y personalización de marca</li>
    </ul>
    <div class="btn-container">
      <a href="https://elysiumpad.com/dashboard" class="btn">Ir al panel de servidores</a>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Plan ${plan} activado - ElysiumPad`,
    html: getEmailBaseHtml({ title: `Plan ${plan} activado`, content }),
    text: `${greeting} Tu cuenta de ElysiumPad ha sido actualizada al Plan ${plan}. Accede a tu panel en https://elysiumpad.com/dashboard`,
  });
}
