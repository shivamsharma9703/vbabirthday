import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChapterIntro, ExperienceShell } from "@/components/experience/ExperienceShell";
import { CinematicText, Words } from "@/components/experience/CinematicText";
import { InteractiveQuestion } from "@/components/experience/InteractiveQuestion";
import { PhotoReveal } from "@/components/experience/PhotoReveal";
import { Beat, ChapterEnd, Frame, Lines } from "@/components/experience/story-kit";
import { P } from "@/lib/story/photos";
import type { PublicChapter as Chapter } from "@/lib/story/content";

/** DAY 06 — THE HOME. Engagement, wedding, and the rain. */
export function Chapter06({ chapter }: { chapter: Chapter }) {
  return (
    <ExperienceShell chapterId="06" ambience="/assets/audio/day06-room.mp3" ambienceLabel="Evening">
      <ChapterIntro
        number="06"
        title="The Home"
        emotion="Gratitude"
        storyDate={chapter.storyDate}
      />

      <Beat tall>
        <p className="eyebrow">28.06.2025</p>
        <CinematicText className="display-sm">
          Everyone thought this was an arranged marriage.
        </CinematicText>
        <CinematicText delay={0.3} className="editorial text-[var(--muted-foreground)]">
          Nobody who saw us that day believed it.
        </CinematicText>
      </Beat>

      <section className="mx-auto grid max-w-5xl items-start gap-8 px-6 pb-16 sm:grid-cols-2">
        <PhotoReveal slot={P.cake} priority className="w-full" />
        <PhotoReveal slot={P.postEngagement} className="w-full" />
      </section>

      <Beat tall>
        <CinematicText className="editorial">Hundreds of people were watching.</CinematicText>
        <CinematicText delay={0.3} className="display-sm">
          But somehow… it felt like there were only two.
        </CinematicText>
      </Beat>

      <Beat tall>
        <p className="eyebrow">10.02.2026</p>
        <Words text="And then, the wedding." className="display-sm block" />
        <Lines
          lines={["Haldi.", "Sangeet.", "Dancing.", "Families.", "Decorations.", "Chaos."]}
          className="editorial text-[var(--muted-foreground)]"
          gap="gap-3"
        />
        <CinematicText delay={0.2} className="editorial">
          And then, everything slowed down.
        </CinematicText>
      </Beat>

      <Frame slot={P.wedding} width="max-w-5xl" />

      <div className="border-y border-[var(--border)]">
        {chapter.steps[0] && (
          <InteractiveQuestion
            chapterId={chapter.id}
            step={chapter.steps[0]}
            memory="The seven pheras"
          />
        )}
      </div>

      <Pheras />

      <Beat tall>
        <CinematicText className="editorial">You take care of me.</CinematicText>
        <Lines
          lines={[
            "You worry about my health.",
            "You prepare my clothes.",
            "You handle my anger.",
            "You make me laugh.",
            "You make ordinary days feel like ours.",
          ]}
          className="editorial text-[var(--muted-foreground)]"
          gap="gap-6"
        />
      </Beat>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 sm:grid-cols-2">
        <PhotoReveal slot={P.ccd} className="w-full" />
        <PhotoReveal slot={P.lucknow} className="w-full" />
        <PhotoReveal slot={P.ayodhya} className="w-full" />
        <PhotoReveal slot={P.birthday} className="w-full" />
      </section>

      <Beat tall>
        <CinematicText className="display-sm">I thought I was looking for a wife.</CinematicText>
        <CinematicText delay={1.2} className="display text-[var(--accent-text)]">
          I found a home.
        </CinematicText>
      </Beat>

      <ChapterEnd chapterId="06" teaser={chapter.teaser} next="07" />
    </ExperienceShell>
  );
}

interface Drop {
  left: number;
  duration: number;
  delay: number;
}

/** Seven pheras. Rain begins with the first and stops with the last. */
function Pheras() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState<"idle" | "rain" | "silence" | "after">("idle");
  const [drops, setDrops] = useState<Drop[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setDrops(
      Array.from({ length: 44 }, (_, i) => ({
        left: ((i * 97) % 100) + ((i * 13) % 7) / 7,
        duration: 0.8 + ((i * 37) % 10) / 12,
        delay: ((i * 53) % 10) / 10,
      })),
    );
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  function tap(i: number) {
    if (i !== count) return;
    const next = count + 1;
    setCount(next);
    if (next === 1) setStage("rain");
    if (next === 7) {
      timers.current.push(setTimeout(() => setStage("silence"), 1400));
      timers.current.push(setTimeout(() => setStage("after"), reduced ? 2500 : 7000));
    }
  }

  return (
    <section className="relative flex min-h-[110dvh] flex-col items-center justify-center overflow-hidden bg-black px-4 py-28 text-center text-white">
      <AnimatePresence>
        {stage === "rain" && (
          <motion.div
            key="rain"
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 + count * 0.07 }}
            exit={{ opacity: 0, transition: { duration: 1.6 } }}
          >
            {drops.map((d, i) => (
              <span
                key={i}
                className="rain-drop"
                style={{
                  left: `${d.left}%`,
                  animationDuration: `${d.duration}s`,
                  animationDelay: `${d.delay}s`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-2xl">
        {stage !== "after" && stage !== "silence" && (
          <>
            <p className="eyebrow !text-white/60">
              {count === 0 ? "The seven pheras" : `Phera ${count} of 7`}
            </p>
            <p className="editorial mt-6 text-white/80">
              {count === 0 ? "Tap the first flame." : count < 7 ? "Slowly. One at a time." : "…"}
            </p>
            <div className="mt-14 flex flex-wrap justify-center gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const lit = i < count;
                const next = i === count;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!next}
                    aria-label={`Phera ${i + 1}`}
                    onClick={() => tap(i)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg transition-all duration-700 ${
                      lit
                        ? "border-amber-200/80 bg-amber-200/20 shadow-[0_0_28px_rgba(251,191,36,0.55)]"
                        : next
                          ? "border-white/70 animate-pulse"
                          : "border-white/20 opacity-40"
                    }`}
                  >
                    <span aria-hidden>{lit ? "🪔" : ""}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {stage === "silence" && <p aria-hidden className="h-24" />}

        {stage === "after" && (
          <div className="space-y-10">
            <CinematicText className="display-sm">Exactly when we finished.</CinematicText>
            <CinematicText delay={0.8} className="editorial text-white/70">
              The rain stopped.
            </CinematicText>
            <CinematicText delay={2} className="editorial text-white/70">
              Maybe it was just rain. Maybe it was the universe.
            </CinematicText>
            <CinematicText delay={3.2} className="editorial">
              But I want to believe… your father was there.
            </CinematicText>
            <CinematicText delay={4.4} className="editorial text-white/70">
              Blessing us. Making sure his daughter was exactly where she needed to be.
            </CinematicText>
            <div className="pt-8">
              <PhotoReveal slot={P.weddingRain} className="mx-auto w-full max-w-3xl" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
