import { apiFetch } from "./api-client";

export type PublicBranch = {
  id: string;
  name: string;
  city?: string;
  timezone?: string;
  address?: string;
  clinicSlug?: string;
  clinicName?: string;
};

export type PublicService = {
  id: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  defaultDuration?: number;
  price?: number;
  currency?: string;
  priceDisplay?: string;
  category?: string;
};

export type PublicSlot = {
  id: string;
  time?: string;
  startAt?: string;
  therapist?: string;
  therapistName?: string;
  resource?: string;
  resourceName?: string;
};

export type PublicClinic = {
  id: string;
  slug?: string;
  name: string;
  city: string;
  featuredService?: string;
  branches?: number;
};

export async function getPublicBranches(params?: { clinicSlug?: string }) {
  const query = params?.clinicSlug ? `?clinicSlug=${encodeURIComponent(params.clinicSlug)}` : "";
  return apiFetch<PublicBranch[]>(`/api/v1/public/branches${query}`);
}

export async function getPublicServices(params?: { clinicSlug?: string }) {
  const query = params?.clinicSlug ? `?clinicSlug=${encodeURIComponent(params.clinicSlug)}` : "";
  return apiFetch<PublicService[]>(`/api/v1/public/services${query}`);
}

export async function getPublicAvailability(params: { branchId: string; serviceId: string; clinicSlug?: string; date?: string }) {
  const searchParams = new URLSearchParams({
    branchId: params.branchId,
    serviceId: params.serviceId,
    ...(params.clinicSlug ? { clinicSlug: params.clinicSlug } : {}),
    date: params.date ?? new Date().toISOString().slice(0, 10),
  });
  const query = searchParams.toString();
  return apiFetch<PublicSlot[]>(`/api/v1/public/availability?${query}`);
}

export async function getPublicClinics() {
  return apiFetch<PublicClinic[]>("/api/v1/public/clinics");
}
