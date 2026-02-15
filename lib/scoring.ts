import { questions, dimensions } from "./questions";

interface Answer {
  questionId: number;
  value: number;
}

export interface IndividualResults {
  loveLanguage: { type: string; description: string };
  attachmentStyle: { type: string; description: string };
  dimensionScores: Record<string, number>;
}

export interface CombinedResults {
  overallScore: number;
  dimensions: { key: string; label: string; emoji: string; scoreA: number; scoreB: number; compatibility: number }[];
  headline: string;
  summary: string;
  strengths: string[];
  growthAreas: string[];
}

const loveLanguages = [
  {
    type: "Words of Affirmation",
    description:
      "You thrive on verbal expressions of love. Compliments, encouragement, and hearing 'I love you' fill your emotional tank. You value open, heartfelt communication above all.",
  },
  {
    type: "Quality Time",
    description:
      "Undivided attention is your love currency. You feel most connected when your partner is fully present — no phones, no distractions. Shared experiences create your deepest bonds.",
  },
  {
    type: "Acts of Service",
    description:
      "Actions speak louder than words for you. When your partner helps out, takes initiative, or anticipates your needs, you feel genuinely cared for and supported.",
  },
  {
    type: "Physical Touch",
    description:
      "Physical closeness is how you connect. From holding hands to a warm embrace, touch is your emotional anchor. You feel most secure when there's physical presence.",
  },
];

const attachmentStyles = [
  {
    type: "Secure",
    description:
      "You approach relationships with confidence and trust. You're comfortable with intimacy and independence alike, and you communicate your needs openly without fear.",
  },
  {
    type: "Anxious",
    description:
      "You love deeply and crave closeness. Sometimes you worry about how your partner feels, and you seek reassurance. Your emotional awareness is a strength when channeled well.",
  },
  {
    type: "Avoidant",
    description:
      "You value independence and self-sufficiency. You might sometimes pull back when things get too intense, needing space to feel safe. You love on your own terms.",
  },
  {
    type: "Fearful-Avoidant",
    description:
      "You have a complex relationship with intimacy — wanting closeness but sometimes fearing it. This depth gives you unique emotional insight when you learn to trust the process.",
  },
];

export function computeIndividualResults(answers: Answer[]): IndividualResults {
  const dimensionScores: Record<string, number> = {};

  for (const dim of dimensions) {
    dimensionScores[dim.key] = 0;
  }

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question) {
      const current = dimensionScores[question.dimension] || 0;
      dimensionScores[question.dimension] = current + answer.value;
    }
  }

  // Normalize scores to 0-100
  for (const key in dimensionScores) {
    const maxPossible = questions.filter((q) => q.dimension === key).length * 4;
    if (maxPossible > 0) {
      dimensionScores[key] = Math.round((dimensionScores[key] / maxPossible) * 100);
    }
  }

  // Determine love language from answers
  const totalScore = answers.reduce((sum, a) => sum + a.value, 0);
  const llIndex = totalScore % loveLanguages.length;
  const loveLanguage = loveLanguages[llIndex];

  // Determine attachment style
  const emotionalScore = dimensionScores["emotional"] || 50;
  const conflictScore = dimensionScores["conflict"] || 50;
  let asIndex = 0;
  if (emotionalScore >= 75 && conflictScore >= 75) asIndex = 0; // Secure
  else if (emotionalScore >= 50 && conflictScore < 50) asIndex = 1; // Anxious
  else if (emotionalScore < 50 && conflictScore >= 50) asIndex = 2; // Avoidant
  else asIndex = 3; // Fearful-Avoidant

  return {
    loveLanguage,
    attachmentStyle: attachmentStyles[asIndex],
    dimensionScores,
  };
}

export function computeCombinedResults(
  answersA: Answer[],
  answersB: Answer[],
  resultsA: IndividualResults
): CombinedResults {
  const scoresA = resultsA.dimensionScores;
  const resultsB = computeIndividualResults(answersB);
  const scoresB = resultsB.dimensionScores;

  const dimensionResults = dimensions.map((dim) => {
    const scoreA = scoresA[dim.key] || 50;
    const scoreB = scoresB[dim.key] || 50;
    const diff = Math.abs(scoreA - scoreB);
    // Compatibility: higher when scores are closer, with bonus for both being high
    const closeness = 100 - diff;
    const avgStrength = (scoreA + scoreB) / 2;
    const compatibility = Math.round(closeness * 0.6 + avgStrength * 0.4);
    return {
      key: dim.key,
      label: dim.label,
      emoji: dim.emoji,
      scoreA,
      scoreB,
      compatibility: Math.min(99, Math.max(45, compatibility)),
    };
  });

  const overallScore = Math.round(
    dimensionResults.reduce((sum, d) => sum + d.compatibility, 0) / dimensionResults.length
  );

  const sorted = [...dimensionResults].sort((a, b) => b.compatibility - a.compatibility);
  const strengths = sorted.slice(0, 3).map((d) => `${d.emoji} ${d.label}: ${d.compatibility}% aligned`);
  const growthAreas = sorted
    .slice(-2)
    .reverse()
    .map((d) => `${d.emoji} ${d.label}: Room to grow together`);

  let headline: string;
  let summary: string;

  if (overallScore >= 85) {
    headline = "You're Cosmically Aligned ✨";
    summary =
      "Your connection runs deep across nearly every dimension. You share a rare level of understanding and compatibility that most couples only dream of.";
  } else if (overallScore >= 70) {
    headline = "A Powerful Connection 💫";
    summary =
      "You have a strong foundation with genuine chemistry. Your differences aren't weaknesses — they're opportunities to complement each other beautifully.";
  } else if (overallScore >= 55) {
    headline = "Opposites With Potential 🌙";
    summary =
      "You balance each other in interesting ways. While you see the world differently in some areas, that tension can create the most dynamic and growth-oriented relationships.";
  } else {
    headline = "A Complex Dynamic 🔮";
    summary =
      "Your relationship has unique challenges, but that doesn't mean it can't work. The most transformative relationships are the ones that push us to grow.";
  }

  return {
    overallScore,
    dimensions: dimensionResults,
    headline,
    summary,
    strengths,
    growthAreas,
  };
}
