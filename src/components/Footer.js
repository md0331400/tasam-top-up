"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

export default function Footer() {
  const settings = useSettings();

  return (
    <footer className="footer">
      <div className="container footer-support">
        <div className="support-box">
          <div className="support-title">সাহায্য লাগবে?</div>
          <p>যেকোনো সমস্যায় আমাদের সাপোর্টে যোগাযোগ করুন — ২৪/৭ সাপোর্ট।</p>
          <div className="support-grid">
            <a href={settings.support.whatsapp} target="_blank" rel="noreferrer" className="support-btn support-btn-whatsapp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 21.5a9.46 9.46 0 0 1-4.82-1.32l-.35-.2-3.59.94.96-3.5-.23-.37a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.26-9.47 9.5-9.47a9.43 9.43 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.78 6.7c0 5.22-4.26 9.47-9.5 9.47zm8.06-17.52A11.34 11.34 0 0 0 12.04.15C5.8.15.73 5.2.73 11.44c0 1.99.52 3.93 1.51 5.64L.63 23.85l6.9-1.8a11.3 11.3 0 0 0 4.51 1.03c6.24 0 11.32-5.06 11.32-11.28 0-3.01-1.17-5.85-3.26-7.97z"/>
              </svg>
              WhatsApp
            </a>
            <a href={settings.support.telegram} target="_blank" rel="noreferrer" className="support-btn support-btn-telegram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
              </svg>
              Telegram
            </a>
            <a href={settings.support.facebook} target="_blank" rel="noreferrer" className="support-btn support-btn-facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>

      <div className="container footer-grid">
        <div>
          <div className="brand">
            <span className="brand-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.logoUrl || "/logo.png"} alt="logo" className="brand-logo-img" />
            </span>
            <span className="brand-text">{settings.shortName}</span>
          </div>
          <p>{settings.description}</p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link href="/">Home</Link>
          <Link href="/products">Top Up</Link>
          <Link href="/dashboard">My Orders</Link>
          <Link href="/deposit">Deposit</Link>
        </div>
        <div>
          <h4>Support</h4>
          <p>📞 {settings.support.phone}</p>
          <p>✉️ {settings.support.email}</p>
          <p>🕒 24/7 Support</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
