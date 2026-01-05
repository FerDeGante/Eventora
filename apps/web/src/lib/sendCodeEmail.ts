// src/lib/sendCodeEmail.ts
import nodemailer from 'nodemailer';

type SendCodeEmailOptions = {
  email: string;
  code: string;
  purpose?: "register" | "reset";
};

export const sendCodeEmail = async ({
  email,
  code,
  purpose = "register",
}: SendCodeEmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Personalización por propósito
  const isRegister = purpose === "register";
  const subject = isRegister
    ? "Código de verificación para crear tu cuenta en Eventora Fisio"
    : "Código de recuperación de contraseña en Eventora Fisio";
  const actionText = isRegister
    ? "Confirma tu registro en Eventora Fisio usando este código:"
    : "Restablece tu contraseña usando este código:";
  const footerText = isRegister
    ? "¿No solicitaste crear una cuenta? Ignora este correo."
    : "¿No solicitaste restablecer tu contraseña? Ignora este correo.";

  const html = `
    <div style="max-width:420px;margin:40px auto;padding:32px 24px;border-radius:20px;background:linear-gradient(135deg,#60bac2 80%,#cca8d6 100%);font-family:Inter,sans-serif;box-shadow:0 8px 32px #0001;">
      <div style="display:flex;align-items:center;margin-bottom:24px;">
        <img src="https://eventora.com/logo.png" alt="Eventora" style="width:48px;height:48px;border-radius:50%;background:#fff;margin-right:14px;box-shadow:0 1px 5px #0002;">
        <h2 style="margin:0;font-size:1.3rem;color:#414143;font-weight:700;">Eventora Fisio</h2>
      </div>
      <h3 style="color:#fff;margin-bottom:12px;font-weight:700;">${subject}</h3>
      <p style="color:#fff;font-size:1rem;margin:10px 0 22px;">${actionText}</p>
      <div style="background:#fff;border-radius:12px;padding:18px 0;text-align:center;font-size:2.3rem;letter-spacing:6px;color:#414143;font-weight:700;margin-bottom:8px;">
        ${code}
      </div>
      <div style="color:#fff;font-size:.96rem;margin-bottom:10px;">
        <b>Código válido por 10 minutos.</b>
      </div>
      <div style="color:#e6a376;font-size:.94rem;margin-bottom:18px;">${footerText}</div>
      <div style="font-size:.93rem;text-align:center;margin-top:24px;">
        <a href="https://eventora.com/" style="color:#fff;text-decoration:none;font-weight:600;">🌐 eventora.com</a>
        <span style="color:#cca8d6;margin:0 8px;">|</span>
        <a href="https://www.instagram.com/" style="color:#fff;text-decoration:none;">Instagram</a>
      </div>
      <div style="font-size:.85rem;color:#e6e6e6;text-align:center;opacity:0.9;margin-top:16px;">
        &copy; ${new Date().getFullYear()} Eventora Fisio &bull; Reservaciones y salud y bienestar
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: '"Eventora" <no-reply@eventora.com>',
    to: email,
    subject,
    html,
  });
};
