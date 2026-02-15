"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { questions } from "@/lib/questions";

interface SessionInfo {
  personAName: string;
  personBName: string;
  sessionId: string;
}

export default function PartnerQuizPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [error, setError] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; value: number }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/session/${token}?by=token`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.partnerCompleted) {
          router.push(`/results/${data.sessionId}`);
        } else {
          setSessionInfo({
            personAName: data.personAName,
            personBName: data.personBName,
            sessionId: data.sessionId,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load quiz. Please check your link.");
        setLoading(false);
      });
  }, [token, router]);

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (value: number) => {
    setSelected(value);
  };

  const handleNext = async () => {
    if (selected === null || !sessionInfo) return;

    const newAnswers = [...answers, { questionId: question.id, value: selected }];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await fetch("/api/partner-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            answers: newAnswers,
          }),
        });
        const data = await res.json();

        if (data.sessionId) {
          router.push(`/results/${data.sessionId}`);
        } else {
          alert("Something went wrong. Please try again.");
          setSubmitting(false);
        }
      } catch {
        alert("Something went wrong. Please try again.");
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-4xl mb-4">🌠</div>
        <p className="text-white/60">Loading your quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-white/60 text-center">{error}</p>
        <button onClick={() => router.push("/")} className="gradient-btn px-8 py-3 rounded-2xl text-white font-semibold mt-6">
          Take Your Own Test
        </button>
      </div>
    );
  }

  if (!sessionInfo) return null;

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-lg mx-auto">
      {/* Partner intro (only before first question) */}
      {currentQ === 0 && answers.length === 0 && (
        <div className="glass-card p-6 w-full mb-8 text-center fade-in">
          <div className="text-3xl mb-3">💌</div>
          <h2 className="text-xl font-bold text-white mb-2">
            {sessionInfo.personAName} invited you!
          </h2>
          <p className="text-white/50 text-sm">
            {sessionInfo.personAName} already took the compatibility quiz. Now it&apos;s your turn,{" "}
            {sessionInfo.personBName}. Answer 10 questions and you&apos;ll both get your results!
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="w-full mb-2">
        <div className="flex justify-between text-sm text-white/50 mb-2">
          <span>
            Question {currentQ + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10">
          <div className="progress-fill h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="fade-in w-full mt-8" key={currentQ}>
        <h2 className="text-2xl font-bold text-white mb-8 text-center">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option.value)}
              className={`option-card w-full text-left ${selected === option.value ? "selected" : ""}`}
            >
              <span className="text-white/90">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={selected === null || submitting}
        className="gradient-btn w-full py-4 rounded-2xl text-white font-semibold text-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Getting your results..." : currentQ < questions.length - 1 ? "Next →" : "See Your Results →"}
      </button>

      <p className="text-white/30 text-xs mt-4 text-center">
        {sessionInfo.personAName} &amp; {sessionInfo.personBName}&apos;s compatibility test
      </p>
    </div>
  );
}
