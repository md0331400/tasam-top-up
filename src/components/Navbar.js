"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { subscribeUnreadCount } from "@/lib/db";
import HamburgerMenu from "./HamburgerMenu";

export default function Navbar() {
  const { user } = useAuth();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const unsub = subscribeUnreadCount(user.uid, (count) => setUnread(count));
    return () => unsub();
  }, [user]);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.logoUrl || "/logo.png"} alt="logo" className="brand-logo-img" />
          </span>
          <span className="brand-text">
            {settings.shortName}
            <small>{settings.tagline}</small>
          </span>
        </Link>

        <div className="nav-right">
          {/* Desktop quick links */}
          <nav className="nav-links-desktop">
            <Link href="/">Home</Link>
            <Link href="/products">Top Up</Link>
            <Link href="/deposit" className="btn btn-accent btn-sm">＋ Add Money</Link>
          </nav>

          {/* Notification bell with unread red dot */}
          <Link href="/notifications" className="nav-notif">
            <span className="nav-notif-icon" style={{ position: "relative", display: "inline-flex" }}>
              🔔
              {unread > 0 && <span className="notif-dot" aria-label={`${unread} unread notifications`} />}
            </span>
            <span className="nav-notif-label">Notifications</span>
          </Link>

          {/* Hamburger (top-right menu) button */}
          <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <HamburgerMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
