export type ChapterId = "01" | "02" | "03" | "04" | "05" | "06" | "07";

export interface MediaSlot {
  /** file that should live in /public/assets/photos */
  file: string;
  label: string;
  caption?: string;
  kind?: "photo" | "video" | "document" | "audio";
  ratio?: "portrait" | "landscape" | "square";
}

export interface ClueStep {
  id: string;
  prompt: string;
  hint?: string;
  /** accepted lowercase answers; omit for "discover by interaction" steps */
  answers?: string[];
  options?: string[];
  reveal?: string;
}

export interface Chapter {
  id: ChapterId;
  number: string;
  title: string;
  subtitle: string;
  emotion: string;
  dateLabel: string;
  /** Asia/Kolkata calendar date, YYYY-MM-DD */
  unlockDate: string;
  unlockTime: string;
  storyDate: string;
  opening: string;
  steps: ClueStep[];
  media: MediaSlot[];
  teaser: string;
}

export const EXPERIENCE_TITLE = "I Wasn't Looking For You.";
export const EXPERIENCE_SUB = "A story that began on 09.03.2025 and keeps going.";

/** A step as the browser sees it: the accepted answers never leave the server. */
export type PublicStep = Omit<ClueStep, "answers"> & { checkable: boolean };

/** A chapter that has unlocked, as the browser sees it. */
export type PublicChapter = Omit<Chapter, "steps"> & { locked: false; steps: PublicStep[] };

/** A chapter that has not unlocked yet. Nothing about its story is sent. */
export interface LockedChapter {
  locked: true;
  id: ChapterId;
  number: string;
  dateLabel: string;
  unlockDate: string;
  unlockTime: string;
}

export type StoryChapter = PublicChapter | LockedChapter;

