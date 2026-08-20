"use client";

import { useSettings } from "@/context/SettingsContext";

export default function ContactPage() {
  const settings = useSettings();

  return (
    <div className="container section" style={{ maxWidth: 560 }}>
      <div className="section-head">
        <span className="eyebrow">Contact Us</span>
        <h2>আমাদের সাথে যোগাযোগ করুন</h2>
        <p>যেকোনো সমস্যায় ২৪/৭ সাপোর্টে যোগাযোগ করুন</p>
      </div>

      <div className="card">
        <div className="order-detail">
          <div className="order-row">
            <span className="k">📞 Phone</span>
            <span className="v">{settings.support.phone}</span>
          </div>
          <div className="order-row">
            <span className="k">✉️ Email</span>
            <span className="v">{settings.support.email}</span>
          </div>
        </div>

        <div className="support-actions" style={{ marginTop: 24 }}>
          <a href={settings.support.telegram} target="_blank" rel="noreferrer" className="btn btn-telegram">Telegram</a>
          <a href={settings.support.whatsapp} target="_blank" rel="noreferrer" className="btn btn-whatsapp">WhatsApp</a>
          <a href={settings.support.facebook} target="_blank" rel="noreferrer" className="btn btn-facebook">Facebook</a>
        </div>
      </div>
    </div>
  );
}
