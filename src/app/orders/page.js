"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import OrderCard from "@/components/OrderCard";
import { subscribeUserOrders } from "@/lib/db";

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersInner />
    </AuthGuard>
  );
}

function OrdersInner() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeUserOrders(user.uid, (o) => setOrders(o));
    return () => unsub();
  }, [user]);

  if (!orders) return <div className="container section"><Loader label="Loading your orders..." /></div>;

  return (
    <div className="container section">
      <div className="section-head">
        <span className="eyebrow">Orders</span>
        <h2>My Orders</h2>
        <p>আপনার সব অর্ডারের হিসাব</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="🛒" title="No orders yet" message="You haven't placed any order. Start topping up now!">
          <Link href="/products" className="btn btn-accent" style={{ marginTop: 14 }}>Start Top Up</Link>
        </EmptyState>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <Link key={o.id} href={`/order/${o.id}`} className="oc-link">
              <OrderCard order={o} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
