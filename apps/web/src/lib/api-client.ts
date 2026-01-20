const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type FetchOptions = RequestInit & { json?: Record<string, unknown> };

export async function apiFetch<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.json) {
    headers.set("Content-Type", "application/json");
  }

  const defaultClinicId = process.env.NEXT_PUBLIC_CLINIC_ID ?? process.env.NEXT_PUBLIC_DEMO_CLINIC_ID;
  if (defaultClinicId && !headers.has("x-clinic-id")) {
    headers.set("x-clinic-id", defaultClinicId);
  }

  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    const stored = window.localStorage.getItem("eventora-auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { token?: string };
        if (parsed.token) {
          headers.set("Authorization", `Bearer ${parsed.token}`);
        }
      } catch {
        // ignore parse errors
      }
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.json ? JSON.stringify(options.json) : options.body,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "API error");
  }

  return (await res.json().catch(() => ({}))) as T;
}
