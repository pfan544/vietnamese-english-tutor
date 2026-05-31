"use client";

import { useMemo, useState } from "react";

type Card = {
  vietnamese: string;
  english: string;
  ipa: string;
  targetSound: string;
  tip: string;
  choices: string[];
};

// Vietnamese L1 → English recognition deck. Front shows Vietnamese; the
// learner picks the matching English form from 4 choices. Distractors are
// chosen to surface the *specific* Vietnamese-L1 confusion each card drills
// (dropped final consonants, collapsed clusters, voicing swaps). Past-tense
// verbs use a short Vietnamese sentence frame so the `đã` marker reads
// naturally; bare-noun cards stay bare. All distractors are real English
// words — no invented spellings.
const DECK: Card[] = [
  {
    vietnamese: "những con mèo",
    english: "cats",
    ipa: "/kæts/",
    targetSound: "final /ts/ cluster",
    tip: "Don't drop the final -s — it marks the plural.",
    choices: ["cats", "cat", "cads", "cuts"],
  },
  {
    vietnamese: "Tôi đã chuyển nhà",
    english: "moved",
    ipa: "/muːvd/",
    targetSound: "final /vd/ cluster",
    tip: "Both /v/ and /d/ must land — don't collapse it to 'move'.",
    choices: ["moved", "move", "moves", "mood"],
  },
  {
    vietnamese: "lần thứ năm",
    english: "fifth",
    ipa: "/fɪfθ/",
    targetSound: "final /fθ/ cluster",
    tip: "Tongue tip to the teeth for /θ/ — not /f/, not /s/.",
    choices: ["fifth", "fifths", "fits", "fit"],
  },
  {
    vietnamese: "Tôi đã hỏi cô ấy",
    english: "asked",
    ipa: "/æskt/",
    targetSound: "final /skt/ cluster",
    tip: "Say all three: /s/-/k/-/t/. Don't smush them together.",
    choices: ["asked", "ask", "asks", "act"],
  },
  {
    vietnamese: "các bài kiểm tra",
    english: "tests",
    ipa: "/tɛsts/",
    targetSound: "final /sts/ cluster",
    tip: "Slow down — three separate sounds: /s/-/t/-/s/.",
    choices: ["tests", "test", "texts", "tents"],
  },
  {
    vietnamese: "Tôi đã ước như vậy",
    english: "wished",
    ipa: "/wɪʃt/",
    targetSound: "final /ʃt/ cluster",
    tip: "End on a crisp /t/ — don't let it fade.",
    choices: ["wished", "wish", "wishes", "washed"],
  },
  {
    vietnamese: "quần áo",
    english: "clothes",
    ipa: "/kloʊðz/",
    targetSound: "final /ðz/ cluster",
    tip: "Keep voice on through /ð/ and /z/ — it's not 'close'.",
    choices: ["clothes", "close", "cloth", "cloths"],
  },
  {
    vietnamese: "Tôi đã giúp cô ấy",
    english: "helped",
    ipa: "/hɛlpt/",
    targetSound: "final /lpt/ cluster",
    tip: "Finish on /t/ — 'helpt', not 'help'.",
    choices: ["helped", "help", "helps", "hopped"],
  },
];

// Deterministic LCG-based shuffle so server and client render the same order
// (avoids hydration mismatch) and re-renders of the same card don't reorder
// the buttons. Seed comes from the card index.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = (seed * 2654435761) >>> 0 || 1;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function Home() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const finished = index >= DECK.length;
  const card = finished ? null : DECK[index];

  const shuffledChoices = useMemo(
    () => (card ? seededShuffle(card.choices, index + 1) : []),
    [card, index],
  );

  function handleSelect(choice: string) {
    if (selected !== null || !card) return;
    setSelected(choice);
    if (choice === card.english) {
      setCorrectCount((c) => c + 1);
    }
  }

  function handleNext() {
    setSelected(null);
    setIndex((i) => i + 1);
  }

  function handleReset() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
  }

  if (finished) {
    return (
      <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Done
          </p>
          <p className="text-4xl font-semibold tracking-tight text-slate-800">
            {correctCount} of {DECK.length} correct
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="min-h-12 rounded-2xl bg-sky-500 px-6 text-base font-semibold text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
          >
            Review again
          </button>
        </div>
      </main>
    );
  }

  const isAnswered = selected !== null;
  const isCorrect = isAnswered && selected === card!.english;
  const progress = ((index + 1) / DECK.length) * 100;

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm font-medium text-slate-500">
            Card {index + 1} of {DECK.length}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Vietnamese
          </span>
          <span
            lang="vi"
            className="text-3xl font-semibold tracking-tight text-slate-800"
          >
            {card!.vietnamese}
          </span>
        </div>

        <div
          role="group"
          aria-label="English answer choices"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {shuffledChoices.map((choice) => {
            const isCorrectChoice = choice === card!.english;
            const isPicked = choice === selected;

            let stateClass =
              "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50";
            if (isAnswered) {
              if (isCorrectChoice) {
                stateClass =
                  "border-emerald-400 bg-emerald-50 text-emerald-800";
              } else if (isPicked) {
                stateClass = "border-rose-400 bg-rose-50 text-rose-800";
              } else {
                stateClass = "border-slate-200 bg-white text-slate-400";
              }
            }

            return (
              <button
                key={choice}
                type="button"
                onClick={() => handleSelect(choice)}
                disabled={isAnswered}
                lang="en"
                className={`min-h-14 rounded-2xl border-2 px-4 text-lg font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-default ${stateClass}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {isAnswered && card && (
          <div
            aria-live="polite"
            className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm"
          >
            <p
              className={`text-sm font-semibold ${
                isCorrect ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isCorrect ? "Correct" : "Not quite"}
            </p>
            <p
              lang="en"
              className="text-4xl font-semibold tracking-tight text-slate-800"
            >
              {card.english}
            </p>
            <p className="font-mono text-xl text-slate-600">{card.ipa}</p>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
              {card.targetSound}
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              {card.tip}
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="mt-2 min-h-12 rounded-2xl bg-slate-800 px-6 text-base font-semibold text-white transition-colors hover:bg-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
            >
              {index === DECK.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
