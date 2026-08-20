"use client";

import { useState } from "react";

// FAQ content targeting the highest-intent "how to top up" queries.
// Rendered on the home page + injected as FAQPage JSON-LD for rich results.
const FAQS = [
  {
    q: "কীভাবে Free Fire ডায়মন্ড টপ আপ করবো?",
    a: "খুব সহজ — গেম বেছে নিন, আপনার Free Fire UID দিন, প্যাকেজ সিলেক্ট করুন, bKash/Nagad/Rocket দিয়ে পেমেন্ট করুন। পেমেন্ট confirm হলেই সাথে সাথে ডায়মন্ড আপনার অ্যাকাউন্টে চলে আসে।",
  },
  {
    q: "Free Fire ডায়মন্ড কতক্ষণে ডেলিভারি হয়?",
    a: "বেশিরভাগ অর্ডার মাত্র কয়েক মিনিটের মধ্যে ডেলিভারি হয়। পেমেন্ট verify হয়ে গেলে আপনার ডায়মন্ড সাথে সাথে Free Fire অ্যাকাউন্টে যোগ হয়ে যায়।",
  },
  {
    q: "কোন কোন পেমেন্ট পদ্ধতি সাপোর্টেড?",
    a: "bKash, Nagad, Rocket এবং Wallet ব্যালেন্স — সবকটি পেমেন্ট পদ্ধতিই সাপোর্টেড। কোনো ক্রেডিট কার্ড লাগবে না।",
  },
  {
    q: "টপ আপ করা কি নিরাপদ?",
    a: "হ্যাঁ, সম্পূর্ণ নিরাপদ। শুধু আপনার Player ID/UID লাগে, কখনো পাসওয়ার্ড চাওয়া হয় না। আপনার অ্যাকাউন্ট সম্পূর্ণ সুরক্ষিত থাকে।",
  },
  {
    q: "Free Fire ছাড়া অন্য কোন গেম সাপোর্টেড?",
    a: "Free Fire ছাড়াও PUBG Mobile UC, Mobile Legends ডায়মন্ড, eFootball Coins সহ আরও জনপ্রিয় গেমের টপ আপ সাপোর্টেড।",
  },
  {
    q: "সবচেয়ে কম দামে Free Fire ডায়মন্ড কোথায় পাবো?",
    a: "TASAM TOP UP BD-তে Bangladesh-এর সেরা দামে Free Fire ডায়মন্ড পাবেন। নিয়মিত অফার ও ডিসকাউন্টের জন্য আমাদের পেজ ফলো করুন।",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section" id="faq" style={{ background: "#fff" }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>সাধারণ প্রশ্নোত্তর</h2>
          <p>গেম টপ আপ নিয়ে যেসব প্রশ্ন সবচেয়ে বেশি আসে</p>
        </div>

        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className={"faq-item" + (open === i ? " open" : "")}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="faq-chevron">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Export the FAQ data for JSON-LD injection
export { FAQS };
