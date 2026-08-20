"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Loader from "@/components/Loader";
import OrderCard from "@/components/OrderCard";
import { subscribeOrder } from "@/lib/db";

function OrderInner() {
  const { id } = useParams();
  const params = useSearchParams();
  const success = params.get("success");
  const { user } = useAuth();

  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    const unsub = subscribeOrder(id, (o) => setOrder(o));
    return () => unsub();
  }, [id]);

  if (order === undefined) return <div className="container section"><Loader label="Loading order..." /></div>;
  if (order === null) {
    return (
      <div className="container section">
        <div className="state-box">
          <div className="state-icon">🚫</div>
          <h3>Order not found</h3>
          <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 12 }}>Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const isOwner = user && order.userId === user.uid;

  return (
    <div className="container section" style={{ maxWidth: 640 }}>
      {success && (
        <div className="alert alert-success">✅ Order placed successfully! Your order is now pending review.</div>
      )}

      <div className="dash-head">
        <h2>Order Details</h2>
      </div>

      <OrderCard order={order} />

      {order.refunded && order.status === "cancelled" && (
        <div className="alert alert-success" style={{ marginTop: 14 }}>
          💰 Order cancelled. Amount refunded to your wallet balance.
        </div>
      )}

      {order.status === "cancelled" && order.cancellationReason && (
        <div className="alert alert-danger" style={{ marginTop: 14 }}>
          <strong>Cancel Reason :</strong> {order.cancellationReason}
        </div>
      )}

      {order.status === "failed" && order.cancellationReason && (
        <div className="alert alert-danger" style={{ marginTop: 14 }}>
          <strong>Failed Reason :</strong> {order.cancellationReason}
        </div>
      )}

      {isOwner && order.status === "pending" && (
        <div className="alert alert-info" style={{ marginTop: 20 }}>
          ⏳ Your order is pending. An admin will process it shortly. You&apos;ll be notified when it&apos;s completed.
        </div>
      )}

      {isOwner && order.status === "processing" && (
        <div className="alert alert-info" style={{ marginTop: 20 }}>
          ⏳ Your order is being processed. You&apos;ll be notified once it&apos;s completed.
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/orders" className="btn btn-primary">My Orders</Link>
        <Link href="/products" className="btn btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="container section"><Loader /></div>}>
        <OrderInner />
      </Suspense>
    </AuthGuard>
  );
}
