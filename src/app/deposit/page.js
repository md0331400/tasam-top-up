"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import AuthGuard from "@/components/AuthGuard";
import { requestDeposit } from "@/lib/db";
import { formatMoney } from "@/lib/utils";


export default function DepositPage() {
  return (
    <AuthGuard>
      <DepositInner />
    </AuthGuard>
  );
}

function DepositInner() {
  const { user, profile } = useAuth();
  const settings = useSettings();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [trxId, setTrxId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const payInfo = settings.payment[method];

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const amt = Number(amount);
    if (!amt || amt < 10) {
      setError("Please enter a valid amount (minimum ৳10).");
      return;
    }
    if (!trxId.trim()) {
      setError("Please enter your payment Transaction ID (TrxID).");
      return;
    }
    if (!senderNumber.trim()) {
      setError("Please enter the number you sent money FROM (sender number).");
      return;
    }
    setLoading(true);
    try {
      await requestDeposit({
        userId: user.uid,
        amount: amt,
        method,
        trxId,
        number: profile?.phone || "",
        senderNumber,
      });
      router.replace("/dashboard?tab=wallet");
    } catch (err) {
      console.error(err);
      setError("Failed to submit deposit. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 560 }}>
      <div className="section-head">
        <h2>Add Balance to Wallet</h2>
        <p>Deposit money to pay for orders instantly</p>
      </div>

      <div className="card">
        <div className="alert alert-info">
          Current wallet balance: <strong>{formatMoney(profile?.walletBalance || 0)}</strong>
        </div>

        <form className="form" onSubmit={onSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label>Amount (৳) *</label>
            <input type="number" min="10" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 500" required />
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
            </div>
          </div>

          <div className="alert alert-warning">
            Send <strong>{formatMoney(Number(amount) || 0)}</strong> to this {method.toUpperCase()} number:<br />
            <strong style={{ fontSize: 18 }}>{payInfo.number}</strong> ({payInfo.type})
          </div>

          <div className="field">
            <label>Transaction ID (TrxID) *</label>
            <input type="text" value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="e.g. 9XK2ABCDEF" required />
          </div>

          <div className="field">
            <label>Sender Number *</label>
            <input type="tel" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন (01XXXXXXXXX)" required />
            <div className="field-hint">Enter the number you sent money FROM, for verification.</div>
          </div>

          <button className="btn btn-accent btn-block" disabled={loading}>
            {loading ? "Submitting..." : "Submit Deposit Request"}
          </button>

          <p className="field-hint" style={{ textAlign: "center" }}>
            Your deposit will be verified by an admin and added to your wallet.
          </p>
        </form>
      </div>
    </div>
  );
}
