import { createServerFn } from "@tanstack/react-start";
import { useSession as openSession, setResponseHeader } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual, randomUUID } from "node:crypto";
import { z } from "zod";
import { initialProgress, normalizeAccessCode, answerMatches, canUnlock } from "./rules";
import type { StoryChapter } from "../story/content";

const DEV_SESSION_SECRET = "dev-only-session-secret-change-me-0123456789";

/** SESSION_SECRET is optional: without it a secret is derived from the two passwords you set. */
function sessionPassword() {
  const explicit = process.env["SESSION_SECRET"];
  if (explicit && explicit.length >= 32) return explicit;
  if (!import.meta.env.PROD) return DEV_SESSION_SECRET;
  const seed = `${process.env["ACCESS_CODE"] ?? ""}|${process.env["PREVIEW_PASSPHRASE"] ?? ""}`;
  if (seed === "|") return undefined;
  return createHash("sha256").update(`our-story:${seed}`).digest("hex");
}

async function session() {
  const password = sessionPassword();
  if (!password) throw new Error("Private session unavailable");
  setResponseHeader("Cache-Control", "no-store");
  return openSession<{
    access?: boolean;
    previewToken?: string;
    attempts?: number;
    retryAfter?: number;
  }>({
    password,
    name: "our-story",
    maxAge: 60 * 60 * 24 * 365,
    cookie: { httpOnly: true, secure: import.meta.env.PROD, sameSite: "lax", path: "/" },
  });
}

function matches(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

/** Throws unless she has the access code (or an active preview session). Returns whether this is a preview. */
async function authorize(previewToken?: string) {
  const s = await session();
  const preview = Boolean(
    previewToken && s.data.previewToken && matches(previewToken, s.data.previewToken),
  );
  if (!s.data.access && !preview) throw new Error("Say the word.");
  return preview;
}

/** Real clock. A local-development override exists for end-to-end testing and is ignored in production builds. */
function serverNow() {
  if (!import.meta.env.PROD) {
    const fake = Date.parse(process.env["STORY_NOW_OVERRIDE"] ?? "");
    if (!Number.isNaN(fake)) return fake;
  }
  return Date.now();
}

/** The moment the server treats as "now" for locks. Only a verified preview session may override it. */
function effectiveNow(preview: boolean, dateOverride?: string | null) {
  if (preview && dateOverride) {
    const t = Date.parse(dateOverride + "+05:30");
    if (!Number.isNaN(t)) return t;
  }
  return serverNow();
}

const tokenInput = z.object({ previewToken: z.string().optional() });
const previewInput = z.object({
  previewToken: z.string().optional(),
  unlockAll: z.boolean().optional(),
  dateOverride: z.string().max(40).nullable().optional(),
});

export const unlockAccess = createServerFn({ method: "POST" })
  .inputValidator(z.object({ code: z.string().max(256), preview: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const s = await session();
    if ((s.data.retryAfter ?? 0) > Date.now()) return { ok: false, token: null, locked: true };
    // ACCESS_CODE may list several accepted words separated by commas.
    const accepted = data.preview
      ? [(process.env["PREVIEW_PASSPHRASE"] ?? "").trim()]
      : (process.env["ACCESS_CODE"] ?? "").split(",").map(normalizeAccessCode);
    const given = data.preview ? data.code.trim() : normalizeAccessCode(data.code);
    const good = Boolean(given) && accepted.some((w) => w !== "" && matches(given, w));
    if (!good) {
      const attempts = (s.data.attempts ?? 0) + 1;
      const lock = attempts >= 5;
      await s.update({ attempts: lock ? 0 : attempts, retryAfter: lock ? Date.now() + 30000 : 0 });
      return { ok: false, token: null, locked: lock };
    }
    if (data.preview) {
      const token = randomUUID();
      await s.update({ previewToken: token, attempts: 0, retryAfter: 0 });
      return { ok: true, token, locked: false };
    }
    await s.update({ access: true, attempts: 0, retryAfter: 0 });
    return { ok: true, token: null, locked: false };
  });

export const checkAccess = createServerFn({ method: "POST" })
  .inputValidator(tokenInput)
  .handler(async ({ data }) => {
    const s = await session();
    return {
      access: Boolean(s.data.access),
      preview: Boolean(
        data.previewToken && s.data.previewToken && matches(data.previewToken, s.data.previewToken),
      ),
    };
  });

export const exitPreview = createServerFn({ method: "POST" }).handler(async () => {
  const s = await session();
  await s.update({ previewToken: "" });
  return true;
});

export const getServerClock = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  return { epoch: serverNow() };
});

/**
 * Returns full content only for chapters that have unlocked on the server clock.
 * Locked chapters are reduced to a date stub, and accepted quiz answers are never sent.
 */
export const loadStory = createServerFn({ method: "POST" })
  .inputValidator(previewInput)
  .handler(async ({ data }): Promise<StoryChapter[]> => {
    const preview = await authorize(data.previewToken);
    const now = effectiveNow(preview, data.dateOverride);
    const open = preview && Boolean(data.unlockAll);
    const { CHAPTERS } = await import("../story/content");
    return CHAPTERS.map((c): StoryChapter => {
      if (!canUnlock(c.unlockDate, c.unlockTime, now, open)) {
        return {
          locked: true,
          id: c.id,
          number: c.number,
          dateLabel: c.dateLabel,
          unlockDate: c.unlockDate,
          unlockTime: c.unlockTime,
        };
      }
      return {
        ...c,
        locked: false,
        steps: c.steps.map(({ answers, ...step }) => ({ ...step, checkable: Boolean(answers) })),
      };
    });
  });

export const checkAnswer = createServerFn({ method: "POST" })
  .inputValidator(
    previewInput.extend({ chapterId: z.string(), stepId: z.string(), value: z.string().max(500) }),
  )
  .handler(async ({ data }) => {
    const preview = await authorize(data.previewToken);
    const { CHAPTERS } = await import("../story/content");
    const c = CHAPTERS.find((x) => x.id === data.chapterId);
    const step = c?.steps.find((x) => x.id === data.stepId);
    if (!c || !step) return { ok: false };
    const now = effectiveNow(preview, data.dateOverride);
    if (!canUnlock(c.unlockDate, c.unlockTime, now, preview && Boolean(data.unlockAll)))
      return { ok: false };
    return { ok: answerMatches(data.value, step.answers) };
  });

export const readProgress = createServerFn({ method: "POST" })
  .inputValidator(tokenInput)
  .handler(async ({ data }) => {
    const preview = await authorize(data.previewToken);
    if (preview) return initialProgress;
    const { getProgress } = await import("./progress.server");
    return getProgress();
  });

const progressPatch = z.object({
  entered: z.boolean().optional(),
  soundOn: z.boolean().optional(),
  favouriteMemory: z.string().max(5000).optional(),
  chapterProgress: z.record(z.string(), z.boolean()).optional(),
  quizAnswers: z.record(z.string(), z.string().max(2000)).optional(),
  easterEggs: z.array(z.string()).max(100).optional(),
  memories: z.array(z.string()).max(1000).optional(),
});

export const saveProgress = createServerFn({ method: "POST" })
  .inputValidator(z.object({ patch: progressPatch, previewToken: z.string().optional() }))
  .handler(async ({ data }) => {
    if (await authorize(data.previewToken)) return null;
    const { mergeProgress } = await import("./progress.server");
    return mergeProgress(data.patch);
  });
