"use client";

import CalendarSection from "@/components/CalendarSection";
import ManualReservationSection from "@/components/admin/ManualReservationSection";
import { useSession } from "next-auth/react";
import SidebarTherapist from "@/components/Sidebar/SidebarTherapist";

export default function TherapistDashboard() {
  const { data: session } = useSession();

  // Espera a tener la sesión cargada (evita errores de id undefined)
  if (!session?.user?.id) {
    return <div className="text-center my-5">Cargando...</div>;
  }

  return (
    <div className="d-flex" style={{minHeight: "90vh"}}>
      <SidebarTherapist />
      <div className="flex-grow-1 px-4 py-3">
        <div className="mb-4">
          <CalendarSection
  apiBaseUrl={`/api/therapist/${session.user.id}/reservations`}
  canEdit={true}
  title="Mis Reservaciones para"
/>
        </div>
        {/* Sección de reservación manual, igual que el admin pero usando los endpoints /api/therapist/* */}
        <div className="mt-4">
          <ManualReservationSection
            apiClientsUrl="/api/therapist/clients"
            apiPackagesUrl="/api/therapist/packages"
            apiBranchesUrl="/api/admin/branches"
            apiReservationUrl="/api/admin/reservations"
          />
        </div>
      </div>
    </div>
  );
}