"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const is = (p) => pathname === p;

  // Profile section = dashboard (any sub-tab) + order detail + notifications
  const isProfileSection =
    pathname === "/dashboard" ||
    pathname.startsWith("/order/") ||
    pathname === "/notifications";

  const profileHref = user ? "/dashboard" : "/login";
  const ordersHref = user ? "/orders" : "/login";

  return (
    <nav className="mobile-nav">
      <Link href="/" className={is("/") ? "mn-link active" : "mn-link"}>
        <span className="mn-icon">🏠</span>
        <span className="mn-text">Home</span>
      </Link>

      <Link
        href="/products"
        className={
          pathname.startsWith("/products") ? "mn-link active" : "mn-link"
        }
      >
        <span className="mn-icon">🎮</span>
        <span className="mn-text">Top Up</span>
      </Link>

      <Link
        href="/deposit"
        className={is("/deposit") ? "mn-link featured active" : "mn-link featured"}
      >
        <span className="mn-icon">＋</span>
        <span className="mn-text">Add Money</span>
      </Link>

      <Link
        href={ordersHref}
        className={pathname === "/orders" ? "mn-link active" : "mn-link"}
      >
        <span className="mn-icon">📦</span>
        <span className="mn-text">Orders</span>
      </Link>

      <Link
        href={profileHref}
        className={isProfileSection || is("/login") || is("/register") ? "mn-link active" : "mn-link"}
      >
        <span className="mn-icon">👤</span>
        <span className="mn-text">{user ? "Profile" : "Login"}</span>
      </Link>
    </nav>
  );
}
