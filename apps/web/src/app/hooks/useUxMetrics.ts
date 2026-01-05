"use client";

import { useCallback } from "react";

type UxEvent = {
  scope: string;
  type: "load" | "error" | "fallback" | "action";
  detail?: Record<string, unknown>;
  at: string;
};

const sendBeacon = (payload: UxEvent) => {
  const endpoint = process.env.NEXT_PUBLIC_OBSERVABILITY_URL;
  if (endpoint && typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    navigator.sendBeacon(endpoint, blob);
  }
};

export function useUxMetrics(scope: string) {
  return useCallback(
    (type: UxEvent["type"], detail?: Record<string, unknown>) => {
      const event: UxEvent = { scope, type, detail, at: new Date().toISOString() };
      if (typeof window !== "undefined") {
        (window as any).__eventoraMetrics ??= [];
        (window as any).__eventoraMetrics.push(event);
      }
      if (type !== "load") {
        console.info("[eventora][ux]", event);
      }
      sendBeacon(event);
    },
    [scope],
  );
}
