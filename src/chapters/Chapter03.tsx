import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ChapterIntro, ExperienceShell } from "@/components/experience/ExperienceShell";
import { CinematicText, Words } from "@/components/experience/CinematicText";
import { InteractiveQuestion } from "@/components/experience/InteractiveQuestion";
import { Beat, ChapterEnd, Frame, Lines } from "@/components/experience/story-kit";
import { PhotoReveal } from "@/components/experience/PhotoReveal";
import { P } from "@/lib/story/photos";
import type { PublicChapter as Chapter } from "@/lib/story/content";

/** DAY 03 — THE YES. 23.03.2025, Gwalior. */
export function Chapter03({ chapter }: { chapter: Chapter }) {
  return (
    <ExperienceShell chapterId="03" ambience="/assets/audio/day03-room.mp3" ambienceLabel="Café">
      <ChapterIntro number="03" title="The Yes" emotion="Belonging" storyDate={chapter.storyDate} />

      <Beat tall>
        <Words text="I came to Gwalior." className="display-sm block" />
        <Lines
          lines={["I met your family.", "I met Nanaji.", "I met you."]}
          className="editorial text-[var(--muted-foreground)]"
          gap="gap-6"
        />
      </Beat>

      <section className="mx-auto grid max-w-5xl items-start gap-8 px-6 pb-20 sm:grid-cols-2">
        <PhotoReveal slot={P.gwalior} priority className="w-full" />
        <div className="space-y-8">
          <PhotoReveal slot={P.carSelfie} className="w-full" />
          <PhotoReveal slot={P.card} className="mx-auto w-3/4" />
        </div>
      </section>

      <Beat tall>
        <p className="eyebrow">Farzi Cafe</p>
        <CafeTable />
        <CinematicText className="editorial">Then I went to the washroom.</CinematicText>
        <CinematicText delay={0.3} className="editorial text-[var(--muted-foreground)]">
          And apparently… you decided to change my life while I was gone.
        </CinematicText>
      </Beat>

      <Napkin />

      <Beat tall>
        <CinematicText className="editorial">I still have it.</CinematicText>
        <CinematicText delay={0.3} className="display-sm">
          It's been in my wallet ever since.
        </CinematicText>
      </Beat>

      <Beat tall>
        <CinematicText className="editorial text-[var(--muted-foreground)]">
          You were the first person who made the future feel obvious.
        </CinematicText>
        <Lines lines={["Not scary.", "Not complicated."]} className="display-sm" gap="gap-4" />
        <CinematicText delay={0.3} className="display-sm text-[var(--accent-text)]">
          Just… right.
        </CinematicText>
      </Beat>

      <div className="border-y border-[var(--border)]">
        {chapter.steps[0] && (
          <InteractiveQuestion chapterId={chapter.id} step={chapter.steps[0]} memory="The napkin" />
        )}
      </div>

      <ChapterEnd chapterId="03" teaser={chapter.teaser} next="04" />
    </ExperienceShell>
  );
}

/** Two chairs. One occupied, one empty. */
function CafeTable() {
  return (
    <svg
      viewBox="0 0 320 140"
      role="img"
      aria-label="A café table with two chairs, one of them empty"
      className="mx-auto w-full max-w-sm text-[var(--foreground)]"
    >
      <ellipse cx="160" cy="88" rx="70" ry="16" fill="none" stroke="currentColor" opacity="0.5" />
      <line x1="160" y1="104" x2="160" y2="128" stroke="currentColor" opacity="0.5" />
      <rect x="32" y="52" width="46" height="56" rx="6" fill="currentColor" opacity="0.85" />
      <circle cx="55" cy="38" r="12" fill="currentColor" opacity="0.85" />
      <rect
        x="242"
        y="52"
        width="46"
        height="56"
        rx="6"
        fill="none"
        stroke="currentColor"
        strokeDasharray="4 5"
        opacity="0.5"
      />
    </svg>
  );
}

const NAPKIN_LINES = ["It's a big YES ♡", "I can't wait to", "marry you", "— Vaishali"];

/** A blank napkin. Slowly, the handwriting arrives. Then the real one. */
function Napkin() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  const reduced = useReducedMotion();
  const full = NAPKIN_LINES.join("\n");
  const [count, setCount] = useState(0);
  const done = count >= full.length;

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setCount(full.length);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= full.length) clearInterval(timer);
      }, 110);
    }, 1400);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [inView, reduced, full.length]);

  const shown = full.slice(0, count);
  return (
    <section ref={ref} className="px-6 py-24 sm:py-36">
      <motion.div
        initial={{ opacity: 0, rotate: -3, y: 30 }}
        whileInView={{ opacity: 1, rotate: -1.5, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto min-h-[22rem] w-full max-w-sm bg-[#f6f1e7] p-10 text-[#243a8f] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
        style={{
          backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      >
        <p
          className="font-hand text-4xl leading-[1.5] whitespace-pre-line sm:text-5xl"
          aria-label={NAPKIN_LINES.join(" ")}
        >
          {shown}
          {!done && (
            <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-current">&nbsp;</span>
          )}
        </p>
      </motion.div>
      {done && <Frame slot={P.napkin} width="max-w-sm" />}
    </section>
  );
}
