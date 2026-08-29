"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so the site installs to a home screen and keeps
 * working without a connection. Production only — a caching worker in dev just
 * makes edits confusing.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support is a bonus; never let it break the page */
      });
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
