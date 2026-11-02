import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "@tanstack/react-router";
import { ChapterIntro, ExperienceShell } from "@/components/experience/ExperienceShell";
import { CinematicText, Words } from "@/components/experience/CinematicText";
import { ChapterEnd, Frame } from "@/components/experience/story-kit";
import { P } from "@/lib/story/photos";
import { InteractiveQuestion } from "@/components/experience/InteractiveQuestion";
import { useExperience } from "@/lib/experience/state";
import { useBlur } from "@/hooks/use-blur";
import type { PublicChapter as Chapter } from "@/lib/story/content";

/** DAY 01 — THE UNEXPECTED. 09.03.2025. */
export function Chapter01({ chapter }: { chapter: Chapter }) {
  const { unlockEgg, state } = useExperience();
  const roomRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: roomRef, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  return (
    <ExperienceShell
      chapterId="01"
      ambience="/assets/audio/day01-room.mp3"
      ambienceLabel="Living room"
    >
      <ChapterIntro
        number="01"
        title="The Unexpected"
        emotion="Curiosity"
        storyDate={chapter.storyDate}
      />

      {/* Opening statement */}
      <section className="mx-auto max-w-4xl px-6 py-32 sm:py-48">
        <Words text="I wasn't looking for you." className="display-sm block" />
        <CinematicText
          delay={0.5}
          className="editorial mt-10 max-w-2xl text-[var(--muted-foreground)]"
        >
          That is the whole point of this. Nobody warned me that the ninth of March was going to
          matter.
        </CinematicText>
      </section>

      {/* Reconstruction of the room */}
      <section
        ref={roomRef}
        className="relative overflow-hidden border-y border-[var(--border)] py-28 sm:py-40"
      >
        <motion.div
          style={{ x: drift }}
          className="pointer-events-none absolute inset-x-0 top-10 opacity-[0.05]"
        >
          <p className="display whitespace-nowrap uppercase">
            09.03.2025 · 09.03.2025 · 09.03.2025
          </p>
        </motion.div>

        <div className="relative mx-auto grid max-w-5xl gap-14 px-6 sm:grid-cols-2">
          <div className="space-y-10">
            <p className="eyebrow">The reconstruction</p>
            <Detail k="The house" v="Mine. Yours for the afternoon." />
            <Detail k="Me" v="Maroon T-shirt. Trying to look calm." />
            <Detail k="You" v="Teal-grey suit." />
            <Detail k="The obstacle" v="Your brother and sister, sitting exactly between us." />
            <Detail k="The distraction" v="India vs New Zealand. The final." />
            <Detail k="Total conversation" v="About five minutes. Work. Ambition." />
          </div>
          <CinematicText className="flex flex-col justify-center border border-[var(--border)] p-10 text-center sm:p-14">
            <span className="display">5</span>
            <span className="eyebrow mt-6">minutes, and I was already gone</span>
          </CinematicText>
        </div>
      </section>

      {/* The guess comes first, so the answer is not already on the page */}
      {chapter.steps[1] && (
        <div className="border-y border-[var(--border)]">
          <InteractiveQuestion chapterId={chapter.id} step={chapter.steps[1]} memory="Your smile" />
        </div>
      )}

      {/* What I noticed */}
      <NoticedList onAll={() => unlockEgg("day01-noticed")} />

      {/* The line */}
      <section className="px-6 py-36 text-center sm:py-56">
        <Words
          text="You looked like all my prayers had come true."
          className="editorial mx-auto block max-w-4xl"
        />
        <CinematicText
          delay={0.8}
          className="mt-12 text-sm tracking-[0.24em] text-[var(--muted-foreground)] uppercase"
        >
          Five minutes. That was all it took.
        </CinematicText>
      </section>

      {/* Cricket joke */}
      <CricketScore />

      {/* Questions */}
      <div className="border-y border-[var(--border)]">
        {chapter.steps[0] && (
          <InteractiveQuestion
            chapterId={chapter.id}
            step={chapter.steps[0]}
            memory="Our first words"
          />
        )}
      </div>

      {/* Instagram easter egg */}
      <InstagramEgg
        found={state.easterEggs.includes("day01-instagram")}
        onFind={() => unlockEgg("day01-instagram")}
      />

      <ChapterEnd chapterId="01" teaser={chapter.teaser} next="02" />
    </ExperienceShell>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <CinematicText className="border-b border-[var(--border)] pb-5">
      <span className="eyebrow block">{k}</span>
      <span className="mt-3 block text-xl sm:text-2xl">{v}</span>
    </CinematicText>
  );
}

