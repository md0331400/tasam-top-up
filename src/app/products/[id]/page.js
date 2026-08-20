"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import { getProduct } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { SITE } from "@/lib/config";

// Inject BreadcrumbList JSON-LD for the product page (richer search result).
function injectBreadcrumb(product) {
  if (typeof document === "undefined") return;
  let el = document.getElementById("breadcrumb-ld");
  if (!el) {
    el = document.createElement("script");
    el.id = "breadcrumb-ld";
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Top Up", item: `${SITE.url}/products` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE.url}/products/${product.id}` },
    ],
  });
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getProduct(id)
      .then((p) => active && setProduct(p))
      .catch((e) => active && setError(e.message));
    return () => (active = false);
  }, [id]);

  if (error) return <div className="container section"><ErrorState message={error} /></div>;
  if (product === undefined) return <div className="container section"><Loader label="Loading product..." /></div>;
  if (product === null) {
    return (
      <div className="container section">
        <div className="state-box">
          <div className="state-icon">🚫</div>
          <h3>Product not found</h3>
          <p>This product may have been removed.</p>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: 12 }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  injectBreadcrumb(product);

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <div className="card">
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 14, border: "1px solid var(--border)" }}
            />
          ) : (
            <div style={{ fontSize: 56 }}>{product.icon || "🎮"}</div>
          )}
          <div>
            <span className="chip">{product.game}</span>
            <h1 style={{ fontSize: 26, marginTop: 6 }}>{product.name}</h1>
            {product.diamondAmount ? <p style={{ color: "var(--muted)" }}>💎 {product.diamondAmount} Diamonds</p> : null}
          </div>
        </div>

        {product.description && <p style={{ color: "var(--muted)", marginBottom: 20 }}>{product.description}</p>}

        <div className="order-detail">
          <div className="order-row">
            <span className="k">Price</span>
            <span className="v" style={{ fontSize: 22, color: "var(--primary)" }}>{formatMoney(product.price)}</span>
          </div>
          <div className="order-row">
            <span className="k">Delivery Time</span>
            <span className="v">Instant (5–15 min)</span>
          </div>
          <div className="order-row">
            <span className="k">Payment Methods</span>
            <span className="v">bKash · Nagad · Rocket · Wallet</span>
          </div>
        </div>

        <div className="product-actions">
          <Link href="/products" className="btn btn-outline">← Back</Link>
          {user ? (
            <Link href={`/checkout?product=${product.id}`} className="btn btn-accent">Buy Now</Link>
          ) : (
            <Link href={`/login?next=${encodeURIComponent("/checkout?product=" + product.id)}`} className="btn btn-accent">Login to Buy</Link>
          )}
        </div>
      </div>
    </div>
  );
}
