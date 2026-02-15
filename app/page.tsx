"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dimensions } from "@/lib/questions";

export default function Home() {
  const router = useRouter();
  const [yourName, setYourName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    if (!yourName.trim() || !partnerName.trim()) return;
    setLoading(true);
    const params = new URLSearchParams({
      you: yourName.trim(),
      partner: partnerName.trim(),
    });
    router.push(`/quiz?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center px-4 py-12 max-w-lg mx-auto">
      {/* Shooting star icon */}
      <div className="text-5xl mb-6">🌠</div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 gold-text leading-tight">
        How Compatible
        <br />
        Are You, Really?
      </h1>

      {/* Subtitle */}
      <p className="text-center text-white/60 text-lg mb-10 max-w-md">
        A 2-minute quiz that maps your relationship DNA across 7 dimensions
      </p>

      {/* How it works card */}
      <div className="glass-card p-8 w-full mb-8">
        <div className="space-y-6">
          {[
            { num: 1, title: "You take the quiz", desc: "Answer 10 quick questions about your relationship style" },
            { num: 2, title: "Send to your partner", desc: "They take the same quiz independently" },
            { num: 3, title: "Get your report", desc: "See your 7-dimension compatibility breakdown" },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                {step.num}
              </div>
              <div>
                <p className="font-semibold text-white">{step.title}</p>
                <p className="text-white/50 text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {dimensions.map((dim) => (
          <span key={dim.key} className="dimension-pill">
            {dim.emoji} {dim.label}
          </span>
        ))}
      </div>

      {/* Social proof */}
      <p className="text-center text-white/50 text-sm mb-8">
        😍🥰😘🥰💕 <span className="text-white/70 font-medium">47,283</span> couples tested this week
      </p>

      {/* Name inputs */}
      <div className="w-full space-y-4 mb-6">
        <input
          type="text"
          placeholder="Your first name"
          value={yourName}
          onChange={(e) => setYourName(e.target.value)}
          className="cosmic-input"
          maxLength={30}
        />
        <input
          type="text"
          placeholder="Partner's first name"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          className="cosmic-input"
          maxLength={30}
        />
      </div>

      {/* CTA Button */}
      <button
        onClick={handleStart}
        disabled={!yourName.trim() || !partnerName.trim() || loading}
        className="gradient-btn w-full py-4 rounded-2xl text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? "Loading..." : "Start Your Compatibility Test →"}
      </button>

      {/* Price note */}
      <p className="text-center text-white/30 text-xs mt-4">
        One-time $1.99 for both partners &middot; No subscriptions ever
      </p>
    </div>
  );
}
