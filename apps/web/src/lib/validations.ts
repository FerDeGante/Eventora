import { z } from "zod";

// Schema para formulario de contacto
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z.string()
    .email("Email inválido")
    .min(1, "El email es requerido"),
  phone: z.string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .max(15, "El teléfono es demasiado largo")
    .regex(/^[0-9+\-\s()]+$/, "El teléfono solo puede contener números y símbolos válidos"),
  message: z.string()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(1000, "El mensaje es demasiado largo"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Schema para formulario de reserva
export const reservationFormSchema = z.object({
  userId: z.string().min(1, "Selecciona un usuario"),
  packageId: z.string().min(1, "Selecciona un paquete"),
  therapistId: z.string().optional(),
  branchId: z.string().min(1, "Selecciona una sucursal"),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().max(500, "Las notas son demasiado largas").optional(),
});

export type ReservationFormData = z.infer<typeof reservationFormSchema>;

// Schema para formulario de booking público
export const bookingFormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido"),
  packageId: z.string().min(1, "Selecciona un paquete"),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Schema para login
export const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Schema para registro
export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido").optional(),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Helper para formatear errores
export function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.errors[0]?.message || "Error de validación";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ha ocurrido un error inesperado";
}
