"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";

function initials(name) {
  if (!name) return "🙂";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "🙂";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Full navigation list (moved into the slide-out hamburger drawer).
const MENU = [
  { key: "account", label: "My Account", icon: "🏠", href: "/dashboard" },
  { key: "orders", label: "My Orders", icon: "📑", href: "/orders" },
  { key: "transaction", label: "My Transaction", icon: "📋", href: "/dashboard?tab=transactions" },
  { key: "deposit", label: "Add Money", icon: "👛", href: "/deposit" },
  { key: "notifications", label: "Notifications", icon: "🔔", href: "/notifications" },
  { key: "contact", label: "Contact Us", icon: "ℹ️", href: "/contact" },
];

export default function HamburgerMenu({ open, onClose }) {
  const { user, profile, logout } = useAuth();
  const settings = useSettings();

  return (
    <>
      {/* Backdrop */}
      <div
        className={open ? "drawer-backdrop open" : "drawer-backdrop"}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer */}
      <aside className={open ? "drawer open" : "drawer"} aria-label="Menu">
        <div className="drawer-header">
          <span className="drawer-title">Menu</span>
          <button className="drawer-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>

        {user && (
          <div className="drawer-profile">
            <div className="drawer-avatar">{initials(profile?.name || user?.displayName)}</div>
            <div className="drawer-profile-id">
              <div className="drawer-name">Hi, {profile?.name || user?.displayName || "User"}</div>
              <div className="drawer-email">{user?.email}</div>
            </div>
          </div>
        )}

        <nav className="drawer-menu">
          {MENU.map((item) => (
            <Link key={item.key} href={item.href} className="drawer-item" onClick={onClose}>
              <span className="drawer-item-icon">{item.icon}</span>
              <span className="drawer-item-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="drawer-footer">
          {user ? (
            <button
              className="btn btn-outline btn-block"
              onClick={() => { logout(); onClose(); }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-block" onClick={onClose}>Login</Link>
              <Link href="/register" className="btn btn-primary btn-block" onClick={onClose}>Sign Up</Link>
            </>
          )}
          <a
            href={settings.support.telegram}
            target="_blank"
            rel="noreferrer"
            className="btn btn-support btn-block"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 13a8 8 0 0 1 16 0v1a2 2 0 0 1-2 2h-1v-3a5 5 0 0 0-10 0v1H6a2 2 0 0 1-2-2v-1z"/>
              <path d="M8 19a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2"/>
            </svg>
            Support
          </a>
        </div>
      </aside>
    </>
  );
}
