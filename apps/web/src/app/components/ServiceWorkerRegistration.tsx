"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("✅ Service Worker registered:", registration.scope);

            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New service worker available, show update notification
                    console.log("🔄 New version available! Please refresh.");
                    
                    // Optional: Show a toast notification to user
                    if (confirm("Nueva versión disponible. ¿Actualizar ahora?")) {
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error("❌ Service Worker registration failed:", error);
          });

        // Handle controller change (when new SW takes over)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("🔄 Service Worker controller changed");
        });
      });
    }
  }, []);

  return null;
}
