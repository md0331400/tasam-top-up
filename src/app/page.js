"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GameCard from "@/components/GameCard";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import FaqSection from "@/components/FaqSection";
import { subscribeGames } from "@/lib/db";
import { useSettings } from "@/context/SettingsContext";

export default function Home() {
  const settings = useSettings();
  const [games, setGames] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsub;
    try {
      unsub = subscribeGames(
        (list) => setGames(list),
        (err) => setError(err.message)
      );
    } catch (e) {
      setError(e.message);
    }
    return () => unsub && unsub();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <span className="hero-kicker">⚡ Fastest Top Up in Bangladesh</span>
          <h1>Game Top Up Made Simple</h1>
          <p>{settings.tagline} — ফ্রি ফায়ার ডায়মন্ড টপ আপ এখন এক জায়গায়। bKash, Nagad, Rocket & Wallet দিয়ে পেমেন্ট করুন, সাথে সাথে ডেলিভারি।</p>
          <div className="hero-cta">
            <a href="#games" className="btn btn-accent">🎮 Choose Game</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="num">24/7</div><div className="lbl">Support</div></div>
            <div className="hero-stat"><div className="num">Instant</div><div className="lbl">Delivery</div></div>
            <div className="hero-stat"><div className="num">100%</div><div className="lbl">Secure</div></div>
          </div>

          {/* FEATURE BAR — integrated into the dark hero (translucent badges) */}
          <div className="hero-features">
            <span className="hero-feature"><span className="si">⚡</span> Instant Delivery</span>
            <span className="hero-feature"><span className="si">🔒</span> 100% Secure</span>
            <span className="hero-feature"><span className="si">🕒</span> 24/7 Support</span>
            <span className="hero-feature"><span className="si">💰</span> Best Price</span>
            <span className="hero-feature"><span className="si">💳</span> bKash · Nagad · Rocket</span>
          </div>
        </div>
      </section>

      {/* GAMES */}
      <section className="section" id="games">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Choose Your Game</span>
            <h2>Select a Game to Top Up</h2>
            <p>আপনার পছন্দের গেম বেছে নিন</p>
          </div>

          {error && <ErrorState message={error} retry={() => window.location.reload()} />}

          {!error && !games && <Loader label="Loading games..." />}

          {games && games.length === 0 && (
            <div className="state-box">
              <div className="state-icon">🎮</div>
              <h3>No games yet</h3>
              <p>Games will appear here once the admin adds them.</p>
            </div>
          )}

          {games && games.length > 0 && (
            <div className="games-grid">
              {games.map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How It Works</span>
            <h2>৩টি সহজ ধাপে টপ আপ</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h4>গেম বাছুন</h4>
              <p>আপনার পছন্দের গেম নির্বাচন করুন</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h4>UID দিন ও পেমেন্ট করুন</h4>
              <p>গেম UID লিখে bKash/Nagad/Rocket-এ পেমেন্ট করুন</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h4>ডেলিভারি নিন</h4>
              <p>ডায়মন্ড সাথে সাথে আপনার অ্যাকাউন্টে</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — high-intent SEO content + FAQPage JSON-LD */}
      <FaqSection />
    </>
  );
}
