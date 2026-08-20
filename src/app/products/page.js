"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import { subscribeProducts, subscribeGames } from "@/lib/db";

function ProductsInner() {
  const params = useSearchParams();
  const gameId = params.get("game"); // null → direct Top Up (all games)

  const [products, setProducts] = useState(null);
  const [games, setGames] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubs = [];
    try {
      unsubs.push(subscribeProducts(
        (list) => setProducts(list),
        (err) => setError(err.message)
      ));
      unsubs.push(subscribeGames(
        (list) => setGames(list),
        (err) => setError(err.message)
      ));
    } catch (e) {
      setError(e.message);
    }
    return () => unsubs.forEach((u) => u && u());
  }, []);

  // Games sorted by sortOrder (asc) for a stable, admin-controlled order.
  const gamesSorted = useMemo(
    () => (games ? [...games].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)) : []),
    [games]
  );

  const selectedGame = useMemo(
    () => gamesSorted.find((g) => g.id === gameId) || null,
    [gamesSorted, gameId]
  );

  // Products matching a game name (case/whitespace-insensitive).
  const productsForGame = (name) =>
    (products || []).filter(
      (p) => (p.game || "").trim().toLowerCase() === (name || "").trim().toLowerCase()
    );

  if (error) return <div className="container section"><ErrorState message={error} /></div>;
  if (!products || !games) return <div className="container section"><Loader label="Loading products..." /></div>;

  return (
    <div className="container section">
      {selectedGame ? (
        /* CASE 1 — a specific game selected (from Home screen) */
        <>
          <GameHeader game={selectedGame} count={productsForGame(selectedGame.name).length} />

          {productsForGame(selectedGame.name).length === 0 ? (
            <NoItems />
          ) : (
            <div className="grid">
              {productsForGame(selectedGame.name).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* CASE 2 — direct Top Up: ALL games + their products (or "No item available") */
        <>
          <div className="section-head">
            <span className="eyebrow">Top Up</span>
            <h2>All Games</h2>
          </div>

          {gamesSorted.length === 0 && (
            <div className="state-box">
              <div className="state-icon">🎮</div>
              <h3>No games yet</h3>
            </div>
          )}

          {gamesSorted.map((g) => {
            const list = productsForGame(g.name);
            return (
              <div key={g.id} className="category-block">
                <GameHeader game={g} count={list.length} />
                {list.length === 0 ? (
                  <NoItems />
                ) : (
                  <div className="grid">
                    {list.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Any products whose game no longer maps to a known game */}
          {(() => {
            const matched = new Set(gamesSorted.map((g) => g.name.trim().toLowerCase()));
            const orphans = (products || []).filter(
              (p) => !matched.has((p.game || "").trim().toLowerCase())
            );
            if (orphans.length === 0) return null;
            return (
              <div className="category-block">
                <GameHeader game={{ name: "Other Games", id: "", logoUrl: "", icon: "🎮" }} count={orphans.length} />
                <div className="grid">
                  {orphans.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

// Empty placeholder shown when a game has no products yet
function NoItems() {
  return (
    <div className="no-items">
      <span className="no-items-icon">📦</span>
      <span>No item available</span>
    </div>
  );
}

// [small Game Logo] Game Name ───────────── Items X  (all on one line)
function GameHeader({ game, count }) {
  return (
    <div className="game-header">
      <span className="game-header-logo">
        {game.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.logoUrl} alt={game.name} />
        ) : (
          <span>{game.icon || "🎮"}</span>
        )}
      </span>
      <span className="game-header-name">{game.name}</span>
      <span className="game-header-line"></span>
      <span className="game-header-count">Items {count}</span>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container section"><Loader /></div>}>
      <ProductsInner />
    </Suspense>
  );
}
