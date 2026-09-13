"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/admin-sw.js", { scope: "/admin/" })
        .catch(() => {
          // Silencioso: si falla el registro, el panel igual funciona normal.
        });
    }
  }, []);

  return null;
}
