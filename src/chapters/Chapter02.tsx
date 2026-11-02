import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChapterIntro, ExperienceShell } from "@/components/experience/ExperienceShell";
import { CinematicText, Words } from "@/components/experience/CinematicText";
import { InteractiveQuestion } from "@/components/experience/InteractiveQuestion";
import { Beat, ChapterEnd, Frame, Lines } from "@/components/experience/story-kit";
import { P } from "@/lib/story/photos";
import type { PublicChapter as Chapter } from "@/lib/story/content";

const FIRST_CALL = 1 * 3600 + 36 * 60 + 17;

const clockText = (total: number) => {
  const h = Math.floor(total / 3600);
  const m = Math.floor(total / 60) % 60;
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
};

/** DAY 02 — THE HOURS. 12.03.2025. */
export function Chapter02({ chapter }: { chapter: Chapter }) {
  return (
    <ExperienceShell
      chapterId="02"
      ambience="/assets/audio/day02-room.mp3"
      ambienceLabel="Late night"
    >
      <ChapterIntro
        number="02"
        title="The Hours"
        emotion="Connection"
        storyDate={chapter.storyDate}
      />

      <Beat tall>
        <Words text="I was a text person." className="display-sm block" />
        <Words text="You were a call person." className="display-sm block" delay={0.4} />
        <CinematicText delay={0.9} className="editorial text-[var(--muted-foreground)]">
          Then you happened.
        </CinematicText>
      </Beat>

      <CallScreen />

      <Hours />

      <Beat>
        <CinematicText className="editorial">
          Our families were getting tired of us. 😂
        </CinematicText>
      </Beat>

      <TwoWorlds />

      <Beat tall>
        <Lines
          lines={[
            "We talked about our past.",
            "Our families.",
            "Our ambitions.",
            "Our fears.",
            "Our lives.",
            "Everything.",
          ]}
          gap="gap-6"
        />
      </Beat>

      <Beat tall>
        <Lines
          lines={["There were no games.", "No judgement.", "No doubts.", "No unnecessary drama."]}
          className="display-sm"
          gap="gap-4"
        />
        <CinematicText delay={0.2} className="editorial mt-10 text-[var(--muted-foreground)]">
          Just understanding.
        </CinematicText>
      </Beat>

      <Beat tall>
        <CinematicText className="editorial">That's when I realized something.</CinematicText>
        <CinematicText delay={0.3} className="display-sm">
          You weren't looking for drama to create.
        </CinematicText>
        <CinematicText delay={0.5} className="display-sm text-[var(--accent-text)]">
          You were looking for a home to build.
        </CinematicText>
        <CinematicText delay={0.7} className="editorial text-[var(--muted-foreground)]">
          And I thought maybe… we could build it together.
        </CinematicText>
      </Beat>

      <div className="border-y border-[var(--border)]">
        {chapter.steps[0] && (
          <InteractiveQuestion
            chapterId={chapter.id}
            step={chapter.steps[0]}
            memory="We both fell"
          />
        )}
      </div>

      <ChapterEnd chapterId="02" teaser={chapter.teaser} next="03" />
    </ExperienceShell>
  );
}

