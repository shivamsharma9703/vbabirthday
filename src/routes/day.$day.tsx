import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Chapter01 } from "@/chapters/Chapter01";
import { Chapter02 } from "@/chapters/Chapter02";
import { Chapter03 } from "@/chapters/Chapter03";
import { Chapter04 } from "@/chapters/Chapter04";
import { Chapter05 } from "@/chapters/Chapter05";
import { Chapter06 } from "@/chapters/Chapter06";
import { Chapter07 } from "@/chapters/Chapter07";
import { ExperienceShell, ChapterIntro } from "@/components/experience/ExperienceShell";
import { CinematicText } from "@/components/experience/CinematicText";
import { PhotoReveal } from "@/components/experience/PhotoReveal";
import { InteractiveQuestion } from "@/components/experience/InteractiveQuestion";
import { NoButton } from "@/components/experience/NoButton";
import type { LockedChapter, PublicChapter as Chapter } from "@/lib/story/content";
import { AccessGate } from "@/components/experience/AccessGate";
import { VoicePlayer } from "@/components/experience/VoicePlayer";
import { useExperience } from "@/lib/experience/state";
import { useBlur } from "@/hooks/use-blur";

export const Route = createFileRoute("/day/$day")({
  head: ({ params }) => ({
    meta: [
      { title: `A story for Vaishali · ${params.day}` },
      { name: "description", content: "A private birthday story." },
      { property: "og:title", content: "A story for Vaishali" },
      { property: "og:description", content: "A private birthday story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  loader: ({ params }) => {
    if (!/^(0[1-7])$/.test(params.day)) throw notFound();
    return null;
  },
  component: ChapterRoute,
});

function ChapterRoute() {
  const { day } = Route.useParams();
  const { ready, clockReady, access, chapters, retry } = useExperience();
  const chapter = chapters.find((c) => c.id === day);

  if (!ready || !clockReady) return <div className="min-h-dvh bg-[var(--background)]" />;

  if (!access) return <AccessGate />;
  if (!chapter) return <Waiting onRetry={retry} />;
  if (chapter.locked) return <Locked chapter={chapter} />;

  switch (chapter.id) {
    case "01":
      return <Chapter01 chapter={chapter} />;
    case "02":
      return <Chapter02 chapter={chapter} />;
    case "03":
      return <Chapter03 chapter={chapter} />;
    case "04":
      return <Chapter04 chapter={chapter} />;
    case "05":
      return <Chapter05 chapter={chapter} />;
    case "06":
      return <Chapter06 chapter={chapter} />;
    default:
      return <Chapter07 chapter={chapter} />;
  }
}

function Waiting({ onRetry }: { onRetry: () => Promise<void> }) {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center bg-[var(--background)] px-6 text-center text-[var(--foreground)]">
      <p className="editorial">One moment…</p>
      <button
        type="button"
        onClick={() => void onRetry().catch(() => undefined)}
        className="mt-10 min-h-11 text-xs tracking-[0.28em] uppercase underline underline-offset-8"
      >
        Try again
      </button>
    </section>
  );
}

function Locked({ chapter }: { chapter: LockedChapter }) {
  const blur = useBlur();
  return (
    <ExperienceShell chapterId={chapter.id} ambience={`/assets/audio/day${chapter.id}-room.mp3`}>
      <section className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow">Chapter {chapter.number}</p>
        <motion.h1
          initial={{ opacity: 0, filter: blur(20) }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="display-sm mt-8 uppercase"
        >
          Not yet
        </motion.h1>
        <p className="editorial mt-10 max-w-lg text-[var(--muted-foreground)]">
          {chapter.dateLabel.startsWith("Opens")
            ? chapter.dateLabel
            : `Opens ${Number(chapter.unlockDate.slice(-2))} November, 12 AM`}
          .
        </p>
        <Link
          to="/"
          className="mt-14 text-xs tracking-[0.28em] uppercase underline underline-offset-8"
        >
          Back to the index
        </Link>
      </section>
    </ExperienceShell>
  );
}
