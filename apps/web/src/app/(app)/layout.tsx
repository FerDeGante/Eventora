import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppChrome } from "../components/shell/AppChrome";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { LoadingCard } from "../components/LoadingStates";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingCard />}>
        <AppChrome>{children}</AppChrome>
      </Suspense>
    </ErrorBoundary>
  );
}
