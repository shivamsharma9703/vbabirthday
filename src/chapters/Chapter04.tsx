import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChapterIntro, ExperienceShell } from "@/components/experience/ExperienceShell";
import { CinematicText } from "@/components/experience/CinematicText";
import { InteractiveQuestion } from "@/components/experience/InteractiveQuestion";
import { Beat, ChapterEnd, Frame } from "@/components/experience/story-kit";
import { PhotoReveal } from "@/components/experience/PhotoReveal";
import { Button } from "@/components/ui/button";
import { useExperience } from "@/lib/experience/state";
import { P } from "@/lib/story/photos";
import type { PublicChapter as Chapter } from "@/lib/story/content";

/** DAY 04 — THE ADVENTURE. 15.02.2026, Türkiye. */
export function Chapter04({ chapter }: { chapter: Chapter }) {
  return (
    <ExperienceShell chapterId="04" ambience="/assets/audio/day04-room.mp3" ambienceLabel="Airport">
      <ChapterIntro number="04" title="The Adventure" emotion="Joy" storyDate={chapter.storyDate} />

      <Beat tall>
        <p className="eyebrow">Now boarding</p>
        <CinematicText className="display-sm font-mono tracking-tight uppercase">
          Delhi → Istanbul
        </CinematicText>
        <CinematicText delay={0.3} className="editorial text-[var(--muted-foreground)]">
          Your first international adventure.
        </CinematicText>
      </Beat>

      <RouteMap />

      <Frame slot={P.cappadocia} width="max-w-4xl" />
      <Beat>
        <CinematicText className="editorial">You were alive that day.</CinematicText>
        <CinematicText delay={0.2} className="editorial text-[var(--muted-foreground)]">
          Happy. Excited. Completely yourself.
        </CinematicText>
        <CinematicText delay={0.4} className="display-sm">
          I think that's one of my favourite versions of you.
        </CinematicText>
      </Beat>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 sm:grid-cols-2">
        <PhotoReveal slot={P.antalya} className="w-full" />
        <PhotoReveal slot={P.antalya2} className="w-full" />
      </section>

      <LostPhone />

      <div className="border-y border-[var(--border)]">
        {chapter.steps[0] && (
          <InteractiveQuestion
            chapterId={chapter.id}
            step={chapter.steps[0]}
            memory="Balloons over Cappadocia"
          />
        )}
      </div>

      <ChapterEnd chapterId="04" teaser={chapter.teaser} next="05" />
    </ExperienceShell>
  );
}

const STOPS = [
  {
    id: "delhi",
    name: "Delhi",
    x: 690,
    y: 150,
    label: { dx: 0, dy: -22, anchor: "middle" },
    memo: "Where it began. Boarding passes, nerves, and way too much excitement.",
  },
  {
    id: "istanbul",
    name: "Istanbul",
    x: 150,
    y: 70,
    label: { dx: 0, dy: -22, anchor: "middle" },
    memo: "You were so excited that you left one of our bags at Delhi airport. 😂 Somehow, we got it back.",
  },
  {
    id: "cappadocia",
    name: "Cappadocia",
    x: 360,
    y: 135,
    label: { dx: 22, dy: 5, anchor: "start" },
    memo: "Hot-air balloons. Morning light. You, completely alive.",
  },
  {
    id: "antalya",
    name: "Antalya",
    x: 250,
    y: 235,
    label: { dx: 0, dy: 38, anchor: "middle" },
    memo: "We rented a car and went exploring.",
  },
];

