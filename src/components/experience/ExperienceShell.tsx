import { useEffect, type ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Passport } from "./Passport";
import { AudioController } from "./AudioController";
import { useBlur } from "@/hooks/use-blur";

export function ExperienceShell({
  chapterId,
  ambience,
  ambienceLabel,
  children,
}: {
  chapterId?: string | undefined;
  ambience?: string | undefined;
  ambienceLabel?: string | undefined;
  children: ReactNode;
}) {
  useEffect(() => {
    if (chapterId) document.body.dataset["chapter"] = chapterId;
    return () => {
      delete document.body.dataset["chapter"];
    };
  }, [chapterId]);
  return (
    <motion.main
      data-chapter={chapterId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="grain min-h-dvh bg-[var(--background)] text-[var(--foreground)]"
    >
      <Link
        to="/"
        className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-50 flex h-11 items-center text-[11px] tracking-[0.28em] text-white uppercase mix-blend-difference opacity-80 hover:opacity-100 sm:top-[max(1.5rem,env(safe-area-inset-top))] sm:left-[max(1.5rem,env(safe-area-inset-left))]"
      >
        Index
      </Link>
      <Passport />
      {children}
      <AudioController src={ambience} label={ambienceLabel} />
    </motion.main>
  );
}

export function ChapterIntro({
  number,
  title,
  emotion,
  storyDate,
}: {
  number: string;
  title: string;
  emotion: string;
  storyDate: string;
}) {
  const blur = useBlur();
  return (
    <header className="flex min-h-dvh flex-col justify-between px-6 pt-28 pb-14 sm:px-10">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2 }}
        className="eyebrow"
      >
        Chapter {number} · {emotion}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, filter: blur(24), y: 30 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="display max-w-[14ch] uppercase"
      >
        {title}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 1.1 }}
        className="flex items-end gap-8"
      >
        <span className="font-mono text-xs tracking-[0.3em] text-[var(--muted-foreground)]">
          {storyDate}
        </span>
        <span className="font-mono text-xs tracking-[0.3em] text-[var(--muted-foreground)]">
          Scroll ↓
        </span>
      </motion.div>
    </header>
  );
}
