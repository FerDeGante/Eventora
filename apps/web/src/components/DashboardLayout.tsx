"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";
import Footer from "./Footer";

import AccountSection from "./dashboard/AccountSection";
import PurchasedPackagesSection from "./dashboard/PurchasedPackagesSection";
import HistorySection from "./dashboard/HistorySection";
import ReservarPaquete from "./dashboard/ReservarPaquete";
import PackagesSection from "./dashboard/PackagesSection";

type TabKey = "mi-cuenta" | "mis-paquetes" | "historial" | "reservar";

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    tab: queryTab,
    view,
    pkgKey,      // lo que se pasa ahora
    sessions,
    priceId,
  } = router.query as Record<string, string>;

  const [tab, setTab] = useState<TabKey>(
    (queryTab as TabKey) || "mis-paquetes"
  );

  useEffect(() => {
    if (typeof queryTab === "string") setTab(queryTab as TabKey);
  }, [queryTab]);

  const tabs: [TabKey, string][] = [
    ["mi-cuenta", "Mi cuenta"],
    ["mis-paquetes", "Mis paquetes"],
    ["historial", "Mis reservaciones"],
    ["reservar", "Reservar"],
  ];

  function renderContent() {
    // 1) Cuando venimos de "Agendar sesión" de Mis paquetes
    if (view === "reservar-paquete" && pkgKey && sessions && priceId) {
      const num = parseInt(sessions, 10) || 0;
      return (
        <ReservarPaquete
          pkgKey={pkgKey}
          sessions={num}
          priceId={priceId}
        />
      );
    }

    // 2) Pestañas normales
    switch (tab) {
      case "mi-cuenta":
        return <AccountSection />;
      case "mis-paquetes":
        return <PurchasedPackagesSection />;
      case "historial":
        return <HistorySection />;
      case "reservar":
        return <PackagesSection />;
      default:
        return <PurchasedPackagesSection />;
    }
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="dashboard-container py-4">
        <h2 className="text-center mb-4">
          Hola, {session?.user?.name || "Usuario"}
        </h2>
        <ul className="nav nav-tabs justify-content-center mb-4">
          {tabs.map(([key, label]) => (
            <li key={key} className="nav-item">
              <button
                className={`nav-link ${tab === key ? "active" : ""}`}
                onClick={() =>
                  router.push(
                    { pathname: "/dashboard", query: { tab: key } },
                    undefined,
                    { shallow: true }
                  )
                }
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        {renderContent()}
      </div>
      <Footer />
    </ProtectedRoute>
  );
}
