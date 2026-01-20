import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingCard } from "../../components/LoadingStates";
import { ErrorBoundary } from "../../components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Eventora Marketplace · Clínicas y reservas en vivo",
  description: "Explora clínicas Eventora, filtra por ciudad/servicio y conéctate directo al wizard público.",
  openGraph: {
    title: "Eventora Marketplace",
    description: "Landing multi-clínica con buscador y deep-links al wizard Eventora.",
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingCard />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
