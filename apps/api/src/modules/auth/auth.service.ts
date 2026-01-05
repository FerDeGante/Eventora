import { addMinutes } from "date-fns";
import type { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { assertTenant } from "../../utils/tenant";
import { hashPassword, comparePassword } from "../../utils/password";
import { sendTransactionalEmail } from "../notifications/notification.service";

const TOKEN_TTL_MINUTES = {
  password_reset: 30,
  two_factor: 10,
};

const createTokenValue = () => Math.floor(100000 + Math.random() * 900000).toString();

const createTokenRecord = async (
  clinicId: string,
  email: string,
  purpose: "password_reset" | "two_factor",
) => {
  const token = createTokenValue();
  const expires = addMinutes(new Date(), TOKEN_TTL_MINUTES[purpose]);
  await prisma.passwordResetToken.create({
    data: {
      clinicId,
      email,
      token,
      expires,
      purpose,
    },
  });
  return token;
};

const consumeTokenRecord = async (
  clinicId: string,
  email: string,
  token: string,
  purpose: string,
) => {
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      clinicId,
      email,
      token,
      purpose,
      expires: { gte: new Date() },
    },
  });
  if (!record) {
    throw new Error("Invalid or expired token");
  }
  await prisma.passwordResetToken.delete({ where: { id: record.id } });
  return record;
};

export const registerUser = async (input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: string;
}) => {
  const { clinicId } = assertTenant();
  const existing = await prisma.user.findUnique({ where: { clinicId_email: { clinicId, email: input.email } } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      clinicId,
      email: input.email,
      passwordHash,
      role: (input.role as UserRole) ?? "CLIENT",
      name: input.name,
      phone: input.phone,
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      clinicId: true,
      twoFactorEnabled: true,
    },
  });
  return user;
};

export const authenticateUser = async (email: string, password: string) => {
  const { clinicId } = assertTenant();
  const user = await prisma.user.findUnique({ where: { clinicId_email: { clinicId, email } } });
  if (!user) throw new Error("Invalid credentials");
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new Error("Invalid credentials");
  return user;
};

export const sendPasswordResetCode = async (email: string) => {
  const { clinicId } = assertTenant();
  const user = await prisma.user.findUnique({ where: { clinicId_email: { clinicId, email } } });
  if (!user) return;
  const token = await createTokenRecord(clinicId, email, "password_reset");
  await sendTransactionalEmail({
    to: [email],
    template: "password_reset",
    templateData: {
      resetCode: token,
      expiryMinutes: TOKEN_TTL_MINUTES.password_reset,
    },
    subject: "Restablece tu contraseña",
  });
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const { clinicId } = assertTenant();
  await consumeTokenRecord(clinicId, email, token, "password_reset");
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { clinicId_email: { clinicId, email } },
    data: { passwordHash },
  });
};

export const sendTwoFactorCode = async (user: { email: string; clinicId: string }) => {
  const token = await createTokenRecord(user.clinicId, user.email, "two_factor");
  await sendTransactionalEmail({
    to: [user.email],
    template: "two_factor_code",
    templateData: {
      twoFactorCode: token,
      expiryMinutes: TOKEN_TTL_MINUTES.two_factor,
    },
    subject: "Código de verificación",
  });
};

export const verifyTwoFactorCode = async (email: string, token: string) => {
  const { clinicId } = assertTenant();
  await consumeTokenRecord(clinicId, email, token, "two_factor");
  const user = await prisma.user.findUnique({ where: { clinicId_email: { clinicId, email } } });
  if (!user) throw new Error("User not found");
  return user;
};

export const toggleTwoFactor = async (userId: string, enabled: boolean) => {
  const { clinicId } = assertTenant();
  const user = await prisma.user.update({
    where: { id: userId, clinicId },
    data: {
      twoFactorEnabled: enabled,
    },
    select: {
      id: true,
      twoFactorEnabled: true,
    },
  });
  return user;
};
