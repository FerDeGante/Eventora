"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { EventoraButton } from "@/app/components/ui/EventoraButton";
import { InputField } from "@/app/components/ui/InputField";
import {
  getPublicAvailability,
  getPublicBranches,
  getPublicServices,
  type PublicBranch,
  type PublicService,
  type PublicSlot,
} from "@/lib/public-api";
import { createCheckout } from "@/lib/admin-api";
import { useUxMetrics } from "@/app/hooks/useUxMetrics";
import { useAuth } from "@/app/hooks/useAuth";

const fallbackWizard = {
  branches: [
    { id: "branch_polanco", name: "Eventora Polanco", city: "CDMX", timezone: "America/Mexico_City" },
    { id: "branch_roma", name: "Eventora Roma", city: "CDMX", timezone: "America/Mexico_City" },
    { id: "branch_cdmx_sur", name: "Eventora Coyoacán", city: "CDMX", timezone: "America/Mexico_City" },
  ],
  services: [
    { id: "svc_hidro", name: "Hidroterapia sensorial", durationMinutes: 60, priceDisplay: "$1,850 MXN", category: "Fisioterapia" },
    { id: "svc_spa", name: "Eventora Signature Spa", durationMinutes: 75, priceDisplay: "$2,100 MXN", category: "Spa" },
    { id: "svc_rehab", name: "Rehabilitación deportiva", durationMinutes: 50, priceDisplay: "$1,450 MXN", category: "Rehab" },
  ],
  slots: [
    { id: "slot_0830", time: "08:30", therapist: "Camila R.", resource: "Pool A" },
    { id: "slot_0915", time: "09:15", therapist: "Marco T.", resource: "Cabina 2" },
    { id: "slot_1030", time: "10:30", therapist: "Abril S.", resource: "Pool B" },
    { id: "slot_1145", time: "11:45", therapist: "Dr. Pérez", resource: "Cabina 1" },
  ],
} satisfies {
  branches: PublicBranch[];
  services: PublicService[];
  slots: PublicSlot[];
};

const currencyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

const getServiceMeta = (service: PublicService) => {
  const duration = service.durationMinutes ?? service.defaultDuration ?? 60;
  const price =
    service.priceDisplay ??
    (typeof service.price === "number" ? currencyFormatter.format(service.price) : service.price ?? "$0.00 MXN");
  return `${duration} min · ${price}`;
};

const getSlotTime = (slot: PublicSlot) => {
  if (slot.time) return slot.time;
  if (slot.startAt) {
    const date = new Date(slot.startAt);
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  }
  return "00:00";
};

const getSlotTherapist = (slot: PublicSlot) => slot.therapist ?? slot.therapistName ?? "Terapeuta Eventora";
const getSlotRoom = (slot: PublicSlot) => slot.resource ?? slot.resourceName ?? "Room Eventora";

export default function WizardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>}>
      <WizardContent />
    </Suspense>
  );
}

