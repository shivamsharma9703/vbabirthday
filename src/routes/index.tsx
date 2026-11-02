import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useBlur } from "@/hooks/use-blur";
import { AccessGate } from "@/components/experience/AccessGate";

import { useExperience } from "@/lib/experience/state";
import { Passport } from "@/components/experience/Passport";
import { CinematicText, Words } from "@/components/experience/CinematicText";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A story for Vaishali" },
      { name: "description", content: "A private birthday story." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "A story for Vaishali" },
      { property: "og:description", content: "A private birthday story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { state, ready, clockReady, update, access, now } = useExperience();
  const beforeStart = !state.unlockAll && now < Date.parse("2026-11-01T00:00:00+05:30");

  if (!ready || !clockReady) return <div className="min-h-dvh bg-[var(--background)]" />;

  return (
    <main className="grain min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <AnimatePresence mode="wait">
        {!state.entered ? (
          <Threshold
            key="threshold"
            onEnter={(sound) => update({ entered: true, soundOn: sound })}
          />
        ) : !access ? (
          <AccessGate key="gate" />
        ) : beforeStart ? (
          <Coming key="coming" />
        ) : (
          <ChapterIndex key="index" />
        )}
      </AnimatePresence>
    </main>
  );
}

function Threshold({ onEnter }: { onEnter: (sound: boolean) => void }) {
  const blur = useBlur();
  return (
    <motion.section
      exit={{ opacity: 0, filter: blur(20) }}
      transition={{ duration: 1 }}
      className="flex min-h-dvh flex-col justify-between px-6 py-16 sm:px-12"
    >
      <p className="eyebrow">For Vaishali · From Shivam</p>

      <div>
        <Words text="I wasn't" className="display block uppercase" />
        <Words text="looking" className="display block uppercase" delay={0.15} />
        <Words text="for you." className="display block uppercase" delay={0.3} />
        <CinematicText
          delay={0.9}
          className="editorial mt-12 max-w-xl text-[var(--muted-foreground)]"
        >
          A story that began on 09.03.2025 and keeps going.
        </CinematicText>
      </div>

      <div className="space-y-8">
        <p className="max-w-sm text-sm text-[var(--muted-foreground)]">
          This experience has sound. Headphones recommended.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => onEnter(true)}
            className="magnetic min-h-14 border border-[var(--accent)] bg-[var(--accent)] px-10 text-xs tracking-[0.28em] text-[var(--accent-foreground)] uppercase"
          >
            Begin with sound
          </button>
          <button
            type="button"
            onClick={() => onEnter(false)}
            className="magnetic min-h-14 border border-[var(--border)] px-10 text-xs tracking-[0.28em] uppercase"
          >
            Begin silently
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function Coming() {
  const { now } = useExperience();
  const seconds = Math.max(0, Math.floor((Date.parse("2026-11-01T00:00:00+05:30") - now) / 1000));
  const parts = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4 }}
      className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 text-center"
    >
      <p className="editorial">Something is coming.</p>
      <p className="display uppercase">01.11.2026</p>
      <p
        className="font-mono text-sm text-muted-foreground"
        aria-label="Time until our story opens"
      >
        {parts.map((v, i) => `${String(v).padStart(2, "0")}${["d", "h", "m", "s"][i]}`).join(" · ")}
      </p>
    </motion.section>
  );
}

function ChapterIndex() {
  const { state, update, chapters } = useExperience();
  const [draft, setDraft] = useState(state.favouriteMemory);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <Passport />
      <div className="px-6 pt-28 pb-16 sm:px-12">
        <p className="eyebrow">Seven chapters</p>
        <h1 className="display mt-8 max-w-[12ch] uppercase">Our Story</h1>
      </div>

      {!state.favouriteMemory && (
        <div className="mx-auto w-full max-w-2xl px-6 py-16">
          <p className="editorial">Before we begin, tell me your favourite memory of us.</p>
          <form
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) update({ favouriteMemory: draft.trim() });
            }}
          >
            <label className="sr-only" htmlFor="memory">
              Your favourite memory
            </label>
            <input
              id="memory"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type it here…"
              className="min-h-12 flex-1 border-b border-[var(--border)] bg-transparent pb-3 text-lg outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="magnetic min-h-12 border border-[var(--border)] px-8 text-xs tracking-[0.24em] uppercase"
            >
              Save
            </button>
          </form>
        </div>
      )}

      <ul className="border-t border-[var(--border)]">
        {chapters.map((c) => {
          const open = !c.locked;
          return (
            <li key={c.id} className="border-b border-[var(--border)]">
              <Link
                to="/day/$day"
                params={{ day: c.id }}
                disabled={!open}
                className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 px-6 py-10 sm:px-12 ${
                  open
                    ? "hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]"
                    : "cursor-not-allowed opacity-35"
                }`}
              >
                <span className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  <span className="font-mono text-xs tracking-[0.3em]">{c.number}</span>
                  <span className="display-sm text-[clamp(1.8rem,7vw,4rem)] uppercase">
                    {c.locked ? `Chapter ${c.number}` : c.title}
                  </span>
                </span>
                <span className="eyebrow whitespace-nowrap">
                  {!c.locked ? (state.chapterProgress[c.id] ? "Complete" : c.emotion) : c.dateLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="px-6 py-24 text-center sm:px-12">
        <p className="editorial mx-auto max-w-2xl">
          This is not the end of the story. It's the beginning of the habit.
        </p>
        <p className="eyebrow mt-10">To be continued…</p>
      </footer>
    </motion.section>
  );
}
