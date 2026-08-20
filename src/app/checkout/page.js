"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import AuthGuard from "@/components/AuthGuard";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import { getProduct, createOrder } from "@/lib/db";
import { formatMoney } from "@/lib/utils";
import { fetchFreeFireName } from "@/lib/ff";

function CheckoutInner() {
  const { user, profile } = useAuth();
  const settings = useSettings();
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("product");

  const [product, setProduct] = useState(undefined);
  const [error, setError] = useState(null);
  const [gameUid, setGameUid] = useState("");
  const [method, setMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  // Account-name check state
  const [checkingName, setCheckingName] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null); // { ok, name, level, region, error }
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (!productId) return;
    getProduct(productId)
      .then((p) => setProduct(p))
      .catch((e) => setError(e.message));
  }, [productId]);

  if (error) return <div className="container section"><ErrorState message={error} /></div>;
  if (product === undefined) return <div className="container section"><Loader label="Loading checkout..." /></div>;
  if (product === null) {
    return (
      <div className="container section">
        <div className="state-box">
          <div className="state-icon">🚫</div>
          <h3>Product not found</h3>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: 12 }}>Browse Products</Link>
        </div>
      </div>
    );
  }

  const payInfo = settings.payment[method];
  const usingWallet = method === "wallet";
  const walletBalance = profile?.walletBalance || 0;
  const insufficient = usingWallet && walletBalance < product.price;

  async function checkName() {
    setNameError("");
    setAccountInfo(null);
    const uid = gameUid.trim();
    if (!uid || uid.length < 5) {
      setNameError("Please enter a valid UID first.");
      return;
    }
    setCheckingName(true);
    try {
      const res = await fetchFreeFireName(uid, settings);
      if (res.ok) {
        setAccountInfo(res);
      } else {
        setNameError(res.error || "Could not find this account.");
      }
    } catch (e) {
      setNameError("Something went wrong while checking.");
    } finally {
      setCheckingName(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!gameUid.trim() || gameUid.trim().length < 5) {
      setFormError("Please enter a valid game UID / Player ID.");
      return;
    }
    if (!usingWallet && !trxId.trim()) {
      setFormError("Please enter your payment Transaction ID (TrxID).");
      return;
    }
    if (!usingWallet && !senderNumber.trim()) {
      setFormError("Please enter the number you sent money FROM (sender number).");
      return;
    }
    if (insufficient) {
      setFormError("Insufficient wallet balance. Please deposit first.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.uid,
        customerName: profile?.name || user.displayName || "Customer",
        customerEmail: user.email || "",
        customerPhone: profile?.phone || "",
        senderNumber: senderNumber.trim(),
        gameUid,
        product,
        paymentMethod: usingWallet ? "wallet" : method,
        paymentTrxId: trxId,
        paymentNumber: usingWallet ? "" : payInfo.number,
      });
      router.replace(`/order/${order.id}?success=1`);
    } catch (err) {
      console.error(err);
      setFormError("Failed to place order. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 640 }}>
      <div className="dash-head">
        <h2>Checkout</h2>
        <Link href={`/products/${product.id}`} className="btn btn-outline btn-sm">← Back</Link>
      </div>

      <div className="card">
        <div className="order-detail" style={{ marginBottom: 20 }}>
          <div className="order-row">
            <span className="k">Product</span>
            <span className="v">{product.name}</span>
          </div>
          {product.diamondAmount ? (
            <div className="order-row">
              <span className="k">Diamonds</span>
              <span className="v">💎 {product.diamondAmount}</span>
            </div>
          ) : null}
          <div className="order-row">
            <span className="k">Total</span>
            <span className="v" style={{ fontSize: 20, color: "var(--primary)" }}>{formatMoney(product.price)}</span>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          {formError && <div className="form-error">{formError}</div>}

          <div className="field">
            <label>Game UID / Player ID *</label>
            <input
              type="text"
              value={gameUid}
              onChange={(e) => { setGameUid(e.target.value); setAccountInfo(null); setNameError(""); }}
              placeholder={product.game === "Free Fire" ? "e.g. 1234567890" : "Enter your Player ID"}
              required
            />
            {product.game === "Free Fire" && (
              <div className="uid-check">
                {!accountInfo?.ok ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm uid-check-btn"
                    onClick={checkName}
                    disabled={checkingName}
                  >
                    {checkingName ? "Checking…" : "🔍 Check Account Name"}
                  </button>
                ) : (
                  <div className="uid-result">
                    <span className="uid-check-icon">✅</span>
                    <div>
                      <strong className="uid-name">{accountInfo.name}</strong>
                      {accountInfo.level != null && (
                        <span className="uid-meta">Level {accountInfo.level}{accountInfo.region ? ` · ${accountInfo.region}` : ""}</span>
                      )}
                    </div>
                  </div>
                )}
                {nameError && <div className="uid-error">{nameError}</div>}
              </div>
            )}
            <div className="field-hint">⚠️ Double check your UID — wrong UID cannot be refunded.</div>
          </div>

          <div className="field">
            <label>Payment Method</label>
            <div className="pay-grid">
              <div className={method === "bkash" ? "pay-option active" : "pay-option"} onClick={() => setMethod("bkash")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pay-logo-img" src={settings.payLogos?.bkash || "/pay/bkash.png"} alt="bKash" />
                bKash
              </div>
              <div className={method === "nagad" ? "pay-option active" : "pay-option"} onClick={() => setMethod("nagad")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pay-logo-img" src={settings.payLogos?.nagad || "/pay/nagad.png"} alt="Nagad" />
                Nagad
              </div>
              <div className={method === "rocket" ? "pay-option active" : "pay-option"} onClick={() => setMethod("rocket")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pay-logo-img" src={settings.payLogos?.rocket || "/pay/rocket.png"} alt="Rocket" />
                Rocket
              </div>
              <div className={method === "wallet" ? "pay-option active" : "pay-option"} onClick={() => setMethod("wallet")}>
                <span className="pay-logo">👛</span> Wallet
              </div>
            </div>
          </div>

          {usingWallet ? (
            <div className={insufficient ? "alert alert-warning" : "alert alert-info"}>
              Wallet balance: <strong>{formatMoney(walletBalance)}</strong>
              {insufficient ? " — Insufficient. Please deposit more." : ""}
            </div>
          ) : (
            <div className="alert alert-info">
              Send <strong>{formatMoney(product.price)}</strong> to this {method.toUpperCase()} number:<br />
              <strong style={{ fontSize: 18 }}>{payInfo.number}</strong> ({payInfo.type})
            </div>
          )}

          {!usingWallet && (
            <>
              <div className="field">
                <label>Sender Number *</label>
                <input type="tel" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন (01XXXXXXXXX)" required />
                <div className="field-hint">Enter the number you sent money FROM.</div>
              </div>

              <div className="field">
                <label>Transaction ID (TrxID) *</label>
                <input type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="e.g. 9XK2ABCDEF" required />
                <div className="field-hint">Enter the TrxID shown after you send money.</div>
              </div>
            </>
          )}

          <button className="btn btn-accent btn-block" disabled={submitting || (usingWallet && insufficient)}>
            {submitting ? "Placing order..." : `Confirm Order — ${formatMoney(product.price)}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="container section"><Loader /></div>}>
        <CheckoutInner />
      </Suspense>
    </AuthGuard>
  );
}
