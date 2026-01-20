"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { getPublicClinics, type PublicClinic } from "@/lib/public-api";

const fallbackClinics: PublicClinic[] = [
  { id: "clinic_cdmx", slug: "eventora-cdmx", name: "Eventora Polanco", city: "CDMX", featuredService: "Hidroterapia Eventora", branches: 3 },
  { id: "clinic_gdl", slug: "eventora-gdl", name: "Eventora Andares", city: "Guadalajara", featuredService: "Spa sensorial", branches: 2 },
  { id: "clinic_mty", slug: "eventora-mty", name: "Eventora San Pedro", city: "Monterrey", featuredService: "Rehab deportiva", branches: 1 },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["public-clinics"],
    queryFn: getPublicClinics,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchInterval: 60 * 1000,
  });

  const clinics = data.length ? data : fallbackClinics;
  const cities = useMemo(
    () => Array.from(new Set(clinics.map((clinic) => clinic.city).filter(Boolean))),
    [clinics],
  );

  const filtered = clinics.filter((clinic) => {
    const matchesCity = city ? clinic.city === city : true;
    const matchesQ =
      !search ||
      clinic.name.toLowerCase().includes(search.toLowerCase()) ||
      (clinic.featuredService ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesQ;
  });

  return (
    <div className="glass-panel marketplace-shell">
      <SectionHeading eyebrow="Eventora Marketplace" title="Directorio público multi-clínica.">
        Publica sucursales, paquetes y disponibilidad en tiempo real para captar pacientes y conectar con el wizard.
      </SectionHeading>
      {(isLoading || isError) && (
        <p className="marketplace-status">{isLoading ? "Sincronizando clínicas públicas..." : "Usando datos locales"}</p>
      )}
      <div className="marketplace-filters">
        <input
          placeholder="Buscar clínica o servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="marketplace-input"
        />
        <div className="marketplace-chips">
          <button className={!city ? "is-active" : ""} onClick={() => setCity(null)}>
            Todas
          </button>
          {cities.map((cityOption) => (
            <button key={cityOption} className={city === cityOption ? "is-active" : ""} onClick={() => setCity(cityOption)}>
              {cityOption}
            </button>
          ))}
        </div>
      </div>
      <div className="marketplace-grid">
        {filtered.map((clinic) => (
          <GlowCard key={clinic.id}>
            <p className="marketplace-city">{clinic.city}</p>
            <p className="marketplace-count">
              {clinic.branches ?? 1} {clinic.branches === 1 ? "sucursal" : "sucursales"}
            </p>
            <p className="marketplace-highlight">
              {clinic.featuredService ?? clinic.name ?? "Experiencia Eventora"}
            </p>
            <div className="marketplace-actions">
              <button
                onClick={() =>
                  router.push(`/wizard?clinic=${clinic.slug ?? clinic.id}`)
                }
              >
                Reservar en esta clínica
              </button>
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
