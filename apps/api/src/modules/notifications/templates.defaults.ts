// Eventora Email Template System
// Variables disponibles: {{name}}, {{service}}, {{date}}, {{time}}, {{branch}}, {{bookingLink}}, {{calendarLink}}, etc.

const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Eventora</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f4f4f5;color:#18181b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Eventora</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.8);">Gestión inteligente de citas</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#fafafa;border-top:1px solid #e4e4e7;text-align:center;">
              <p style="margin:0;font-size:12px;color:#71717a;">
                Este correo fue enviado por Eventora<br>
                <a href="{{unsubscribeLink}}" style="color:#6366f1;text-decoration:none;">Cancelar suscripción</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buttonStyle = "display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;";
const secondaryButtonStyle = "display:inline-block;background:#f4f4f5;color:#6366f1;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;font-size:14px;border:1px solid #e4e4e7;";

export const DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    key: "booking_confirmation",
    name: "Confirmación de reservación",
    subject: "✅ Tu cita está confirmada - {{service}}",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">¡Tu cita está confirmada!</h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">
        Hola <strong>{{name}}</strong>, tu reservación ha sido confirmada exitosamente.
      </p>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:24px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#71717a;font-size:13px;">SERVICIO</span><br>
              <strong style="font-size:16px;color:#18181b;">{{service}}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#71717a;font-size:13px;">FECHA Y HORA</span><br>
              <strong style="font-size:16px;color:#18181b;">{{date}} a las {{time}}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#71717a;font-size:13px;">UBICACIÓN</span><br>
              <strong style="font-size:16px;color:#18181b;">{{branch}}</strong>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align:center;margin-bottom:24px;">
        <a href="{{calendarLink}}" style="${buttonStyle}">📅 Agregar a mi calendario</a>
      </div>
      
      <p style="margin:0;font-size:14px;color:#71717a;text-align:center;">
        Si necesitas reprogramar o cancelar, hazlo con al menos 24 horas de anticipación.
      </p>
    `),
    text: "¡Tu cita está confirmada!\n\nHola {{name}}, tu reservación de {{service}} el {{date}} a las {{time}} en {{branch}} ha sido confirmada.\n\nAgrega a tu calendario: {{calendarLink}}",
  },
  {
    key: "reminder_1_day",
    name: "Recordatorio 1 día antes",
    subject: "⏰ Mañana: tu cita de {{service}}",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">Tu cita es mañana</h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">
        Hola <strong>{{name}}</strong>, este es un recordatorio amigable de tu próxima cita.
      </p>
      
      <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #fcd34d;">
        <div style="display:flex;align-items:center;">
          <span style="font-size:32px;margin-right:16px;">📆</span>
          <div>
            <strong style="font-size:18px;color:#92400e;">{{service}}</strong><br>
            <span style="color:#a16207;">{{date}} • {{time}}</span><br>
            <span style="color:#a16207;">📍 {{branch}}</span>
          </div>
        </div>
      </div>
      
      <h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#18181b;">Antes de tu cita:</h3>
      <ul style="margin:0 0 24px;padding-left:20px;color:#52525b;line-height:1.8;">
        <li>Llega 10 minutos antes para registrarte</li>
        <li>Trae una identificación oficial</li>
        <li>Usa ropa cómoda si es necesario</li>
      </ul>
      
      <p style="margin:0;font-size:14px;color:#71717a;text-align:center;">
        ¿Necesitas reprogramar? <a href="{{bookingLink}}" style="color:#6366f1;">Hazlo aquí</a>
      </p>
    `),
    text: "Tu cita es mañana\n\nHola {{name}}, te recordamos tu cita de {{service}} el {{date}} a las {{time}} en {{branch}}.\n\nLlega 10 minutos antes. ¿Necesitas reprogramar? {{bookingLink}}",
  },
  {
    key: "reminder_1_hour",
    name: "Recordatorio 1 hora antes",
    subject: "🔔 En 1 hora: tu cita de {{service}}",
    html: emailWrapper(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:48px;">⏰</span>
      </div>
      
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
        Tu cita comienza en 1 hora
      </h2>
      
      <div style="background:#ecfdf5;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;border:1px solid #a7f3d0;">
        <strong style="font-size:20px;color:#059669;">{{service}}</strong><br>
        <span style="color:#047857;font-size:16px;">{{time}} • {{branch}}</span>
      </div>
      
      <p style="margin:0;font-size:15px;color:#52525b;text-align:center;line-height:1.6;">
        Hola <strong>{{name}}</strong>, es momento de prepararte.<br>
        ¡Te esperamos con todo listo!
      </p>
    `),
    text: "Tu cita comienza en 1 hora\n\nHola {{name}}, tu sesión de {{service}} a las {{time}} en {{branch}} está por comenzar. ¡Te esperamos!",
  },
  {
    key: "reminder_15_min",
    name: "Recordatorio 15 minutos antes",
    subject: "🚀 En 15 minutos: {{service}}",
    html: emailWrapper(`
      <div style="background:#fef2f2;border-radius:12px;padding:24px;text-align:center;border:1px solid #fecaca;">
        <span style="font-size:40px;">🏃‍♂️</span>
        <h2 style="margin:12px 0 8px;font-size:22px;font-weight:700;color:#dc2626;">¡Tu cita empieza en 15 minutos!</h2>
        <p style="margin:0;color:#b91c1c;font-size:15px;">
          <strong>{{service}}</strong> a las <strong>{{time}}</strong>
        </p>
      </div>
    `),
    text: "¡Tu cita empieza en 15 minutos! {{service}} a las {{time}}. ¡Te esperamos!",
  },
  {
    key: "follow_up",
    name: "Seguimiento post-sesión",
    subject: "💬 ¿Cómo estuvo tu sesión de {{service}}?",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">¿Cómo te fue?</h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">
        Hola <strong>{{name}}</strong>, esperamos que tu sesión de <strong>{{service}}</strong> haya sido increíble.
      </p>
      
      <div style="text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:14px;color:#71717a;">¿Cómo calificarías tu experiencia?</p>
        <a href="{{ratingLink}}&rating=5" style="font-size:28px;text-decoration:none;margin:0 4px;">⭐</a>
        <a href="{{ratingLink}}&rating=4" style="font-size:28px;text-decoration:none;margin:0 4px;">⭐</a>
        <a href="{{ratingLink}}&rating=3" style="font-size:28px;text-decoration:none;margin:0 4px;">⭐</a>
        <a href="{{ratingLink}}&rating=2" style="font-size:28px;text-decoration:none;margin:0 4px;">⭐</a>
        <a href="{{ratingLink}}&rating=1" style="font-size:28px;text-decoration:none;margin:0 4px;">⭐</a>
      </div>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;">
        <p style="margin:0 0 16px;font-size:15px;color:#52525b;">
          Mantén tu progreso y agenda tu próxima sesión
        </p>
        <a href="{{bookingLink}}" style="${buttonStyle}">Reservar siguiente cita</a>
      </div>
    `),
    text: "¿Cómo te fue?\n\nHola {{name}}, esperamos que tu sesión de {{service}} haya sido increíble.\n\nMantén tu progreso y reserva tu próxima cita: {{bookingLink}}",
  },
  {
    key: "cancellation_confirmation",
    name: "Confirmación de cancelación",
    subject: "❌ Tu cita ha sido cancelada",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">Cita cancelada</h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">
        Hola <strong>{{name}}</strong>, tu cita de <strong>{{service}}</strong> programada para el <strong>{{date}}</strong> a las <strong>{{time}}</strong> ha sido cancelada.
      </p>
      
      <div style="background:#fef2f2;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #fecaca;">
        <p style="margin:0;color:#dc2626;font-size:14px;">
          Si crees que esto es un error, contáctanos lo antes posible.
        </p>
      </div>
      
      <div style="text-align:center;">
        <a href="{{bookingLink}}" style="${buttonStyle}">Agendar nueva cita</a>
      </div>
    `),
    text: "Tu cita ha sido cancelada\n\nHola {{name}}, tu cita de {{service}} del {{date}} a las {{time}} fue cancelada.\n\nAgendar nueva cita: {{bookingLink}}",
  },
  {
    key: "reschedule_confirmation",
    name: "Confirmación de reagendamiento",
    subject: "🔄 Tu cita ha sido reprogramada",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">Cita reprogramada</h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">
        Hola <strong>{{name}}</strong>, tu cita ha sido reprogramada exitosamente.
      </p>
      
      <div style="display:flex;gap:16px;margin-bottom:24px;">
        <div style="flex:1;background:#fef2f2;border-radius:12px;padding:16px;text-align:center;">
          <span style="color:#71717a;font-size:12px;">FECHA ANTERIOR</span><br>
          <span style="color:#dc2626;text-decoration:line-through;">{{oldDate}} {{oldTime}}</span>
        </div>
        <div style="flex:1;background:#ecfdf5;border-radius:12px;padding:16px;text-align:center;">
          <span style="color:#71717a;font-size:12px;">NUEVA FECHA</span><br>
          <strong style="color:#059669;">{{date}} {{time}}</strong>
        </div>
      </div>
      
      <div style="text-align:center;">
        <a href="{{calendarLink}}" style="${buttonStyle}">📅 Actualizar calendario</a>
      </div>
    `),
    text: "Tu cita ha sido reprogramada\n\nHola {{name}}, tu cita de {{service}} fue movida del {{oldDate}} {{oldTime}} al {{date}} {{time}}.",
  },
  {
    key: "discount_offer",
    name: "Código de descuento",
    subject: "🎁 {{discountName}}: {{discountValue}} de descuento",
    html: emailWrapper(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:56px;">🎁</span>
      </div>
      
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
        ¡Tienes un regalo especial!
      </h2>
      
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">
        Hola <strong>{{name}}</strong>, disfruta <strong>{{discountValue}}</strong> en tu próxima reservación.
      </p>
      
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
        <span style="color:rgba(255,255,255,0.7);font-size:14px;">TU CÓDIGO</span>
        <h3 style="margin:8px 0;font-size:32px;font-weight:800;color:#fff;letter-spacing:4px;">{{discountCode}}</h3>
        <span style="color:rgba(255,255,255,0.8);font-size:13px;">Válido hasta {{expiryDate}}</span>
      </div>
      
      <div style="text-align:center;">
        <a href="{{bookingLink}}" style="display:inline-block;background:#fff;color:#6366f1;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;border:2px solid #6366f1;">
          Usar mi código
        </a>
      </div>
    `),
    text: "¡Tienes un regalo especial!\n\nHola {{name}}, usa el código {{discountCode}} para obtener {{discountValue}} de descuento.\n\nVálido hasta {{expiryDate}}. Reserva: {{bookingLink}}",
  },
  {
    key: "admin_new_reservation",
    name: "Notificación interna de nueva reserva",
    subject: "📋 Nueva reservación: {{name}} - {{service}}",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">Nueva reservación</h2>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:24px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
              <span style="color:#71717a;font-size:13px;">CLIENTE</span><br>
              <strong style="font-size:16px;color:#18181b;">{{name}}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
              <span style="color:#71717a;font-size:13px;">SERVICIO</span><br>
              <strong style="font-size:16px;color:#18181b;">{{service}}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;">
              <span style="color:#71717a;font-size:13px;">FECHA Y HORA</span><br>
              <strong style="font-size:16px;color:#18181b;">{{date}} a las {{time}}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;">
              <span style="color:#71717a;font-size:13px;">SUCURSAL</span><br>
              <strong style="font-size:16px;color:#18181b;">{{branch}}</strong>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="text-align:center;">
        <a href="{{adminLink}}" style="${buttonStyle}">Ver en el panel</a>
      </div>
    `),
    text: "Nueva reservación\n\nCliente: {{name}}\nServicio: {{service}}\nFecha: {{date}} {{time}}\nSucursal: {{branch}}",
  },
  {
    key: "password_reset",
    name: "Restablecer contraseña",
    subject: "🔐 Restablecer tu contraseña",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
        Restablecer contraseña
      </h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">
        Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código:
      </p>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:800;letter-spacing:8px;color:#18181b;">{{resetCode}}</span>
      </div>
      
      <p style="margin:0;font-size:14px;color:#71717a;text-align:center;">
        El código expira en <strong>{{expiryMinutes}} minutos</strong>.<br>
        Si no solicitaste esto, ignora este correo.
      </p>
    `),
    text: "Restablecer contraseña\n\nTu código es: {{resetCode}}\n\nExpira en {{expiryMinutes}} minutos. Si no solicitaste esto, ignora este correo.",
  },
  {
    key: "two_factor_code",
    name: "Código de verificación (2FA)",
    subject: "🔒 Tu código de acceso: {{twoFactorCode}}",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
        Código de verificación
      </h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">
        Ingresa este código para completar tu inicio de sesión:
      </p>
      
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:32px;text-align:center;margin-bottom:24px;">
        <span style="font-size:44px;font-weight:800;letter-spacing:12px;color:#fff;">{{twoFactorCode}}</span>
      </div>
      
      <p style="margin:0;font-size:14px;color:#71717a;text-align:center;">
        El código expira en <strong>{{expiryMinutes}} minutos</strong>.<br>
        Si no fuiste tú, cambia tu contraseña inmediatamente.
      </p>
    `),
    text: "Tu código de verificación es: {{twoFactorCode}}\n\nExpira en {{expiryMinutes}} minutos. Si no fuiste tú, cambia tu contraseña inmediatamente.",
  },
  {
    key: "welcome",
    name: "Bienvenida",
    subject: "🎉 ¡Bienvenido a Eventora, {{name}}!",
    html: emailWrapper(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:64px;">🎉</span>
      </div>
      
      <h2 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#18181b;text-align:center;">
        ¡Bienvenido a Eventora!
      </h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">
        Hola <strong>{{name}}</strong>, nos emociona tenerte aquí.<br>
        Tu cuenta está lista para empezar a agendar.
      </p>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#18181b;">Primeros pasos:</h3>
        <ol style="margin:0;padding-left:20px;color:#52525b;line-height:2;">
          <li>Completa tu perfil con tus datos</li>
          <li>Explora los servicios disponibles</li>
          <li>Agenda tu primera cita</li>
        </ol>
      </div>
      
      <div style="text-align:center;">
        <a href="{{bookingLink}}" style="${buttonStyle}">Agendar mi primera cita</a>
      </div>
    `),
    text: "¡Bienvenido a Eventora!\n\nHola {{name}}, nos emociona tenerte aquí. Tu cuenta está lista.\n\nAgenda tu primera cita: {{bookingLink}}",
  },
  {
    key: "no_show",
    name: "No presentado",
    subject: "😕 Te perdimos hoy - ¿Todo bien?",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">Te extrañamos</h2>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;line-height:1.6;">
        Hola <strong>{{name}}</strong>, notamos que no pudiste asistir a tu cita de <strong>{{service}}</strong> hoy.
      </p>
      
      <div style="background:#fef3c7;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #fcd34d;">
        <p style="margin:0;color:#92400e;font-size:14px;">
          Entendemos que a veces surgen imprevistos. Si necesitas ayuda para reprogramar, estamos aquí para ti.
        </p>
      </div>
      
      <div style="text-align:center;">
        <a href="{{bookingLink}}" style="${buttonStyle}">Reagendar cita</a>
      </div>
    `),
    text: "Te extrañamos\n\nHola {{name}}, notamos que no pudiste asistir a tu cita de {{service}}. Reagenda cuando puedas: {{bookingLink}}",
  },
  {
    key: "payment_confirmation",
    name: "Confirmación de pago",
    subject: "💳 Pago recibido - ${{amount}} {{currency}}",
    html: emailWrapper(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:48px;">✅</span>
      </div>
      
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
        Pago recibido
      </h2>
      
      <div style="background:#ecfdf5;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;border:1px solid #a7f3d0;">
        <span style="color:#71717a;font-size:13px;">MONTO PAGADO</span>
        <h3 style="margin:8px 0 0;font-size:36px;font-weight:800;color:#059669;">$\{{amount}} {{currency}}</h3>
      </div>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;color:#71717a;">Concepto</td>
            <td style="padding:6px 0;text-align:right;color:#18181b;font-weight:500;">{{description}}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#71717a;">Referencia</td>
            <td style="padding:6px 0;text-align:right;color:#18181b;font-family:monospace;">{{paymentId}}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#71717a;">Fecha</td>
            <td style="padding:6px 0;text-align:right;color:#18181b;">{{date}}</td>
          </tr>
        </table>
      </div>
      
      <p style="margin:0;font-size:14px;color:#71717a;text-align:center;">
        Gracias por tu confianza, <strong>{{name}}</strong>.
      </p>
    `),
    text: "Pago recibido\n\nMonto: ${{amount}} {{currency}}\nConcepto: {{description}}\nReferencia: {{paymentId}}\nFecha: {{date}}\n\nGracias por tu confianza, {{name}}.",
  },
  {
    key: "workspace_welcome",
    name: "Bienvenida a workspace (B2B)",
    subject: "🚀 ¡Tu espacio {{workspaceName}} está listo!",
    html: emailWrapper(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:64px;">🚀</span>
      </div>
      
      <h2 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#18181b;text-align:center;">
        ¡Bienvenido a Eventora!
      </h2>
      <p style="margin:0 0 8px;font-size:18px;color:#6366f1;text-align:center;font-weight:600;">
        {{workspaceName}}
      </p>
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">
        Hola <strong>{{name}}</strong>, tu espacio de trabajo está configurado y listo para recibir reservaciones.
      </p>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#18181b;">Para comenzar:</h3>
        <ol style="margin:0;padding-left:20px;color:#52525b;line-height:2;">
          <li><strong>Configura tus servicios</strong> — Define qué ofreces y sus precios</li>
          <li><strong>Conecta Stripe</strong> — Para recibir pagos de tus clientes</li>
          <li><strong>Personaliza tu widget</strong> — Agrega tu logo y colores</li>
          <li><strong>Comparte tu link de reservas</strong> — eventora.mx/book/{{slug}}</li>
        </ol>
      </div>
      
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:rgba(255,255,255,0.8);font-size:14px;">TU LINK DE RESERVAS</p>
        <p style="margin:0;color:#fff;font-size:18px;font-weight:600;font-family:monospace;">
          eventora.mx/book/{{slug}}
        </p>
      </div>
      
      <div style="text-align:center;margin-bottom:24px;">
        <a href="{{dashboardLink}}" style="${buttonStyle}">Ir a mi dashboard</a>
      </div>
      
      <div style="background:#fef3c7;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #fcd34d;">
        <p style="margin:0;color:#92400e;font-size:14px;">
          <strong>💡 Tip:</strong> Tienes <strong>{{trialDays}} días de prueba</strong> gratis. 
          Explora todas las funciones sin límite.
        </p>
      </div>
      
      <p style="margin:0;font-size:14px;color:#71717a;text-align:center;">
        ¿Necesitas ayuda? Responde a este correo y te asistimos.
      </p>
    `),
    text: "¡Bienvenido a Eventora!\n\nHola {{name}}, tu espacio {{workspaceName}} está listo.\n\nTu link de reservas: eventora.mx/book/{{slug}}\n\nPasos:\n1. Configura tus servicios\n2. Conecta Stripe\n3. Personaliza tu widget\n4. Comparte tu link\n\nTienes {{trialDays}} días de prueba. Ir al dashboard: {{dashboardLink}}",
  },
  {
    key: "membership_activated",
    name: "Membresía activada",
    subject: "🎫 Tu membresía {{membershipName}} está activa",
    html: emailWrapper(`
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:48px;">🎫</span>
      </div>
      
      <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;text-align:center;">
        ¡Membresía activada!
      </h2>
      
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <span style="color:rgba(255,255,255,0.8);font-size:13px;">TU PLAN</span>
        <h3 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#fff;">{{membershipName}}</h3>
      </div>
      
      <p style="margin:0 0 24px;font-size:16px;color:#52525b;text-align:center;line-height:1.6;">
        Hola <strong>{{name}}</strong>, tu membresía está activa y lista para usar.
      </p>
      
      <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;color:#71717a;">Tipo</td>
            <td style="padding:8px 0;text-align:right;color:#18181b;font-weight:500;">{{membershipType}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#71717a;">Válido hasta</td>
            <td style="padding:8px 0;text-align:right;color:#18181b;font-weight:500;">{{expiresAt}}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#71717a;">Beneficios</td>
            <td style="padding:8px 0;text-align:right;color:#059669;font-weight:500;">{{benefits}}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align:center;">
        <a href="{{bookingLink}}" style="${buttonStyle}">Agendar con mi membresía</a>
      </div>
    `),
    text: "¡Membresía activada!\n\nHola {{name}}, tu membresía {{membershipName}} está activa.\n\nTipo: {{membershipType}}\nVálido hasta: {{expiresAt}}\nBeneficios: {{benefits}}\n\nReserva: {{bookingLink}}",
  },
];
