"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "" | "sent" | "error"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    setMessage("");
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setStatus("sent");
      setMessage("Password reset email sent. Please check your email inbox.");
    } catch (err) {
      setStatus("error");
      setMessage(mapResetError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card">
        <h2>Forgot Password 🔑</h2>
        <p className="sub">Enter your registered email to reset your password</p>

        <form className="form" onSubmit={onSubmit}>
          {message && <div className={status === "sent" ? "form-success" : "form-error"}>{message}</div>}
          <div className="field">
            <label>Registered Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="auth-alt">
          Remembered your password? <Link href="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

function mapResetError(code) {
  switch (code) {
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    default:
      return "Could not send the reset email. Please try again.";
  }
}
