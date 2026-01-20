import { useQuery } from "@tanstack/react-query";
import { getDashboardOverview } from "../../lib/admin-api";
import { getPublicClinics, type PublicClinic } from "../../lib/public-api";
import { useUxMetrics } from "./useUxMetrics";

const fallbackStats = [
  { label: "Sucursales activas", value: "+120", delta: "12% vs mes anterior" },
  { label: "Pagos procesados", value: "$12M", delta: "Stripe · MP · POS" },
  { label: "Sesiones al mes", value: "+45K", delta: "Automations IA" },
];

const fallbackClinics: PublicClinic[] = [
  { id: "clinic_cdmx", name: "Eventora Polanco", city: "CDMX" },
  { id: "clinic_gdl", name: "Eventora Andares", city: "Guadalajara" },
  { id: "clinic_mty", name: "Eventora San Pedro", city: "Monterrey" },
];

export function useLandingMetrics() {
  const track = useUxMetrics("landing");
  const overviewQuery = useQuery({
    queryKey: ["landing-overview"],
    queryFn: getDashboardOverview,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const clinicsQuery = useQuery({
    queryKey: ["landing-clinics"],
    queryFn: getPublicClinics,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const stats = overviewQuery.data?.stats?.length ? overviewQuery.data.stats.slice(0, 3) : fallbackStats;
  const clinics = clinicsQuery.data?.length ? clinicsQuery.data : fallbackClinics;

  const usingFallback = Boolean(overviewQuery.data?.fallback || (!overviewQuery.isLoading && !overviewQuery.data?.stats?.length));

  let statusMessage = "Eventora conectado a API v1";
  if (overviewQuery.isLoading || clinicsQuery.isLoading) statusMessage = "Sincronizando datos...";
  else if (overviewQuery.isError || clinicsQuery.isError || usingFallback) statusMessage = "Mostrando datos locales";

  const isLive = overviewQuery.isSuccess && clinicsQuery.isSuccess && !usingFallback;

  if (overviewQuery.isError || clinicsQuery.isError || usingFallback) {
    track("fallback", { overviewError: overviewQuery.error?.message, clinicsError: clinicsQuery.error?.message });
  } else if (isLive) {
    track("load", { stats: stats.length, clinics: clinics.length });
  }

  return { stats, clinics, statusMessage, isLive };
}
