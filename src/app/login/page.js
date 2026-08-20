"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import GoogleButton from "@/components/GoogleButton";


function LoginForm() {
  const { login, loginWithPhone } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [identifier, setIdentifier] = useState(""); // email OR phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isPhone = /^[0-9+\-\s]{6,}$/.test(identifier.trim());

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isPhone) {
        await loginWithPhone(identifier, password);
      } else {
        await login(identifier, password);
      }
      router.replace(next);
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card">
        <h2>Welcome Back 👋</h2>
        <p className="sub">Login to continue your top up</p>

        <GoogleButton label="Continue with Google" next={next} />

        <div className="auth-divider">
          <span>or login with email / phone</span>
        </div>

        <form className="form" onSubmit={onSubmit}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label>Email or Phone Number</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or 01XXXXXXXXX"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-alt" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <Link href="/forgot-password">Forgot Password?</Link>
          <span>Don&apos;t have an account? <Link href="/register">Sign Up</Link></span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function mapAuthError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email/phone or password.";
    case "phone_not_found":
      return "This phone number is not registered. Please sign up first.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return "Login failed. Please try again.";
  }
}
