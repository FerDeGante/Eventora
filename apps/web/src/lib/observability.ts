export type ObservabilityEvent = {
  scope: string;
  type: "error" | "unhandledrejection";
  message: string;
  at: string;
  stack?: string;
};

const OBS_URL = process.env.NEXT_PUBLIC_OBSERVABILITY_URL;

export const sendObsEvent = (event: ObservabilityEvent) => {
  if (!OBS_URL || typeof navigator === "undefined" || !navigator.sendBeacon) return;
  const blob = new Blob([JSON.stringify(event)], { type: "application/json" });
  navigator.sendBeacon(OBS_URL, blob);
};
