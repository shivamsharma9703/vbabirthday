export interface SavedProgress {
  entered: boolean;
  soundOn: boolean;
  favouriteMemory: string;
  chapterProgress: Record<string, boolean>;
  quizAnswers: Record<string, string>;
  easterEggs: string[];
  memories: string[];
}
export const initialProgress: SavedProgress = {
  entered: false,
  soundOn: false,
  favouriteMemory: "",
  chapterProgress: {},
  quizAnswers: {},
  easterEggs: [],
  memories: [],
};
export function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
export function answerMatches(value: string, answers?: string[]) {
  const v = normalizeAnswer(value);
  return Boolean(v) && (!answers || answers.some((a) => normalizeAnswer(a) === v));
}
/** Parses a preview "YYYY-MM-DDTHH:mm" value as India time; Safari needs the seconds spelled out. */
export function parseIstDateTime(value: string) {
  const v = /T\d\d:\d\d$/.test(value) ? `${value}:00` : value;
  return Date.parse(`${v}+05:30`);
}

export const EXPERIENCE_START_MS = Date.parse("2026-11-01T00:00:00+05:30");
export function normalizeAccessCode(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
export function canUnlock(date: string, time: string, now: number, preview = false) {
  return preview || now >= Math.max(EXPERIENCE_START_MS, Date.parse(`${date}T${time}:00+05:30`));
}
/** Where the No button hops to. Stays on the right and inside the row, clear of Yes on a 360px screen. */
const DODGES = [
  { x: 0, y: 0 },
  { x: 24, y: -58 },
  { x: 0, y: 58 },
  { x: 28, y: -50 },
  { x: 0, y: 54 },
];
export function dodgePosition(attempts: number) {
  return DODGES[Math.min(attempts, DODGES.length - 1)] ?? { x: 0, y: 0 };
}
