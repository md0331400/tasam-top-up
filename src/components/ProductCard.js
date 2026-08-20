import Link from "next/link";
import { formatMoney } from "@/lib/utils";

const GAME_ICONS = {
  "Free Fire": "🔥",
  "PUBG": "🔫",
  "E-Football": "⚽",
  "Dream League Soccer": "🥅",
  "Mobile Legends": "⚔️",
  "Clash of Clans": "🏰",
  "Call of Duty": "🎯",
};

// Plain-text icon values (e.g. "diamond") get mapped to a clean emoji.
const ICON_WORD_MAP = {
  diamond: "💎",
  diamonds: "💎",
  "free fire": "🔥",
  pubg: "🔫",
  fire: "🔥",
  coin: "🪙",
  uc: "💎",
  topup: "⚡",
};

function resolveIcon(icon) {
  if (!icon) return "🎮";
  const l = String(icon).toLowerCase().trim();
  if (ICON_WORD_MAP[l]) return ICON_WORD_MAP[l];
  return icon;
}

export default function ProductCard({ product }) {
  const icon = resolveIcon(product.icon) || GAME_ICONS[product.game] || "🎮";
  const soldOut = product.soldOut === true;

  const inner = (
    <>
      <div className="product-thumb">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-thumb-fallback">
            <span className="product-icon-emoji">{icon}</span>
          </div>
        )}
        {soldOut ? (
          <span className="badge soldout-badge">Sold Out</span>
        ) : product.diamondAmount ? (
          <span className="badge">💎 {product.diamondAmount}</span>
        ) : null}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-row">
          <span className="product-price">{formatMoney(product.price)}</span>
          <span className={soldOut ? "product-buy disabled" : "product-buy"}>
            {soldOut ? "Sold Out" : "Buy"}
          </span>
        </div>
      </div>
    </>
  );

  // Sold out products are visible but NOT clickable
  if (soldOut) {
    return <div className="product-card soldout">{inner}</div>;
  }

  return (
    <Link href={`/products/${product.id}`} className="product-card">
      {inner}
    </Link>
  );
}
