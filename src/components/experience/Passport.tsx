import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useExperience } from "@/lib/experience/state";
import { EASTER_EGGS } from "@/lib/story/content";

export function Passport() {
  const { state, chapters } = useExperience();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open our story passport"
        className="magnetic fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex h-11 items-center gap-3 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--background)_70%,transparent)] px-4 backdrop-blur-xl sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:right-[max(1.5rem,env(safe-area-inset-right))]"
      >
        <span className="eyebrow text-[10px]">Our story</span>
        <span className="font-mono text-[11px] tracking-widest">
          {Object.values(state.chapterProgress).filter(Boolean).length}/7
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[70] overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-[color-mix(in_oklab,var(--background)_88%,black)] backdrop-blur-2xl"
          >
            <div className="mx-auto min-h-full w-full max-w-3xl px-6 py-16">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Passport</p>
                  <h2 className="display-sm mt-4">Our Story</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="min-h-11 text-xs tracking-[0.24em] uppercase"
                >
                  Close
                </button>
              </div>

              <div className="rule mt-12" />

              <div className="mt-10">
                <div>
                  <p className="eyebrow">Chapters</p>
                  <ul className="mt-5 space-y-3">
                    {chapters.map((c) => (
                      <li key={c.id} className="flex items-baseline justify-between gap-4">
                        <Link
                          to="/day/$day"
                          params={{ day: c.id }}
                          disabled={c.locked}
                          onClick={() => setOpen(false)}
                          className="text-lg hover:text-[var(--accent-text)]"
                        >
                          <span className="font-mono text-xs tracking-widest">{c.number}</span>{" "}
                          <span className="editorial text-[1.05rem] sm:text-xl">
                            {c.locked ? "Not yet" : c.title}
                          </span>
                        </Link>
                        <span className="font-mono text-xs text-[var(--muted-foreground)]">
                          {state.chapterProgress[c.id] ? "✓" : "—"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-14">
                <p className="eyebrow">
                  Easter eggs · {EASTER_EGGS.filter((id) => state.easterEggs.includes(id)).length} /{" "}
                  {EASTER_EGGS.length}
                </p>
                <div
                  className="mt-5 flex gap-6 text-2xl"
                  aria-label={`${state.easterEggs.length} easter eggs found`}
                >
                  {EASTER_EGGS.map((id) => (
                    <span
                      key={id}
                      className={
                        state.easterEggs.includes(id)
                          ? "text-accent-text"
                          : "text-muted-foreground opacity-30"
                      }
                    >
                      {state.easterEggs.includes(id) ? "✦" : "◇"}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-14">
                <p className="eyebrow">Memories discovered</p>
                {state.memories.length === 0 ? (
                  <p className="mt-5 text-sm text-[var(--muted-foreground)]">
                    Nothing yet. Keep going.
                  </p>
                ) : (
                  <ul className="mt-5 space-y-2">
                    {state.memories.map((m) => (
                      <li key={m} className="editorial text-[1.05rem] sm:text-xl">
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {state.favouriteMemory && (
                <div className="mt-14">
                  <p className="eyebrow">In your words</p>
                  <p className="editorial mt-5">“{state.favouriteMemory}”</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
