"use client";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";

// Notice bar with a close (✕) button. The text comes from Firestore
// settings/site.notice so the admin can edit it from the admin panel.
// When the user closes it, it stays hidden until the text changes.
export default function NoticeBar() {
  const settings = useSettings();
  // Session-only dismissal: closing hides it for the current page session,
  // and it reappears on the next page refresh (no persistent storage).
  const [hidden, setHidden] = useState(false);
  const notice = settings.notice;

  if (!notice || hidden) return null;

  return (
    <div className="notice-bar">
      <span className="notice-icon">📢</span>
      <span className="notice-text">{notice}</span>
      <button className="notice-close" onClick={() => setHidden(true)} aria-label="Close notice">
        ✕
      </button>
    </div>
  );
}
