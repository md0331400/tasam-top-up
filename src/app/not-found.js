import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container section">
      <div className="state-box">
        <div className="state-icon">🧭</div>
        <h1 style={{ fontSize: 48 }}>404</h1>
        <h3>Page not found</h3>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Go Home</Link>
      </div>
    </div>
  );
}
