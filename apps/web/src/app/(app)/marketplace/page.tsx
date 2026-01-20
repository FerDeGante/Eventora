"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MapPin, Filter } from "react-feather";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { getPublicClinics, type PublicClinic } from "@/lib/public-api";

const fallbackClinics: PublicClinic[] = [
  { id: "clinic_cdmx", slug: "eventora-cdmx", name: "Eventora Polanco", city: "CDMX", featuredService: "Hidroterapia Eventora", branches: 3, featured: true },
  { id: "clinic_gdl", slug: "eventora-gdl", name: "Eventora Andares", city: "Guadalajara", featuredService: "Spa sensorial", branches: 2, featured: true },
  { id: "clinic_mty", slug: "eventora-mty", name: "Eventora San Pedro", city: "Monterrey", featuredService: "Rehab deportiva", branches: 1, featured: false },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
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

  const serviceTypes = useMemo(
    () => {
      const types = new Set<string>();
      clinics.forEach(clinic => {
        if (clinic.featuredService) {
          // Extract service type (e.g., "Hidroterapia", "Spa", "Rehab")
          const type = clinic.featuredService.split(" ")[0];
          types.add(type);
        }
      });
      return Array.from(types);
    },
    [clinics],
  );

  const featuredClinics = useMemo(
    () => clinics.filter(c => c.featured),
    [clinics],
  );

  const filtered = clinics.filter((clinic) => {
    const matchesCity = city ? clinic.city === city : true;
    const matchesServiceType = serviceType 
      ? clinic.featuredService?.toLowerCase().includes(serviceType.toLowerCase())
      : true;
    const matchesQ =
      !search ||
      clinic.name.toLowerCase().includes(search.toLowerCase()) ||
      (clinic.featuredService ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesServiceType && matchesQ;
  });

  const hasActiveFilters = city !== null || serviceType !== null;
  const resetFilters = () => {
    setCity(null);
    setServiceType(null);
    setSearch("");
  };

  return (
    <div className="glass-panel marketplace-shell">
      <SectionHeading eyebrow="Eventora Marketplace" title="Directorio público multi-clínica.">
        Publica sucursales, paquetes y disponibilidad en tiempo real para captar pacientes y conectar con el wizard.
      </SectionHeading>
      {(isLoading || isError) && (
        <p className="marketplace-status">{isLoading ? "Sincronizando clínicas públicas..." : "Usando datos locales"}</p>
      )}
      
      {/* Featured Clinics Section */}
      {featuredClinics.length > 0 && !hasActiveFilters && (
        <section className="featured-section">
          <div className="featured-header">
            <Star size={20} />
            <h3>Clínicas destacadas</h3>
          </div>
          <div className="featured-grid">
            {featuredClinics.slice(0, 3).map((clinic) => (
              <GlowCard key={`featured-${clinic.id}`}>
                <div className="featured-badge">
                  <Star size={14} />
                  Destacado
                </div>
                <h4 className="marketplace-name">{clinic.name}</h4>
                <p className="marketplace-city">
                  <MapPin size={14} />
                  {clinic.city}
                </p>
                <p className="marketplace-highlight">
                  {clinic.featuredService ?? "Experiencia Eventora"}
                </p>
                <button
                  className="btn-primary-small"
                  onClick={() => router.push(`/wizard?clinic=${clinic.slug ?? clinic.id}`)}
                >
                  Reservar ahora
                </button>
              </GlowCard>
            ))}
          </div>
        </section>
      )}
      
      <div className="marketplace-filters">
        <div className="search-row">
          <input
            placeholder="Buscar clínica o servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="marketplace-input"
          />
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filtros {hasActiveFilters && `(${[city, serviceType].filter(Boolean).length})`}
          </button>
          {hasActiveFilters && (
            <button className="reset-filters-btn" onClick={resetFilters}>
              Limpiar
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Ciudad</label>
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

            <div className="filter-group">
              <label>Tipo de servicio</label>
              <div className="marketplace-chips">
                <button className={!serviceType ? "is-active" : ""} onClick={() => setServiceType(null)}>
                  Todos
                </button>
                {serviceTypes.map((type) => (
                  <button key={type} className={serviceType === type ? "is-active" : ""} onClick={() => setServiceType(type)}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
