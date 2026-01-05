export const DEFAULT_NOTIFICATION_TEMPLATES = [
  {
    key: "booking_confirmation",
    name: "Confirmación de reservación",
    subject: "Tu cita en Eventora está confirmada",
    html: `
      <p>Hola {{name}},</p>
      <p>Tu reservación para <strong>{{service}}</strong> el <strong>{{date}}</strong> a las <strong>{{time}}</strong> ha sido confirmada.</p>
      <p>Ubicación: {{branch}}</p>
      <p>
        <a href="{{calendarLink}}" style="background:#60bac2;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">
          Agregar a mi calendario
        </a>
      </p>
      <p>¡Te esperamos!</p>
    `,
    text: "Tu reservación en Eventora está confirmada. Agrega a tu calendario: {{calendarLink}}",
  },
  {
    key: "reminder_1_day",
    name: "Recordatorio 1 día antes",
    subject: "Mañana tienes tu sesión en Eventora",
    html: `
      <p>Hola {{name}},</p>
      <p>Este es un recordatorio de tu sesión de {{service}} el día <strong>{{date}}</strong> a las <strong>{{time}}</strong>.</p>
      <p>Si necesitas reprogramar, hazlo con al menos 12 horas de anticipación.</p>
      <p>Gracias por confiar en Eventora.</p>
    `,
    text: "Recordatorio: tu sesión de {{service}} es el {{date}} a las {{time}}.",
  },
  {
    key: "reminder_1_hour",
    name: "Recordatorio 1 hora antes",
    subject: "Tu sesión comienza en 1 hora",
    html: `
      <p>Hola {{name}},</p>
      <p>En 1 hora te esperamos para tu sesión de {{service}} (<strong>{{time}}</strong>).</p>
      <p>Llega 10 minutos antes para prepararte con calma.</p>
    `,
    text: "En 1 hora comienza tu sesión de {{service}} a las {{time}}.",
  },
  {
    key: "follow_up",
    name: "Seguimiento post-sesión",
    subject: "¿Cómo te sentiste en tu última sesión?",
    html: `
      <p>Hola {{name}},</p>
      <p>Esperamos que tu sesión de {{service}} haya sido increíble. Nos encantaría saber cómo te sentiste.</p>
      <p>Regresa esta semana y mantén tu progreso: <a href="{{bookingLink}}">Reserva tu próxima sesión</a>.</p>
    `,
    text: "¿Cómo te sentiste en tu última sesión? Reserva la siguiente: {{bookingLink}}",
  },
  {
    key: "discount_offer",
    name: "Código de descuento",
    subject: "{{discountName}}: disfruta {{discountValue}}",
    html: `
      <p>Hola {{name}},</p>
      <p>Activa tu beneficio <strong>{{discountName}}</strong> y obtén {{discountValue}} en tu siguiente compra.</p>
      <p>Usa el código <strong>{{discountCode}}</strong> antes del {{expiryDate}}.</p>
      <p><a href="{{bookingLink}}">Reserva ahora</a></p>
    `,
    text: "Tu código {{discountCode}} te da {{discountValue}} hasta {{expiryDate}}. Reserva en {{bookingLink}}",
  },
  {
    key: "admin_new_reservation",
    name: "Notificación interna de nueva reserva",
    subject: "Nueva reservación creada",
    html: `
      <p>Se creó una nueva reservación:</p>
      <ul>
        <li>Cliente: {{name}}</li>
        <li>Servicio: {{service}}</li>
        <li>Fecha: {{date}} {{time}}</li>
        <li>Sucursal: {{branch}}</li>
      </ul>
      <p>Consulta el panel para más detalles.</p>
    `,
    text: "Nueva reservación: {{name}} - {{service}} - {{date}} {{time}}",
  },
  {
    key: "password_reset",
    name: "Restablecer contraseña",
    subject: "Restablece tu contraseña de Eventora",
    html: `
      <p>Hola,</p>
      <p>Para restablecer tu contraseña usa el siguiente código:</p>
      <p style="font-size:24px;font-weight:bold;">{{resetCode}}</p>
      <p>El código expira en {{expiryMinutes}} minutos.</p>
    `,
    text: "Tu código para restablecer contraseña es {{resetCode}} (vence en {{expiryMinutes}} minutos)",
  },
  {
    key: "two_factor_code",
    name: "Código de verificación (2FA)",
    subject: "Tu código de acceso seguro",
    html: `
      <p>Hola,</p>
      <p>Tu código para verificar el acceso es:</p>
      <p style="font-size:24px;font-weight:bold;">{{twoFactorCode}}</p>
      <p>El código expira en {{expiryMinutes}} minutos.</p>
    `,
    text: "Tu código de verificación es {{twoFactorCode}} (vence en {{expiryMinutes}} minutos)",
  },
];
