import { Link } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { useInView } from "motion/react";
import { useExperience } from "@/lib/experience/state";
import { CinematicText } from "./CinematicText";
import { PhotoReveal } from "./PhotoReveal";
import type { MediaSlot } from "@/lib/story/content";

/** One quiet screen of text. */
export function Beat({
  children,
  className = "",
  tall = false,
}: {
  children: ReactNode;
  className?: string;
  tall?: boolean;
}) {
  return (
    <section
      className={`mx-auto flex w-full max-w-4xl flex-col justify-center gap-8 px-6 py-24 sm:py-36 ${
        tall ? "min-h-[80dvh]" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}

/** Lines that arrive one after another as she scrolls. */
export function Lines({
  lines,
  className = "editorial",
  gap = "gap-10",
}: {
  lines: string[];
  className?: string;
  gap?: string;
}) {
  return (
    <div className={`flex flex-col ${gap}`}>
      {lines.map((line) => (
        <CinematicText key={line} className={className}>
          {line}
        </CinematicText>
      ))}
    </div>
  );
}

/** A photo given room to breathe, centred, never cropped. */
export function Frame({
  slot,
  width = "max-w-3xl",
  priority = false,
}: {
  slot: MediaSlot;
  width?: string;
  priority?: boolean;
}) {
  return (
    <div className={`mx-auto w-full px-6 py-10 ${width}`}>
      <PhotoReveal slot={slot} priority={priority} className="w-full" />
    </div>
  );
}

/** A full black screen with a single line, used as a held breath. */
export function Interlude({
  children,
  tone = "text-white",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <section
      className={`flex min-h-[85dvh] items-center justify-center bg-black px-6 text-center ${tone}`}
    >
      <div className="max-w-3xl">{children}</div>
    </section>
  );
}

export function ChapterEnd({
  chapterId,
  teaser,
  next,
}: {
  chapterId: string;
  teaser: string;
  next?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reached = useInView(ref, { once: true, margin: "-20%" });
  const { completeChapter } = useExperience();
  useEffect(() => {
    if (reached) completeChapter(chapterId);
  }, [reached, chapterId, completeChapter]);
  return (
    <footer ref={ref} className="border-t border-[var(--border)] px-6 py-28 text-center">
      <p className="eyebrow">Next</p>
      <CinematicText className="editorial mx-auto mt-8 max-w-2xl">{teaser}</CinematicText>
      {next ? (
        <Link
          to="/day/$day"
          params={{ day: next }}
          className="magnetic mt-14 inline-block border border-[var(--border)] px-8 py-4 text-xs tracking-[0.28em] uppercase hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
        >
          Chapter {next}
        </Link>
      ) : (
        <p className="mt-14 text-xs tracking-[0.4em] uppercase">To be continued…</p>
      )}
    </footer>
  );
}
