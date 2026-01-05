"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { GlowCard } from "./ui/GlowCard";
import { InputField } from "./ui/InputField";
import { EventoraButton } from "./ui/EventoraButton";
import { createClinic, inviteStaff, type InviteStaffPayload } from "../lib/admin-api";
import { getPublicBranches, type PublicBranch } from "../lib/public-api";

const roles: InviteStaffPayload["role"][] = ["ADMIN", "MANAGER", "RECEPTION", "THERAPIST"];

export function OnboardingPanel() {
  const [clinic, setClinic] = useState({ name: "Eventora Clínica", slug: "eventora-principal", email: "" });
  const [invite, setInvite] = useState<InviteStaffPayload>({
    email: "",
    name: "",
    role: "THERAPIST",
    branchId: "",
  });
  const [toast, setToast] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const branchesQuery = useQuery({
    queryKey: ["onboarding-branches"],
    queryFn: getPublicBranches,
    staleTime: 5 * 60 * 1000,
  });
  const branches: PublicBranch[] = useMemo(
    () => branchesQuery.data ?? [],
    [branchesQuery.data],
  );

  const clinicMutation = useMutation({
    mutationFn: () => createClinic({ name: clinic.name, slug: clinic.slug, ownerUserEmail: clinic.email || undefined }),
    onSuccess: (data) => setToast(`Clínica creada: ${data.name}`),
    onError: (err: any) => setToast(err?.message ?? "No pudimos crear la clínica"),
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteStaff(invite),
    onSuccess: () => {
      setToast("Invitación enviada");
      void queryClient.invalidateQueries({ queryKey: ["onboarding-branches"] });
    },
    onError: (err: any) => setToast(err?.message ?? "No pudimos invitar al staff"),
  });

  return (
    <div className="dashboard-onboarding">
      <GlowCard>
        <p className="dashboard-side__title">Onboarding rápido</p>
        <div className="dashboard-onboarding__form">
          <InputField label="Nombre de clínica" value={clinic.name} onChange={(e) => setClinic((s) => ({ ...s, name: e.target.value }))} />
          <InputField label="Slug" value={clinic.slug} onChange={(e) => setClinic((s) => ({ ...s, slug: e.target.value }))} />
          <InputField label="Correo owner (opcional)" type="email" value={clinic.email} onChange={(e) => setClinic((s) => ({ ...s, email: e.target.value }))} />
        </div>
        <EventoraButton onClick={() => clinicMutation.mutate()} disabled={clinicMutation.isLoading}>
          {clinicMutation.isLoading ? "Creando..." : "Crear/actualizar clínica"}
        </EventoraButton>
      </GlowCard>

      <GlowCard>
        <p className="dashboard-side__title">Invitar staff</p>
        <div className="dashboard-onboarding__form">
          <InputField label="Nombre" value={invite.name ?? ""} onChange={(e) => setInvite((s) => ({ ...s, name: e.target.value }))} />
          <InputField label="Correo" type="email" value={invite.email} onChange={(e) => setInvite((s) => ({ ...s, email: e.target.value }))} />
          <label className="input-field">
            <span>Rol</span>
            <select value={invite.role} onChange={(e) => setInvite((s) => ({ ...s, role: e.target.value as InviteStaffPayload["role"] }))}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label className="input-field">
            <span>Sucursal</span>
            <select value={invite.branchId ?? ""} onChange={(e) => setInvite((s) => ({ ...s, branchId: e.target.value }))}>
              <option value="">Sin sucursal</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} {branch.city ? `· ${branch.city}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <EventoraButton onClick={() => inviteMutation.mutate()} disabled={inviteMutation.isLoading}>
          {inviteMutation.isLoading ? "Enviando..." : "Invitar staff"}
        </EventoraButton>
      </GlowCard>

      {toast && <p className="dashboard-onside__feedback">{toast}</p>}
    </div>
  );
}