export const CHAPTERS: Chapter[] = [
  {
    id: "01",
    number: "01",
    title: "The Unexpected",
    subtitle: "Curiosity",
    emotion: "Curiosity",
    dateLabel: "November 1",
    unlockDate: "2026-11-01",
    unlockTime: "00:00",
    storyDate: "09.03.2025",
    opening: "I wasn't looking for you. That is the whole point.",
    steps: [
      {
        id: "shirt",
        prompt: "What was the first thing I said to you?",
        reveal: "Five minutes. That was all it took.",
      },
      {
        id: "match",
        prompt: "Which of these did I notice first?",
        options: ["Your eyes", "Your smile", "Your voice", "Your clothes"],
        reveal: "Your smile.",
      },
    ],
    media: [
      {
        file: "VAISHALI_FIRST_MEETING.jpg",
        label: "09.03.2025 — the living room",
        ratio: "landscape",
      },
      { file: "FIRST_SELFIE.jpg", label: "Somewhere near the beginning", ratio: "portrait" },
    ],
    teaser: "Two days later, a message. And then the hours started disappearing.",
  },
  {
    id: "02",
    number: "02",
    title: "The Hours",
    subtitle: "Connection",
    emotion: "Connection",
    dateLabel: "November 2",
    unlockDate: "2026-11-02",
    unlockTime: "00:00",
    storyDate: "11.03.2025 — 12.03.2025",
    opening: "1 hour, 36 minutes, 17 seconds. The first call. Nobody wanted to hang up.",
    steps: [
      {
        id: "fell",
        prompt: "Who do you think fell first?",
        options: ["Me", "You"],
        reveal: "Wrong. We both did.",
      },
    ],
    media: [{ file: "CALL_SCREENSHOT.jpg", label: "12.03.2025 — 1:36:17", ratio: "portrait" }],
    teaser: "Then I came to Gwalior. And you took a napkin.",
  },
  {
    id: "03",
    number: "03",
    title: "The Yes",
    subtitle: "Belonging",
    emotion: "Belonging",
    dateLabel: "November 3",
    unlockDate: "2026-11-03",
    unlockTime: "00:00",
    storyDate: "23.03.2025",
    opening: "I went to wash my hands. I came back to the rest of my life.",
    steps: [
      {
        id: "napkin",
        prompt: "Finish the napkin: “It's a big YES. I can't wait to ___ you.”",
        answers: ["marry"],
      },
    ],
    media: [
      { file: "NAPKIN_REAL.jpg", label: "The napkin — Farzi Cafe", ratio: "square" },
      { file: "FIRST_SELFIE.jpg", label: "First selfies", ratio: "portrait" },
    ],
    teaser: "Next: one airport, a forgotten bag, and a phone lost in the sea.",
  },
  {
    id: "04",
    number: "04",
    title: "The Adventure",
    subtitle: "Joy",
    emotion: "Joy",
    dateLabel: "November 4",
    unlockDate: "2026-11-04",
    unlockTime: "00:00",
    storyDate: "15.02.2026 — Türkiye",
    opening:
      "You left a bag at Delhi airport. I left my phone in the sea. We still call it perfect.",
    steps: [
      {
        id: "cities",
        prompt: "Which city had the balloons?",
        answers: ["cappadocia", "kapadokya"],
      },
    ],
    media: [
      { file: "TURKEY_ISTANBUL.jpg", label: "Istanbul", ratio: "landscape" },
      { file: "TURKEY_CAPPADOCIA.jpg", label: "Cappadocia", ratio: "landscape" },
      { file: "TURKEY_ANTALYA.jpg", label: "Antalya", ratio: "landscape" },
      { file: "PHONE_LOST.jpg", label: "Four hours of searching", ratio: "landscape" },
    ],
    teaser: "Now the part I don't say out loud very often.",
  },
  {
    id: "05",
    number: "05",
    title: "The Way You Love Me",
    subtitle: "Desire",
    emotion: "Desire",
    dateLabel: "Opens 5 November, 6 AM",
    unlockDate: "2026-11-05",
    unlockTime: "06:00",
    storyDate: "18.05.2025",
    opening: "A drive after dinner. Awkward for four seconds. Then not awkward at all.",
    steps: [{ id: "drive", prompt: "Which month was the drive?", answers: ["may", "5", "05"] }],
    media: [{ file: "MAY_18.jpg", label: "18.05.2025", ratio: "portrait" }],
    teaser: "And then we built a home.",
  },
  {
    id: "06",
    number: "06",
    title: "The Home",
    subtitle: "Gratitude",
    emotion: "Gratitude",
    dateLabel: "Opens 5 November, 6 PM",
    unlockDate: "2026-11-05",
    unlockTime: "18:00",
    storyDate: "28.06.2025 — 10.02.2026",
    opening: "It rained during the pheras. It stopped exactly when they finished.",
    steps: [{ id: "pheras", prompt: "How many pheras?", answers: ["7", "seven", "saat"] }],
    media: [
      { file: "ENGAGEMENT_RING.jpg", label: "28.06.2025", ratio: "portrait" },
      { file: "WEDDING_RAIN.jpg", label: "10.02.2026 — the rain", ratio: "landscape" },
    ],
    teaser: "Tomorrow is yours.",
  },
  {
    id: "07",
    number: "07",
    title: "Forever",
    subtitle: "Love",
    emotion: "Love",
    dateLabel: "November 6",
    unlockDate: "2026-11-06",
    unlockTime: "00:00",
    storyDate: "06.11.2026",
    opening: "Happy birthday, my person.",
    steps: [],
    media: [{ file: "TODAY.jpg", label: "06.11.2026", ratio: "portrait" }],
    teaser: "To be continued…",
  },
];

export const getChapter = (id: string) => CHAPTERS.find((c) => c.id === id);

/** Hidden things she can find across the story. The passport counts these. */
export const EASTER_EGGS = [
  "day01-noticed",
  "day01-instagram",
  "day05-private",
  "day07-never",
] as const;
