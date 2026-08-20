"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Google sign-in / sign-up button. On success redirects to `next` (default dashboard).
export default function GoogleButton({ label = "Continue with Google", next = "/dashboard" }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const u = await loginWithGoogle();
      if (u) {
        router.replace(next);
      }
      // if u is null → redirect flow, page reloads automatically
    } catch (err) {
      // Show the real reason so we can fix it (e.g. domain not authorized).
      setError(mapGoogleError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="google-wrap">
      <button type="button" className="btn btn-google btn-block" onClick={handleGoogle} disabled={loading}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        {loading ? "Please wait..." : label}
      </button>
      {error && <div className="form-error" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  );
}

function mapGoogleError(code) {
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google sign-in. Add it in Firebase → Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled. Enable it in Firebase → Authentication → Sign-in method.";
    case "auth/popup-blocked":
      return "Popup was blocked. Please allow popups for this site and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with a different sign-in method. Try logging in with email/password.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection and try again.";
    default:
      return "Google sign-in failed. Please try again. (" + code + ")";
  }
}
