import { useState } from "react";
import { motion } from "motion/react";
import { ChapterIntro, ExperienceShell } from "@/components/experience/ExperienceShell";
import { CinematicText, Words } from "@/components/experience/CinematicText";
import { InteractiveQuestion } from "@/components/experience/InteractiveQuestion";
import { Beat, ChapterEnd, Frame, Interlude, Lines } from "@/components/experience/story-kit";
import { useExperience } from "@/lib/experience/state";
import { P } from "@/lib/story/photos";
import type { PublicChapter as Chapter } from "@/lib/story/content";

/** DAY 05 — THE WAY YOU LOVE ME. Slow, dark, and entirely hers. */
export function Chapter05({ chapter }: { chapter: Chapter }) {
  return (
    <ExperienceShell chapterId="05" ambience="/assets/audio/day05-room.mp3" ambienceLabel="Night">
      <ChapterIntro
        number="05"
        title="The Way You Love Me"
        emotion="Desire"
        storyDate={chapter.storyDate}
      />

      <Beat tall>
        <Words text="There are things I don't say enough." className="display-sm block" />
      </Beat>

      <Beat>
        <Lines
          lines={[
            "I love your voice.",
            "I love how sweet you are.",
            "I love the way you say “babyyy.”",
            "I love how you calm me down.",
            "I love how you never panic.",
            "I love how your sweetness can make me forget why I was angry.",
          ]}
          gap="gap-14"
        />
      </Beat>

      <Beat>
        <Lines
          lines={[
            "I love how you worry about my health.",
            "I love coming home to clothes you've already kept ready for me.",
            "I love that when I'm in a bad mood… you somehow irritate me until I laugh.",
          ]}
          gap="gap-14"
        />
      </Beat>

      <Beat tall>
        <CinematicText className="display-sm text-[var(--accent-text)]">
          You make me feel at home in my own skin.
        </CinematicText>
      </Beat>

      <div className="border-y border-[var(--border)]">
        {chapter.steps[0] && (
          <InteractiveQuestion chapterId={chapter.id} step={chapter.steps[0]} memory="The drive" />
        )}
      </div>

      <Interlude>
        <CinematicText className="display font-mono tracking-tight">18.05.2025</CinematicText>
      </Interlude>

      <Beat>
        <Lines
          lines={["Shopping.", "Dinner.", "Hotel.", "Her sister.", "A drive."]}
          className="display-sm"
          gap="gap-6"
        />
      </Beat>
      <Frame slot={P.shopping} width="max-w-3xl" />

      <Interlude>
        <CinematicText className="editorial">“Can I take her for a drive?”</CinematicText>
      </Interlude>

      <Interlude>
        <Lines
          lines={["It was awkward.", "We leaned in.", "And then…"]}
          gap="gap-12"
          className="editorial"
        />
      </Interlude>

      <Interlude>
        <CinematicText className="display-sm uppercase">Our first kiss.</CinematicText>
      </Interlude>
      <div className="bg-black pb-24">
        <Frame slot={P.kiss} width="max-w-4xl" />
      </div>

      <Unexplained />

      <ChapterEnd chapterId="05" teaser={chapter.teaser} next="06" />
    </ExperienceShell>
  );
}

/** Some things are better left unexplained. */
function Unexplained() {
  const { state, unlockEgg } = useExperience();
  const [open, setOpen] = useState(false);
  const found = state.easterEggs.includes("day05-private") || open;
  return (
    <section className="px-6 py-32 text-center">
      <CinematicText className="editorial mx-auto max-w-xl text-[var(--muted-foreground)]">
        Some things are better left unexplained.
      </CinematicText>
      <button
        type="button"
        aria-label="A small smile"
        onClick={() => {
          setOpen(true);
          unlockEgg("day05-private");
        }}
        className="mt-10 min-h-11 min-w-11 text-lg opacity-60 transition-opacity hover:opacity-100"
      >
        🙂
      </button>
      {found && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="editorial mt-6"
        >
          babu · vegu
        </motion.p>
      )}
    </section>
  );
}
