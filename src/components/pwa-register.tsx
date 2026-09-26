"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const scope = `${basePath}/`;

    navigator.serviceWorker
      .register(`${basePath}/sw.js`, { scope })
      .catch(() => {
        // PWA remains fully usable as a normal website if registration fails.
      });
  }, []);

  return null;
}
