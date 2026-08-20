"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "./Loader";

// Wraps protected pages — redirects to /login if not authenticated
export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    }
  }, [loading, user, router]);

  if (loading) return <Loader label="Checking your session..." />;
  if (!user) return null;
  return children;
}