const NOTICED = [
  {
    label: "Your smile",
    body: "Immediately. Before anything else. It settled something in the room.",
  },
  { label: "Your voice", body: "You talked about your work. I stopped hearing the television." },
  { label: "Your calm", body: "I was nervous. You were not. I noticed that too." },
  { label: "The future", body: "I could see it. Sitting right there, between the small talk." },
];

function NoticedList({ onAll }: { onAll: () => void }) {
  const [open, setOpen] = useState<string[]>([]);

  useEffect(() => {
    if (open.length === NOTICED.length) onAll();
  }, [open.length, onAll]);

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-28 sm:py-40">
      <p className="eyebrow">What I noticed</p>
      <div className="mt-12">
        {NOTICED.map((n) => {
          const isOpen = open.includes(n.label);
          return (
            <button
              key={n.label}
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((o) =>
                  o.includes(n.label) ? o.filter((x) => x !== n.label) : [...o, n.label],
                )
              }
              className="group block w-full border-b border-[var(--border)] py-8 text-left"
            >
              <span className="flex items-baseline justify-between gap-6">
                <span className="display-sm text-[clamp(1.8rem,6vw,3.4rem)] transition-colors group-hover:text-[var(--accent-text)]">
                  {n.label}
                </span>
                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  {isOpen ? "—" : "+"}
                </span>
              </span>
              <motion.span
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="block overflow-hidden"
              >
                <span className="editorial mt-6 block max-w-2xl text-[var(--muted-foreground)]">
                  {n.body}
                </span>
              </motion.span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CricketScore() {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-24">
      <div className="border border-[var(--border)] p-8 sm:p-12">
        <p className="eyebrow">Match report · 09.03.2025</p>
        <div className="mt-8 space-y-4 font-mono text-sm">
          <Row a="India vs New Zealand" b="Final" />
          <Row a="Attention paid to cricket" b="14%" />
          <Row a="Attention paid to you in teal-grey" b="86%" />
          <Row a="Overs I can still recall" b="0" />
        </div>
        <p className="editorial mt-10">India won. I remember almost nothing about it.</p>
      </div>
    </section>
  );
}

function Row({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-[var(--border)] pb-3">
      <span className="text-[var(--muted-foreground)]">{a}</span>
      <span>{b}</span>
    </div>
  );
}

function InstagramEgg({ found, onFind }: { found: boolean; onFind: () => void }) {
  const blur = useBlur();
  return (
    <section className="px-6 py-28 text-center">
      <p className="text-sm text-[var(--muted-foreground)]">
        After you left, I searched for you on Instagram for{" "}
        <button
          type="button"
          onClick={onFind}
          className="underline decoration-dotted underline-offset-4 hover:text-[var(--accent-text)]"
        >
          quite a while
        </button>
        .
      </p>
      <motion.p
        initial={false}
        animate={{ opacity: found ? 1 : 0, filter: found ? "blur(0px)" : blur(12) }}
        transition={{ duration: 1 }}
        className="editorial mx-auto mt-10 max-w-xl"
      >
        I tried to find you. I failed. 😂
      </motion.p>
      {found && (
        <>
          <CinematicText delay={0.6} className="editorial mx-auto mt-16 max-w-xl">
            The metro, however, had a sign.
          </CinematicText>
          <Frame slot={P.sign} width="max-w-sm" />
        </>
      )}
    </section>
  );
}
