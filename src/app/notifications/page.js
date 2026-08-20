"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { subscribeNotifications, markNotificationRead } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsInner />
    </AuthGuard>
  );
}

const TYPE_ICON = {
  order: "🛒",
  announcement: "📣",
  product: "🎮",
};

function linkFor(n) {
  if (n.orderId) return `/order/${n.orderId}`;
  if (n.productId) return `/products/${n.productId}`;
  return null;
}

function NotificationsInner() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.uid, (n) => setNotifs(n));
    return () => unsub();
  }, [user]);

  if (!notifs) return <div className="container section"><Loader label="Loading notifications..." /></div>;

  return (
    <div className="container section" style={{ maxWidth: 680 }}>
      <div className="section-head">
        <span className="eyebrow">Inbox</span>
        <h2>Notifications 🔔</h2>
        <p>Order updates, announcements & product news</p>
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon="🔕" title="No notifications" message="You're all caught up." />
      ) : (
        <div className="card notif-list">
          {notifs.map((n) => {
            const href = linkFor(n);
            const body = (
              <div
                key={n.id}
                className={n.read ? "notif-item" : "notif-item unread"}
                onClick={() => !n.read && markNotificationRead(n.id, user.uid)}
                style={{ cursor: href ? "pointer" : "default" }}
              >
                <div className="n-icon">{TYPE_ICON[n.type] || "🔔"}</div>
                <div className="n-body">
                  <div className="n-title">
                    {n.title}
                    {n.type === "announcement" && <span className="chip chip-announce">Announcement</span>}
                  </div>
                  {(n.message || n.body) && <div className="n-text">{n.message || n.body}</div>}
                  <div className="n-time">
                    {formatDate(n.createdAt)}
                    {n.read && <span style={{ marginLeft: 8, color: "var(--muted)" }}>Read ✓</span>}
                  </div>
                </div>
                {href && <span className="btn btn-outline btn-sm">View →</span>}
              </div>
            );
            return href ? (
              <Link key={n.id} href={href} className="notif-link">
                {body}
              </Link>
            ) : (
              body
            );
          })}
        </div>
      )}
    </div>
  );
}
