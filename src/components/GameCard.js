import Link from "next/link";

// Game card shown on the Home page.
// Layout: big image/logo on top, game name below, and a "Top Up" button.
export default function GameCard({ game }) {
  return (
    <Link href={`/products?game=${encodeURIComponent(game.id)}`} className="game-card">
      <div className="game-card-image">
        {game.imageUrl || game.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.imageUrl || game.logoUrl}
            alt={game.name}
            loading="lazy"
          />
        ) : (
          <span className="game-card-fallback">{game.icon || "🎮"}</span>
        )}
      </div>
      <div className="game-card-name">{game.name}</div>
      <span className="game-card-btn">Top Up</span>
    </Link>
  );
}
