import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ChapterIntro, ExperienceShell } from "@/components/experience/ExperienceShell";
import { CinematicText, Words } from "@/components/experience/CinematicText";
import { NoButton } from "@/components/experience/NoButton";
import { VoicePlayer } from "@/components/experience/VoicePlayer";
import { PhotoReveal } from "@/components/experience/PhotoReveal";
import { Beat, Frame } from "@/components/experience/story-kit";
import { useExperience } from "@/lib/experience/state";
import { P } from "@/lib/story/photos";
import type { PublicChapter as Chapter } from "@/lib/story/content";

const TIMELINE = [
  ["09.03.2025", "We met."],
  ["11.03.2025", "We started talking."],
  ["12.03.2025", "1:36:17."],
  ["23.03.2025", "You said yes."],
  ["28.06.2025", "We got engaged."],
  ["10.02.2026", "You became my wife."],
  ["15.02.2026", "We started our first international adventure."],
  ["06.11.2026", "Your first birthday as my wife."],
] as const;

const FUTURE = [
  ["2030", "Still stealing each other's clothes."],
  ["2040", "Still arguing about who loves whom more."],
  ["2050", "Still calling each other babyyy."],
  ["2060", "Still giving each other ridiculous gifts."],
  ["2070", "Still you. Still me. Still us."],
] as const;

const MET = Date.parse("2025-03-09T00:00:00+05:30");
const WED = Date.parse("2026-02-10T00:00:00+05:30");

/** DAY 07 — FOREVER. Everything pays off. */
export function Chapter07({ chapter }: { chapter: Chapter }) {
  const { state, answer } = useExperience();
  const said = state.quizAnswers["forever"] === "yes";
  return (
    <ExperienceShell chapterId="07" ambience="/assets/audio/day07-room.mp3" ambienceLabel="Quiet">
      <section className="flex min-h-dvh flex-col items-center justify-center bg-black px-6 text-center text-white">
        <CinematicText className="display font-mono tracking-tight">06.11.2026</CinematicText>
        <CinematicText delay={1.4} className="editorial mt-14">
          Happy Birthday, Wife.
        </CinematicText>
      </section>

      <ChapterIntro number="07" title="Forever" emotion="Love" storyDate={chapter.storyDate} />

      <section className="mx-auto w-full max-w-3xl px-6 py-24">
        <ol className="space-y-12 border-l border-[var(--border)] pl-8">
          {TIMELINE.map(([date, text], i) => (
            <motion.li
              key={date}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 1, delay: 0.05 * (i % 2) }}
              className="relative"
            >
              <span className="absolute top-2 -left-[2.4rem] h-2 w-2 rounded-full bg-[var(--accent)]" />
              <p className="eyebrow">{date}</p>
              <p className="editorial mt-2">{text}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      <Beat tall>
        <CinematicText className="display-sm">And this is only the beginning.</CinematicText>
      </Beat>

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <ul className="space-y-14">
          {FUTURE.map(([year, text]) => (
            <li key={year}>
              <CinematicText className="eyebrow">{year}</CinematicText>
              <CinematicText delay={0.15} className="editorial mt-2">
                {text}
              </CinematicText>
            </li>
          ))}
        </ul>
        <CinematicText className="editorial mt-24 text-[var(--accent-text)]">
          In our 70s, I'll still be getting you silly and amazing birthday gifts.
        </CinematicText>
      </section>

      <Counters />

      <VoicePlayer src="/assets/audio/shivam-message.mp3" />

      <Beat tall className="items-center text-center">
        <p className="eyebrow">One last question</p>
        <Words text="Will you be my person forever?" className="display-sm block" />
        <NoButton onYes={() => answer("forever", "yes")} />
        {said && (
          <>
            <CinematicText className="editorial">I already knew your answer.</CinematicText>
            <CinematicText delay={0.6} className="display-sm text-[var(--accent-text)]">
              Because I chose you too.
            </CinematicText>
          </>
        )}
      </Beat>

      {said && <Finale />}
    </ExperienceShell>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function Counters() {
  const { now } = useExperience();
  const rows: [string, number][] = [
    ["Since the day we met", MET],
    ["Since you became my wife", WED],
  ];
  return (
    <section className="mx-auto grid w-full max-w-4xl gap-14 px-6 py-24 sm:grid-cols-2">
      {rows.map(([label, from]) => {
        const diff = Math.max(0, Math.floor((now - from) / 1000));
        const d = Math.floor(diff / 86400);
        const h = Math.floor(diff / 3600) % 24;
        const m = Math.floor(diff / 60) % 60;
        const s = diff % 60;
        return (
          <div key={label}>
            <p className="eyebrow">{label}</p>
            <p className="display-sm mt-4 tabular-nums">{d}</p>
            <p className="eyebrow mt-1">days</p>
            <p className="mt-4 font-mono text-lg tabular-nums">
              {pad(h)}:{pad(m)}:{pad(s)}
            </p>
          </div>
        );
      })}
    </section>
  );
}

const REEL = [
  P.carSelfie,
  P.gwalior,
  P.napkin,
  P.cappadocia,
  P.antalya2,
  P.cake,
  P.wedding,
  P.ayodhya,
  P.lucknow,
  P.birthday,
];

/** She said yes. The last message, the end, and the not-quite-end. */
function Finale() {
  const { unlockEgg, completeChapter } = useExperience();
  const endRef = useRef<HTMLDivElement>(null);
  const inView = useInView(endRef, { once: true, margin: "-30%" });
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const a = setTimeout(() => {
      setStage(1);
      unlockEgg("day07-never");
      completeChapter("07");
    }, 3000);
    const b = setTimeout(() => setStage(2), 6200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [inView, unlockEgg, completeChapter]);

  return (
    <>
      <section className="bg-black px-6 py-28 text-white">
        <div className="mx-auto max-w-2xl space-y-14">
          <CinematicText className="display-sm">
            I found you at the most important time in life when I wasn't even looking.
          </CinematicText>
          <CinematicText className="editorial text-white/80">
            And now that I have you, I want to cherish you, make you feel special each year, each
            month and each day as much as I can.
          </CinematicText>
          <CinematicText className="editorial text-white/80">
            This is just the beginning.
          </CinematicText>
          <CinematicText className="editorial text-white/80">
            Wait till we're in our 70s. I'll still be getting you silly and amazing gifts for your
            birthday.
          </CinematicText>
          <CinematicText className="display-sm">I love you, Vaishali.</CinematicText>
        </div>
        <Frame slot={P.today} width="max-w-xl" />
        <div className="mt-16 flex gap-4 overflow-x-auto px-2 pb-4 [scrollbar-width:thin]">
          {REEL.map((slot) => (
            <PhotoReveal
              key={slot.file}
              slot={slot}
              caption={false}
              className="h-56 flex-none sm:h-72"
            />
          ))}
        </div>
      </section>

      <section
        ref={endRef}
        className="flex min-h-[90dvh] flex-col items-center justify-center bg-black px-6 text-center text-white"
      >
        <CinematicText className="display">The end.</CinematicText>
        <div className="mt-14 h-28">
          {stage >= 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6 }}
              className="editorial text-white/70"
            >
              No. Not even close.
            </motion.p>
          )}
          {stage >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.6 }}
              className="mt-8 text-xs tracking-[0.45em] uppercase"
            >
              To be continued…
            </motion.p>
          )}
        </div>
      </section>
    </>
  );
}
