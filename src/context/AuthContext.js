"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserDoc, getUserDoc, claimPhone } from "@/lib/db";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // firebase auth user
  const [profile, setProfile] = useState(null); // firestore user doc
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const p = await getUserDoc(firebaseUser.uid);
          // If no Firestore doc exists yet (e.g. Google redirect flow),
          // create it now so name/email/profile always show.
          if (!p) {
            await createUserDoc(firebaseUser.uid, {
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              phone: firebaseUser.phoneNumber || "",
            });
          }
          const fresh = await getUserDoc(firebaseUser.uid);
          setProfile(fresh);
        } catch (e) {
          console.error("Profile load error", e);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = useCallback(async (name, email, password, phone) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Reserve the phone number BEFORE writing the profile. If the number is
    // already taken, claimPhone returns "duplicate" and we abort the signup
    // (deleting the just-created auth user) so no orphan account remains.
    if (phone) {
      const res = await claimPhone(cred.user.uid, phone, email);
      if (res !== "ok") {
        try { await cred.user.delete(); } catch (_) {}
        throw Object.assign(new Error("phone_taken"), { code: "phone_taken" });
      }
    }

    await createUserDoc(cred.user.uid, { name, email, phone });
    return cred.user;
  }, []);

  const login = useCallback(async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  }, []);

  // Sign in with a registered phone number + password (never exposes email).
  const loginWithPhone = useCallback(async (phone, password) => {
    const res = await fetch("/api/auth/phone-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.token) {
      return await signInWithCustomToken(auth, data.token);
    }
    // Map server error codes to friendly client-side codes.
    const map = {
      phone_not_found: "phone_not_found",
      invalid_credentials: "auth/invalid-credential",
      user_disabled: "auth/user-disabled",
      too_many_requests: "auth/too-many-requests",
    };
    throw Object.assign(new Error(data.error || "login_failed"), {
      code: map[data.error] || "auth/invalid-credential",
    });
  }, []);

  // Sign in (or sign up) with Google. Creates the Firestore profile doc
  // automatically on first login so the account is fully set up.
  // Uses redirect (works on mobile/iframe where popups are often blocked).
  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const cred = await signInWithPopup(auth, provider);
      const u = cred.user;
      const existing = await getUserDoc(u.uid);
      if (!existing) {
        await createUserDoc(u.uid, {
          name: u.displayName || "",
          email: u.email || "",
          phone: u.phoneNumber || "",
        });
      }
      return u;
    } catch (e) {
      // Popup blocked or unsupported → fall back to redirect flow.
      if (
        e.code === "auth/popup-blocked" ||
        e.code === "auth/popup-closed-by-user" ||
        e.code === "auth/cancelled-popup-request" ||
        e.code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, provider);
        return null; // page will reload after redirect, onAuthStateChanged handles login
      }
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const resetPassword = useCallback((email) => {
    return sendPasswordResetEmail(auth, email);
  }, []);

  // Change password for the currently signed-in user.
  // Verifies the old password first (re-auth), then updates.
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    const u = auth.currentUser;
    if (!u) throw new Error("Not signed in");
    if (!u.email) throw new Error("No email on account");

    // Re-authenticate with email + old password
    const credential = EmailAuthProvider.credential(u.email, oldPassword);
    await reauthenticateWithCredential(u, credential);
    // Then update the password
    await updatePassword(u, newPassword);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await getUserDoc(user.uid);
      setProfile(p);
    }
  }, [user]);

  const value = {
    user,
    profile,
    loading,
    register,
    login,
    loginWithPhone,
    loginWithGoogle,
    logout,
    resetPassword,
    changePassword,
    refreshProfile,
    isAdmin: profile?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
