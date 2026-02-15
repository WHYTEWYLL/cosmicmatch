"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questions } from "@/lib/questions";

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yourName = searchParams.get("you") || "";
  const partnerName = searchParams.get("partner") || "";

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; value: number }[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!yourName || !partnerName) {
      router.push("/");
    }
  }, [yourName, partnerName, router]);

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (value: number) => {
    setSelected(value);
  };

  const handleNext = async () => {
    if (selected === null) return;

    const newAnswers = [...answers, { questionId: question.id, value: selected }];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await fetch("/api/submit-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personAName: yourName,
            personBName: partnerName,
            answers: newAnswers,
          }),
        });
        const data = await res.json();

        if (!data.sessionId) {
          alert("Something went wrong. Please try again.");
          setSubmitting(false);
          return;
        }

        const checkoutRes = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: data.sessionId }),
        });
        const checkoutData = await checkoutRes.json();

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
        } else {
          alert("Payment setup failed. Please try again.");
          setSubmitting(false);
        }
      } catch {
        alert("Something went wrong. Please try again.");
        setSubmitting(false);
      }
    }
  };

  if (!yourName) return null;

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-lg mx-auto">
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
        {submitting
          ? "Processing..."
          : currentQ < questions.length - 1
          ? "Next →"
          : "See Your Results — $1.99"}
      </button>

      <p className="text-white/30 text-xs mt-4 text-center">
        {yourName} &amp; {partnerName}&apos;s compatibility test
      </p>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-4xl animate-pulse">🌠</div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