/** Tap the stops in order to travel the route. */
function RouteMap() {
  const { discover } = useExperience();
  const [reached, setReached] = useState(0);
  const reduced = useReducedMotion();
  const complete = reached === STOPS.length;

  useEffect(() => {
    if (complete) discover("Delhi → Istanbul → Cappadocia → Antalya");
  }, [complete, discover]);

  const path = (to: number) =>
    STOPS.slice(0, to)
      .map((s, i) => `${i === 0 ? "M" : "L"}${s.x} ${s.y}`)
      .join(" ");
  const current = STOPS[Math.max(0, reached - 1)];

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-24 sm:py-32">
      <p className="eyebrow">
        {complete
          ? "Route complete"
          : reached === 0
            ? "Tap Delhi to begin"
            : `Tap ${STOPS[reached]?.name ?? ""} to continue`}
      </p>
      <svg
        viewBox="0 0 800 290"
        role="group"
        aria-label="Route map: Delhi, Istanbul, Cappadocia, Antalya"
        className="mt-8 w-full"
      >
        <path
          d={path(STOPS.length)}
          fill="none"
          stroke="var(--border)"
          strokeDasharray="3 7"
          strokeWidth="2"
        />
        <motion.path
          key={reached}
          d={path(reached)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        {STOPS.map((s, i) => {
          const visited = i < reached;
          const next = i === reached;
          return (
            <g key={s.id}>
              <circle
                cx={s.x}
                cy={s.y}
                r={visited ? 10 : 9}
                fill={visited ? "var(--accent)" : "var(--background)"}
                stroke={next ? "var(--accent)" : "var(--border)"}
                strokeWidth="2"
              />
              {next && !reduced && (
                <circle cx={s.x} cy={s.y} r="9" fill="none" stroke="var(--accent)" opacity="0.6">
                  <animate attributeName="r" values="9;26;9" dur="2s" repeatCount="indefinite" />
                  <animate
                    attributeName="opacity"
                    values="0.6;0;0.6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <text
                x={s.x + s.label.dx}
                y={s.y + s.label.dy}
                textAnchor={s.label.anchor as "start" | "middle"}
                fill="var(--foreground)"
                fontSize="15"
                letterSpacing="2"
              >
                {s.name.toUpperCase()}
              </text>
              {/* Large invisible tap target */}
              <circle
                cx={s.x}
                cy={s.y}
                r="34"
                fill="transparent"
                role="button"
                tabIndex={next ? 0 : -1}
                aria-label={next ? `Travel to ${s.name}` : s.name}
                className="outline-none focus-visible:[stroke-width:2] focus-visible:[stroke:var(--accent)]"
                style={{ cursor: next ? "pointer" : "default" }}
                onClick={() => next && setReached((r) => r + 1)}
                onKeyDown={(e) => {
                  if (next && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setReached((r) => r + 1);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-6 min-h-24">
        {reached > 0 && current && (
          <motion.p
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="editorial max-w-2xl"
          >
            {current.memo}
          </motion.p>
        )}
      </div>
    </section>
  );
}

const MINUTES = ["00:01", "00:37", "01:42", "02:58", "04:00"];

/** The phone in the sea. */
function LostPhone() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  function run() {
    setPhase("running");
    setStep(0);
    MINUTES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i), i * (reduced ? 250 : 900)));
    });
    timers.current.push(
      setTimeout(() => setPhase("done"), MINUTES.length * (reduced ? 250 : 900) + 600),
    );
  }

  return (
    <section className="overflow-hidden border-y border-[var(--border)] px-6 py-28 sm:py-40">
      <motion.div
        animate={
          phase === "running" && !reduced
            ? { x: [0, -6, 5, -4, 3, 0], rotate: [0, -0.6, 0.5, 0] }
            : {}
        }
        transition={{ duration: 0.6, repeat: phase === "running" ? Infinity : 0 }}
        className="mx-auto max-w-3xl text-center"
      >
        <CinematicText className="display-sm uppercase">I lost my phone in the sea.</CinematicText>
        {phase === "idle" && (
          <Button variant="outline" className="mt-14 min-h-14 px-8" onClick={run}>
            Retrace those four hours
          </Button>
        )}
        {phase !== "idle" && (
          <>
            <p
              className="mt-14 font-mono text-6xl tracking-widest tabular-nums sm:text-8xl"
              aria-live="polite"
            >
              {MINUTES[step]}
            </p>
            <motion.div
              aria-hidden
              animate={{
                y: phase === "done" ? 0 : [0, 14, 0],
                opacity: phase === "done" ? 1 : 0.7,
              }}
              transition={{ duration: 1.6, repeat: phase === "done" ? 0 : Infinity }}
              className="mt-8 text-4xl"
            >
              {phase === "done" ? "📱" : "🌊"}
            </motion.div>
          </>
        )}
        {phase === "done" && (
          <div className="mt-14 space-y-8">
            <CinematicText className="editorial">
              Four hours. One lost phone. Two heartbroken idiots.
            </CinematicText>
            <CinematicText delay={0.4} className="display-sm">
              We found it. Somehow.
            </CinematicText>
            <CinematicText delay={0.8} className="editorial text-[var(--muted-foreground)]">
              Maybe luck. Maybe the universe. Or maybe… I just had you with me.
            </CinematicText>
          </div>
        )}
      </motion.div>
    </section>
  );
}
