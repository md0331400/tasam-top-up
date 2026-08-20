"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import StatusBadge from "@/components/StatusBadge";
import StatValue from "@/components/StatValue";
import { subscribeUserOrders, subscribeDeposits, subscribeTransactions, updateUserProfile } from "@/lib/db";
import { formatMoney, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}

function initials(name) {
  if (!name) return "🙂";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "🙂";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function DashboardInner() {
  const { user, profile, refreshProfile } = useAuth();
  const params = useSearchParams();
  const [tab, setTab] = useState("deposits");
  const [orders, setOrders] = useState(null);
  const [deposits, setDeposits] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [err, setErr] = useState(null);

  // Read tab from ?tab= query param (used by the drawer links)
  useEffect(() => {
    const t = params.get("tab");
    if (t && ["deposits", "transactions", "profile"].includes(t)) {
      setTab(t);
    }
  }, [params]);

  useEffect(() => {
    if (!user) return;
    const unsubs = [];
    try {
      unsubs.push(subscribeUserOrders(user.uid, (o) => setOrders(o), (e) => setErr(e.message)));
      unsubs.push(subscribeDeposits(user.uid, (d) => setDeposits(d)));
      unsubs.push(subscribeTransactions(user.uid, (t) => setTransactions(t)));
    } catch (e) {
      setErr(e.message);
    }
    return () => unsubs.forEach((u) => u && u());
  }, [user]);

  const stats = useMemo(() => {
    const list = orders || [];
    const completed = list.filter((o) => o.status === "completed");
    const spent = completed.reduce((s, o) => s + (o.amount || 0), 0);
    return {
      total: list.length,
      completed: completed.length,
      pending: list.filter((o) => o.status === "pending" || o.status === "processing").length,
      spent,
    };
  }, [orders]);

  if (err) return <div className="container section"><ErrorState message={err} /></div>;

  return (
    <div className="container section">
      {/* PROFILE HEADER (account overview) */}
      <div className="dash-hero">
        <div className="dash-avatar">{initials(profile?.name || user?.displayName)}</div>
        <div className="dash-id">
          <h2>{profile?.name || user?.displayName || "Customer"}</h2>
          <p>{user?.email}</p>
          {profile?.phone && <span className="chip">{profile.phone}</span>}
        </div>
        <div className="dash-wallet">
          <span className="dash-wallet-label">Wallet Balance</span>
          <span className="dash-wallet-amount">{formatMoney(profile?.walletBalance || 0)}</span>
          <Link href="/deposit" className="btn btn-accent btn-sm">+ Add Balance</Link>
        </div>
      </div>

      {/* STATS — compact responsive grid (2×2 mobile, 4×1 desktop) */}
      <div className="stats-row">
        <div className="stat-card"><div className="stat-label">Total Orders</div><StatValue value={stats.total} /></div>
        <div className="stat-card"><div className="stat-label">Completed</div><StatValue value={stats.completed} /></div>
        <div className="stat-card"><div className="stat-label">Pending</div><StatValue value={stats.pending} /></div>
        <div className="stat-card"><div className="stat-label">Total Spent</div><StatValue value={formatMoney(stats.spent)} /></div>
      </div>

      {/* TABS (content switcher) — My Orders moved to its own /orders page */}
      <div className="tabs">
        <button className={tab === "deposits" ? "tab active" : "tab"} onClick={() => setTab("deposits")}>Deposits</button>
        <button className={tab === "transactions" ? "tab active" : "tab"} onClick={() => setTab("transactions")}>Transactions</button>
        <button className={tab === "profile" ? "tab active" : "tab"} onClick={() => setTab("profile")}>Profile</button>
      </div>

      {tab === "deposits" && <WalletTab deposits={deposits} />}
      {tab === "transactions" && (
        <TransactionsTab transactions={transactions} fallbackPhone={profile?.phone} />
      )}
      {tab === "profile" && <ProfileTab profile={profile} refresh={refreshProfile} />}
    </div>
  );
}

function OrdersTab({ orders }) {
  if (!orders) return <Loader label="Loading your orders..." />;
  if (orders.length === 0) {
    return (
      <EmptyState icon="🛒" title="No orders yet" message="You haven't placed any order. Start topping up now!">
        <Link href="/products" className="btn btn-accent" style={{ marginTop: 14 }}>Start Top Up</Link>
      </EmptyState>
    );
  }
  return (
    <div className="table-wrap card" style={{ padding: 0 }}>
      <table className="data">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>UID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td data-label="Order ID" className="order-id">{o.orderId}</td>
              <td data-label="Product">{o.productName}</td>
              <td data-label="UID" className="order-id">{o.gameUid}</td>
              <td data-label="Amount">{formatMoney(o.amount)}</td>
              <td data-label="Status"><StatusBadge status={o.status} /></td>
              <td data-label="Date">{formatDate(o.createdAt)}</td>
              <td data-label=""><Link href={`/order/${o.id}`} className="btn btn-outline btn-sm">View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WalletTab({ deposits }) {
  return (
    <div>
      {!deposits ? <Loader label="Loading deposits..." /> : deposits.length === 0 ? (
        <EmptyState icon="👛" title="No deposits yet" message="Add funds to your wallet to pay faster.">
          <Link href="/deposit" className="btn btn-accent" style={{ marginTop: 14 }}>+ Add Balance</Link>
        </EmptyState>
      ) : (
        <div className="table-wrap card" style={{ padding: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Method</th>
                <th>TrxID</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td data-label="Amount">{formatMoney(d.amount)}</td>
                  <td data-label="Method">{d.method?.toUpperCase()}</td>
                  <td data-label="TrxID" className="order-id">{d.trxId || "—"}</td>
                  <td data-label="Status"><StatusBadge status={d.status} /></td>
                  <td data-label="Date">{formatDate(d.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TransactionsTab({ transactions, fallbackPhone }) {
  if (!transactions) return <Loader label="Loading transactions..." />;
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="🧾"
        title="No transactions found"
        message="Your wallet transactions will appear here once you top up or add funds."
      />
    );
  }

  const total = transactions
    .filter((t) => t.status === "completed")
    .reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="txn-title">
        <span className="txn-title-icon">📄</span>
        All Transaction
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Number</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td data-label="Number" className="txn-number">
                  {t.number || fallbackPhone || "—"}
                </td>
                <td data-label="Amount">{formatMoney(t.amount)}</td>
                <td data-label="Status"><StatusBadge status={t.status} /></td>
                <td data-label="Date">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="txn-total-bar">
        <span className="txn-total-label">Total:</span>
        <span className="txn-total-value">{formatMoney(total)}</span>
      </div>
    </div>
  );
}

function ProfileTab({ profile, refresh }) {
  const { user, changePassword } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Password change fields
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState("");

  useEffect(() => {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
  }, [profile]);

  async function save(e) {
    e.preventDefault();
    setMsg("");
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name: name.trim(), phone: phone.trim() });
      await refresh();
      setMsg("Profile updated successfully.");
    } catch (err) {
      setMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function changePass(e) {
    e.preventDefault();
    setPassMsg("");
    if (!oldPass) {
      setPassMsg("Please enter your current password.");
      return;
    }
    if (newPass.length < 6) {
      setPassMsg("New password must be at least 6 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg("New passwords do not match.");
      return;
    }
    setPassSaving(true);
    try {
      await changePassword(oldPass, newPass);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
      setPassMsg("Password changed successfully.");
    } catch (err) {
      setPassMsg("Wrong current password. Please try again.");
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Profile info card */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Your Profile</h3>
        <form className="form" onSubmit={save}>
          {msg && <div className={msg.includes("success") ? "form-success" : "form-error"}>{msg}</div>}
          <div className="field">
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>

      {/* Change password card */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 16 }}>Change Password</h3>
        <form className="form" onSubmit={changePass}>
          {passMsg && <div className={passMsg.includes("success") ? "form-success" : "form-error"}>{passMsg}</div>}
          <div className="field">
            <label>Current Password</label>
            <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} placeholder="Enter current password" />
          </div>
          <div className="field">
            <label>New Password</label>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Repeat new password" />
          </div>
          <button className="btn btn-accent" disabled={passSaving}>{passSaving ? "Changing..." : "Change Password"}</button>
        </form>
      </div>
    </div>
  );
}