function WizardContent() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [step, setStep] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<PublicBranch | null>(null);
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [coupon, setCoupon] = useState("");
  const searchParams = useSearchParams();
  const track = useUxMetrics("wizard");
  const { user } = useAuth();
  const clinicSlug = searchParams.get("clinic") ?? undefined;
  const preselectBranch = searchParams.get("branchId") ?? undefined;
  const preselectService = searchParams.get("serviceId") ?? undefined;

  const {
    data: branchData = [],
    isLoading: branchesLoading,
    isError: branchesError,
  } = useQuery({
    queryKey: ["public-branches"],
    queryFn: () => getPublicBranches(clinicSlug ? { clinicSlug } : undefined),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const {
    data: serviceData = [],
    isLoading: servicesLoading,
    isError: servicesError,
  } = useQuery({
    queryKey: ["public-services"],
    queryFn: () => getPublicServices(clinicSlug ? { clinicSlug } : undefined),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const {
    data: slotData = [],
    isFetching: slotsLoading,
    isError: slotsError,
  } = useQuery({
    queryKey: ["public-slots", selectedBranch?.id, selectedService?.id],
    queryFn: () =>
      getPublicAvailability({
        branchId: selectedBranch!.id,
        serviceId: selectedService!.id,
        clinicSlug,
        date: today,
      }),
    staleTime: 60 * 1000,
    enabled: Boolean(selectedBranch && selectedService),
    retry: 1,
  });

  const branches = useMemo(
    () => (branchData.length ? branchData : branchesError ? fallbackWizard.branches : []),
    [branchData, branchesError],
  );
  const services = useMemo(
    () => (serviceData.length ? serviceData : servicesError ? fallbackWizard.services : []),
    [serviceData, servicesError],
  );
  const slots = useMemo(
    () => (slotData.length ? slotData : slotsError ? fallbackWizard.slots : []),
    [slotData, slotsError],
  );

  useEffect(() => {
    setSelectedSlot(null);
    if (slotsError) {
      track("error", { message: "slotsError", branch: selectedBranch?.id, service: selectedService?.id });
    }
  }, [selectedBranch, selectedService, slotsError, track]);

  useEffect(() => {
    if (preselectBranch && branches.length) {
      const branch = branches.find((b: PublicBranch) => b.id === preselectBranch);
      if (branch) setSelectedBranch(branch);
    }
  }, [preselectBranch, branches]);

  useEffect(() => {
    if (preselectService && services.length) {
      const service = services.find((s: PublicService) => s.id === preselectService);
      if (service) setSelectedService(service);
    }
  }, [preselectService, services]);

  useEffect(() => {
    if (slots.length) {
      track("load", { slots: slots.length, branch: selectedBranch?.id, service: selectedService?.id });
    }
  }, [slots, selectedBranch?.id, selectedService?.id, track]);

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (!selectedService || !selectedSlot) {
        throw new Error("Selecciona servicio y horario");
      }
      const result = await createCheckout({
        userId: user?.id ?? "guest",
        mode: "reservation",
        amount: selectedService.price ? selectedService.price * 100 : 185000, // cents
        currency: "mxn",
        successUrl: `${window.location.origin}/wizard?success=true`,
        cancelUrl: `${window.location.origin}/wizard?cancelled=true`,
        provider: "stripe",
      });
      return result;
    },
    onSuccess: (data) => {
      track("action", { action: "checkout", provider: "stripe" });
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: Error) => {
      track("error", { message: err.message });
    },
  });

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  const steps = [
    { title: "Sucursal", description: "Contexto del paciente y multi-clínica." },
    { title: "Servicio", description: "Catálogo Eventora con paquetes." },
    { title: "Horario", description: "Disponibilidad inteligente." },
    { title: "Checkout", description: "Resumen, pagos y notificaciones." },
  ];

  const canAdvance = useMemo(() => {
    if (step === 0) return Boolean(selectedBranch);
    if (step === 1) return Boolean(selectedService);
    if (step === 2) return Boolean(selectedSlot);
    return true;
  }, [step, selectedBranch, selectedService, selectedSlot]);

  const summary = [
    selectedBranch ? `Sucursal: ${selectedBranch.name}` : "Selecciona sucursal",
    selectedService ? `Servicio: ${selectedService.name}` : "Selecciona servicio",
    selectedSlot ? `Horario: ${getSlotTime(selectedSlot)} • ${getSlotTherapist(selectedSlot)}` : "Selecciona horario",
  ];

  return (
    <div className="wizard-shell">
      <SectionHeading eyebrow="Eventora Booking Wizard" title="Reserva multisucursal al estilo Chrome/Gemini.">
        Wizard holográfico con Stripe, paquetes, POS y notificaciones Resend sincronizadas.
      </SectionHeading>
      
      {/* Progreso visual mejorado */}
      <div className="wizard-progress-container">
        <ul className="wizard-steps">
          {steps.map((item, index) => (
            <li key={item.title} className={`wizard-step ${index === step ? "is-active" : index < step ? "is-complete" : ""}`}>
              <div className="wizard-step-indicator">
                <span className="wizard-step-number">{index + 1}</span>
                {index < step && <span className="wizard-step-check">✓</span>}
              </div>
              <div className="wizard-step-content">
                <p className="wizard-step-title">{item.title}</p>
                <small className="wizard-step-description">{item.description}</small>
              </div>
              {index < steps.length - 1 && <div className="wizard-step-connector" />}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="wizard-grid">
        <section className="wizard-panel glass-panel">
          {step === 0 && (
            <>
              <p className="wizard-panel__title">Selecciona una sucursal</p>
              {(branchesLoading || branchesError) && (
                <div className="wizard-status">
                  {branchesLoading && <div className="loading-spinner-sm"></div>}
                  <p>{branchesLoading ? "Sincronizando sucursales..." : "Usando catálogo local por ahora"}</p>
                </div>
              )}
              <div className="wizard-options">
                {branches.map((branch: PublicBranch) => (
                  <button
                    key={branch.id}
                    className={`wizard-option ${selectedBranch?.id === branch.id ? "is-active" : ""}`}
                    onClick={() => setSelectedBranch(branch)}
                  >
                    <p>{branch.name}</p>
                    <span>{branch.city}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="wizard-panel__title">Elige el servicio</p>
              {(servicesLoading || servicesError) && (
                <div className="wizard-status">
                  {servicesLoading && <div className="loading-spinner-sm"></div>}
                  <p>{servicesLoading ? "Cargando catálogo Eventora..." : "Mostrando servicios guardados"}</p>
                </div>
              )}
              <div className="wizard-options">
                {services.map((service: PublicService) => (
                  <button
                    key={service.id}
                    className={`wizard-option ${selectedService?.id === service.id ? "is-active" : ""}`}
                    onClick={() => setSelectedService(service)}
                  >
                    <p>{service.name}</p>
                    <span>{getServiceMeta(service)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <p className="wizard-panel__title">Escoge horario y terapeuta</p>
              {(!selectedBranch || !selectedService) && (
                <p className="wizard-status">Selecciona sucursal y servicio para ver disponibilidad.</p>
              )}
              {slotsLoading && (
                <div className="wizard-status">
                  <div className="loading-spinner-sm"></div>
                  <p>Calculando disponibilidad IA...</p>
                </div>
              )}
              {!slotsLoading && slots.length === 0 && selectedBranch && selectedService && (
                <div className="wizard-status wizard-status--warning">
                  <p>⚠️ No hay horarios disponibles para hoy</p>
                  <small>Prueba seleccionando otra sucursal o servicio, o intenta en otro día.</small>
                </div>
              )}
              {slotsError && !slotsLoading && slots.length > 0 && (
                <p className="wizard-status">Mostrando horarios de referencia.</p>
              )}
              {slots.length > 0 && (
                <div className="wizard-slots">
                  {slots.map((slot: PublicSlot) => (
                    <button
                      key={slot.id}
                      className={`wizard-slot ${selectedSlot?.id === slot.id ? "is-active" : ""}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <p>{getSlotTime(slot)}</p>
                      <span>{getSlotTherapist(slot)}</span>
                      <small>{getSlotRoom(slot)}</small>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {step === 3 && (
            <div className="wizard-checkout">
              <p className="wizard-panel__title">Checkout</p>
              <p className="wizard-checkout__copy">
                Stripe Checkout + POS. Envía confirmaciones Resend, recordatorios 24h/1h y seguimiento Eventora+.
              </p>
              <div className="wizard-checkout__form">
                <InputField label="Notas para el terapeuta" placeholder="Ej. cuidar rodilla izquierda" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <InputField label="Código de descuento Eventora" placeholder="BLOOM-AURA" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              </div>
              <div className="wizard-checkout__actions">
                <EventoraButton 
                  onClick={handleCheckout} 
                  disabled={checkoutMutation.isPending || !selectedService || !selectedSlot}
                >
                  {checkoutMutation.isPending ? "Redirigiendo a Stripe..." : "Confirmar y pagar"}
                </EventoraButton>
                <EventoraButton variant="ghost">Guardar como borrador</EventoraButton>
                {checkoutMutation.isError && (
                  <p className="wizard-error">Error: {(checkoutMutation.error as Error)?.message}</p>
                )}
              </div>
            </div>
          )}
          <div className="wizard-navigation">
            <EventoraButton variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Volver
            </EventoraButton>
            {step < steps.length - 1 && (
              <EventoraButton disabled={!canAdvance} onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
                Continuar
              </EventoraButton>
            )}
          </div>
        </section>
        <aside className="wizard-aside">
          <GlowCard>
            <p className="wizard-aside__title">Resumen Eventora</p>
            <ul className="wizard-aside__summary">
              {summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </GlowCard>
          <GlowCard>
            <p className="wizard-aside__title">Paquetes y notificaciones</p>
            <p className="wizard-aside__copy">
              Activa recordatorios Resend (24h, 1h), seguimiento pos-sesión y notificaciones admin/empleados.
            </p>
            <ul className="wizard-aside__list">
              <li>Agregar paquete Eventora+ (10 sesiones)</li>
              <li>Enviar a Google Calendar + Wallet</li>
              <li>Alertas WhatsApp/Correo inmediato</li>
              <li>Imprimir ticket POS</li>
            </ul>
          </GlowCard>
        </aside>
      </div>
    </div>
  );
}