/** A phone rings. She answers. The call runs for exactly as long as the real one did. */
function CallScreen() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"ring" | "live" | "done">("ring");
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (phase !== "live") return;
    if (reduced) {
      setSecs(FIRST_CALL);
      setPhase("done");
      return;
    }
    const start = performance.now();
    const duration = 7000;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setSecs(Math.round(FIRST_CALL * (1 - Math.pow(1 - p, 2.4))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setPhase("done");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, reduced]);

  return (
    <section className="border-y border-[var(--border)] px-6 py-28 sm:py-40">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="relative w-full overflow-hidden rounded-[2.4rem] border border-[var(--border)] bg-black px-8 py-14 text-center text-white shadow-2xl">
          <p className="eyebrow !text-white/60">
            {phase === "ring" ? "incoming call" : phase === "live" ? "on call" : "call ended"}
          </p>
          <p className="editorial mt-6 !text-4xl sm:!text-5xl">Shivam ❤️</p>
          <div className="mt-10 flex h-24 items-center justify-center">
            {phase === "ring" ? (
              <motion.span
                aria-hidden
                animate={reduced ? {} : { scale: [1, 1.18, 1], opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="block h-16 w-16 rounded-full border border-white/50"
              />
            ) : (
              <p className="font-mono text-4xl tracking-widest tabular-nums">{clockText(secs)}</p>
            )}
          </div>
          {phase === "ring" && (
            <button
              type="button"
              onClick={() => setPhase("live")}
              className="mt-6 min-h-14 w-40 rounded-full bg-white text-sm tracking-[0.2em] text-black uppercase"
            >
              Answer
            </button>
          )}
          {phase === "live" && (
            <p className="mt-6 text-xs tracking-[0.3em] text-white/50 uppercase">
              nobody wants to hang up
            </p>
          )}
          {phase === "done" && (
            <p className="mt-6 text-xs tracking-[0.3em] text-white/60 uppercase">
              12.03.2025 · your first call
            </p>
          )}
        </div>
      </div>
      {phase === "done" && (
        <>
          <Frame slot={P.call} width="max-w-xs" />
          <CinematicText className="editorial mx-auto mt-6 max-w-xl text-center">
            One hour, thirty-six minutes, seventeen seconds. It was never going to stay a text
            thing.
          </CinematicText>
        </>
      )}
    </section>
  );
}

const CALLS = [
  { label: "Text", seconds: 0 },
  { label: "1 h 36 m", seconds: FIRST_CALL },
  { label: "3 h 14 m", seconds: 3 * 3600 + 14 * 60 },
  { label: "2 h 47 m", seconds: 2 * 3600 + 47 * 60 },
  { label: "4 h 03 m", seconds: 4 * 3600 + 3 * 60 },
  { label: "3 h 51 m", seconds: 3 * 3600 + 51 * 60 },
];

/** Text → Call → Call → Call → Call, drawn as hours. */
function Hours() {
  const max = Math.max(...CALLS.map((c) => c.seconds));
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-28 sm:py-40">
      <p className="eyebrow">Text → call → call → call → call</p>
      <div className="mt-12 space-y-6">
        {CALLS.map((c, i) => (
          <div key={c.label} className="flex items-center gap-4">
            <span className="w-20 shrink-0 font-mono text-xs text-[var(--muted-foreground)]">
              {c.label}
            </span>
            <div className="h-[2px] flex-1 bg-[var(--border)]">
              <motion.div
                className="h-full bg-[var(--accent)]"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(2, (c.seconds / max) * 100)}%` }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 1.4, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Two worlds drift together as she scrolls. */
function TwoWorlds() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const left = useTransform(
    scrollYProgress,
    [0.1, 0.7],
    reduced ? ["-8%", "-8%"] : ["-48%", "-8%"],
  );
  const right = useTransform(scrollYProgress, [0.1, 0.7], reduced ? ["8%", "8%"] : ["48%", "8%"]);
  const home = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
  return (
    <div ref={ref} className="relative h-[220dvh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <motion.div
          style={{ x: left }}
          className="absolute flex aspect-square w-[58vw] max-w-[360px] items-center justify-center rounded-full border border-[var(--border)] p-6 text-center"
        >
          <span className="eyebrow">Shivam's world</span>
        </motion.div>
        <motion.div
          style={{ x: right }}
          className="absolute flex aspect-square w-[58vw] max-w-[360px] items-center justify-center rounded-full border border-[var(--border)] p-6 text-center"
        >
          <span className="eyebrow">Vaishali's world</span>
        </motion.div>
        <motion.p style={{ opacity: home }} className="editorial relative z-10 text-center">
          home
        </motion.p>
      </div>
    </div>
  );
}
