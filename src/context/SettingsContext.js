"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SITE } from "@/lib/config";

const SettingsContext = createContext(SITE);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(SITE);

  useEffect(() => {
    // Live-subscribe to settings/site (admin app edits this same doc).
    // If it doesn't exist (or no permission yet), fall back to defaults.
    const unsub = onSnapshot(
      doc(db, "settings", "site"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setSettings({
            ...SITE,
            ...d,
            payment: { ...SITE.payment, ...(d.payment || {}) },
            support: { ...SITE.support, ...(d.support || {}) },
          });
        } else {
          setSettings(SITE);
        }
      },
      () => {
        // error reading (e.g. rules not yet updated) → keep defaults
        setSettings(SITE);
      }
    );
    return () => unsub();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
