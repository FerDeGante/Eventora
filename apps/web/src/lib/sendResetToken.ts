import nodemailer from 'nodemailer';

export const sendResetToken = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // SSL directo
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Eventora" <no-reply@eventora.com>',
    to: email,
    subject: 'Código de recuperación de contraseña',
    html: `<p>Tu código para restablecer tu contraseña es:</p>
           <h2>${token}</h2>
           <p>Este código vence en 10 minutos.</p>`,
  });
};
