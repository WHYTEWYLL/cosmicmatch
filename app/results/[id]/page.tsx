"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

interface IndividualResults {
  loveLanguage: { type: string; description: string };
  attachmentStyle: { type: string; description: string };
  dimensionScores: Record<string, number>;
}

interface CombinedDimension {
  key: string;
  label: string;
  emoji: string;
  scoreA: number;
  scoreB: number;
  compatibility: number;
}

interface CombinedResults {
  overallScore: number;
  dimensions: CombinedDimension[];
  headline: string;
  summary: string;
  strengths: string[];
  growthAreas: string[];
  person_b_results?: IndividualResults;
}

interface SessionData {
  sessionId: string;
  personAName: string;
  personBName: string;
  personAResults: IndividualResults;
  combinedResults: CombinedResults | null;
  partnerToken: string;
  partnerCompleted: boolean;
  paid: boolean;
}

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const justPaid = searchParams.get("paid") === "true";

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Fetch session data
  useEffect(() => {
    const fetchSession = () => {
      fetch(`/api/session/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setSession(data);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Could not load results.");
          setLoading(false);
        });
    };

    // If just paid, verify payment directly with Stripe first
    if (justPaid) {
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then(() => fetchSession())
        .catch(() => fetchSession());
    } else {
      fetchSession();
    }
  }, [sessionId, justPaid]);

  // Poll for partner completion if partner hasn't completed yet
  useEffect(() => {
    if (!session || session.partnerCompleted) return;

    const interval = setInterval(() => {
      fetch(`/api/session/${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.partnerCompleted) {
            setSession(data);
            clearInterval(interval);
          }
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [session, sessionId]);

  const copyPartnerLink = () => {
    if (!session) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/quiz/${session.partnerToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-5xl mb-4 animate-pulse">🌠</div>
        <p className="text-white/60">Loading your results...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-white/60">{error || "Something went wrong"}</p>
      </div>
    );
  }

  // If not paid yet (webhook might be slow), show a waiting state
  if (!session.paid && justPaid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-5xl mb-4 animate-pulse">✨</div>
        <p className="text-white/80 text-lg font-semibold">Confirming your payment...</p>
        <p className="text-white/40 text-sm mt-2">This usually takes just a moment</p>
      </div>
    );
  }

  if (!session.paid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-white/60">This session hasn&apos;t been unlocked yet.</p>
      </div>
    );
  }

  const { personAResults, combinedResults, personAName, personBName } = session;

  // COMBINED RESULTS (both partners completed)
  if (combinedResults && session.partnerCompleted) {
    return (
      <div className="flex flex-col items-center px-4 py-8 max-w-lg mx-auto">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-3xl font-bold gold-text text-center mb-2">{combinedResults.headline}</h1>

        {/* Overall score */}
        <div className="glass-card p-8 w-full mt-6 text-center">
          <p className="text-white/50 text-sm uppercase tracking-wider mb-2">Overall Compatibility</p>
          <p className="text-6xl font-bold gold-text">{combinedResults.overallScore}%</p>
          <p className="text-white/50 text-sm mt-2">
            {personAName} & {personBName}
          </p>
        </div>

        <p className="text-white/60 text-center mt-6 mb-8">{combinedResults.summary}</p>

        {/* Dimension breakdown */}
        <div className="w-full space-y-4 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">7-Dimension Breakdown</h2>
          {combinedResults.dimensions.map((dim) => (
            <div key={dim.key} className="glass-card p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 font-medium">
                  {dim.emoji} {dim.label}
                </span>
                <span className="text-white font-bold">{dim.compatibility}%</span>
              </div>
              <div className="compat-bar-bg">
                <div className="compat-bar-fill" style={{ width: `${dim.compatibility}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>
                  {personAName}: {dim.scoreA}%
                </span>
                <span>
                  {personBName}: {dim.scoreB}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Strengths */}
        <div className="glass-card p-6 w-full mb-4">
          <h3 className="text-lg font-bold text-white mb-3">💪 Your Strengths</h3>
          <ul className="space-y-2">
            {combinedResults.strengths.map((s, i) => (
              <li key={i} className="text-white/70 text-sm">
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Growth areas */}
        <div className="glass-card p-6 w-full mb-8">
          <h3 className="text-lg font-bold text-white mb-3">🌱 Areas to Grow</h3>
          <ul className="space-y-2">
            {combinedResults.growthAreas.map((g, i) => (
              <li key={i} className="text-white/70 text-sm">
                {g}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/20 text-xs text-center">
          This quiz is for entertainment purposes. Every relationship is unique.
        </p>
      </div>
    );
  }

  // INDIVIDUAL RESULTS (waiting for partner)
  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-lg mx-auto">
      <div className="text-5xl mb-4">💝</div>
      <h1 className="text-3xl font-bold gold-text text-center mb-2">
        Your Results, {personAName}
      </h1>
      <p className="text-white/50 text-center mb-8">
        While you wait for {personBName}, here are your individual insights
      </p>

      {/* Love Language */}
      <div className="glass-card p-6 w-full mb-4 fade-in">
        <h3 className="text-lg font-bold text-white mb-1">💬 Your Love Language</h3>
        <p className="text-purple-300 font-semibold mb-2">{personAResults.loveLanguage.type}</p>
        <p className="text-white/50 text-sm">{personAResults.loveLanguage.description}</p>
      </div>

      {/* Attachment Style */}
      <div className="glass-card p-6 w-full mb-8 fade-in">
        <h3 className="text-lg font-bold text-white mb-1">🔗 Your Attachment Style</h3>
        <p className="text-pink-300 font-semibold mb-2">{personAResults.attachmentStyle.type}</p>
        <p className="text-white/50 text-sm">{personAResults.attachmentStyle.description}</p>
      </div>

      {/* Partner link section */}
      <div className="glass-card p-6 w-full mb-6 text-center" style={{ borderColor: "rgba(139, 92, 246, 0.3)" }}>
        <h3 className="text-lg font-bold text-white mb-2">📩 Send This to {personBName}</h3>
        <p className="text-white/50 text-sm mb-4">
          When they complete the quiz, you&apos;ll both unlock your full 7-dimension compatibility report
        </p>
        <button onClick={copyPartnerLink} className="gradient-btn w-full py-3 rounded-xl text-white font-semibold">
          {copied ? "Link Copied! ✓" : "Copy Partner Link"}
        </button>
      </div>

      {/* Waiting indicator */}
      <div className="flex items-center gap-2 text-white/30 text-sm">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        Waiting for {personBName} to complete the quiz...
      </div>
    </div>
  );
}
