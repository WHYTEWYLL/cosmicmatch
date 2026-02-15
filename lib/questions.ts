export interface QuizQuestion {
  id: number;
  text: string;
  dimension: string;
  options: { label: string; value: number }[];
}

export const questions: QuizQuestion[] = [
  {
    id: 1,
    text: "When your partner is upset, what's your first instinct?",
    dimension: "emotional",
    options: [
      { label: "Hold them and let them vent", value: 4 },
      { label: "Try to fix the problem immediately", value: 2 },
      { label: "Give them space to process", value: 3 },
      { label: "Distract them to cheer them up", value: 1 },
    ],
  },
  {
    id: 2,
    text: "How do you prefer to resolve a disagreement?",
    dimension: "conflict",
    options: [
      { label: "Talk it out right away, even if it's heated", value: 4 },
      { label: "Take a breather first, then discuss calmly", value: 3 },
      { label: "Write down my thoughts before talking", value: 2 },
      { label: "Avoid it and hope it blows over", value: 1 },
    ],
  },
  {
    id: 3,
    text: "Your ideal Saturday together looks like:",
    dimension: "lifestyle",
    options: [
      { label: "Adventure — hiking, exploring, trying something new", value: 4 },
      { label: "Cozy at home — cooking, movies, no plans", value: 2 },
      { label: "Social — dinner with friends, events, going out", value: 3 },
      { label: "Productive — errands, projects, getting things done", value: 1 },
    ],
  },
  {
    id: 4,
    text: "What makes you feel most loved?",
    dimension: "communication",
    options: [
      { label: "Hearing 'I love you' and genuine compliments", value: 4 },
      { label: "Surprise gifts or thoughtful gestures", value: 2 },
      { label: "Quality time with undivided attention", value: 3 },
      { label: "Acts of service — they do things without being asked", value: 1 },
    ],
  },
  {
    id: 5,
    text: "How important is physical affection in your relationship?",
    dimension: "intimacy",
    options: [
      { label: "Essential — I need daily touch and closeness", value: 4 },
      { label: "Important — but I also value personal space", value: 3 },
      { label: "Nice but not a priority for me", value: 2 },
      { label: "I show love in other ways", value: 1 },
    ],
  },
  {
    id: 6,
    text: "When it comes to finances in a relationship:",
    dimension: "values",
    options: [
      { label: "Everything should be shared and transparent", value: 4 },
      { label: "Some shared, some separate — balance is key", value: 3 },
      { label: "Keep finances mostly separate", value: 2 },
      { label: "Whoever earns more should handle more", value: 1 },
    ],
  },
  {
    id: 7,
    text: "Where do you see yourself in 5 years?",
    dimension: "growth",
    options: [
      { label: "Settled down — house, maybe kids, stability", value: 3 },
      { label: "Career-focused — climbing the ladder, building something", value: 2 },
      { label: "Free-spirited — traveling, new experiences, no fixed plan", value: 4 },
      { label: "Same as now, just better — improve what I have", value: 1 },
    ],
  },
  {
    id: 8,
    text: "How do you handle stress?",
    dimension: "emotional",
    options: [
      { label: "I talk about it — sharing helps me process", value: 4 },
      { label: "I go quiet and need alone time", value: 2 },
      { label: "I exercise or do something physical", value: 3 },
      { label: "I push through and deal with it later", value: 1 },
    ],
  },
  {
    id: 9,
    text: "How much alone time do you need in a relationship?",
    dimension: "lifestyle",
    options: [
      { label: "Very little — I want to do everything together", value: 4 },
      { label: "Some — a few hours a week to recharge", value: 3 },
      { label: "A good amount — I need my own hobbies and space", value: 2 },
      { label: "A lot — independence is crucial to me", value: 1 },
    ],
  },
  {
    id: 10,
    text: "What's the biggest relationship deal-breaker for you?",
    dimension: "values",
    options: [
      { label: "Dishonesty — trust is everything", value: 4 },
      { label: "Lack of ambition — I need a partner who grows", value: 3 },
      { label: "Poor communication — if we can't talk, it won't work", value: 2 },
      { label: "Different life goals — we need to want the same things", value: 1 },
    ],
  },
];

export const dimensions = [
  { key: "communication", label: "Communication", emoji: "💬" },
  { key: "emotional", label: "Emotional", emoji: "💖" },
  { key: "intimacy", label: "Intimacy", emoji: "🔥" },
  { key: "values", label: "Values", emoji: "🌿" },
  { key: "conflict", label: "Conflict", emoji: "⚡" },
  { key: "growth", label: "Growth", emoji: "🚀" },
  { key: "lifestyle", label: "Lifestyle", emoji: "🏡" },
];
