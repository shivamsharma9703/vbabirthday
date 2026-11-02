import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  checkAccess,
  checkAnswer,
  getServerClock,
  loadStory,
  readProgress,
  saveProgress,
  exitPreview,
} from "./story.functions";
import { canUnlock, initialProgress, parseIstDateTime, type SavedProgress } from "./rules";
import type { StoryChapter } from "../story/content";

export type ExperienceState = SavedProgress & { unlockAll: boolean; dateOverride: string | null };
const CACHE = "iwlfy.v2";
const PREVIEW = "our-story.preview";

interface PreviewState {
  token: string;
  unlockAll: boolean;
  dateOverride: string | null;
}

interface Ctx {
  state: ExperienceState;
  /** the first server round-trip (access check + story + progress) has finished */
  ready: boolean;
  /** the server clock has answered at least once, so lock decisions can be trusted */
  clockReady: boolean;
  access: boolean;
  chapters: StoryChapter[];
  now: number;
  previewToken?: string | undefined;
  activate: () => Promise<void>;
  retry: () => Promise<void>;
  startPreview: (token: string) => Promise<void>;
  exit: () => void;
  update: (patch: Partial<ExperienceState>) => void;
  completeChapter: (id: string) => void;
  answer: (key: string, value: string) => void;
  discover: (memory: string) => void;
  unlockEgg: (id: string) => void;
  reset: () => void;
  checkStep: (chapterId: string, stepId: string, value: string) => Promise<boolean>;
}

const ExperienceContext = createContext<Ctx | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedProgress>(initialProgress);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [ready, setReady] = useState(false);
  const [access, setAccess] = useState(false);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [clock, setClock] = useState({ now: 0, synced: false });
  const pending = useRef<Partial<SavedProgress>>({});
  const hydrated = useRef(false);
  const offset = useRef(0);
  const previewRef = useRef<PreviewState | null>(null);
  const localRef = useRef<SavedProgress>(initialProgress);
  const lastStoryLoad = useRef(0);

  const check = useServerFn(checkAccess);
  const clockFn = useServerFn(getServerClock);
  const story = useServerFn(loadStory);
  const read = useServerFn(readProgress);
  const write = useServerFn(saveProgress);
  const leave = useServerFn(exitPreview);
  const checkAnswerFn = useServerFn(checkAnswer);

  useEffect(() => {
    localRef.current = saved;
  }, [saved]);

  const previewArgs = useCallback(() => {
    const p = previewRef.current;
    return {
      previewToken: p?.token,
      unlockAll: p?.unlockAll ?? false,
      dateOverride: p?.dateOverride ?? null,
    };
  }, []);

  const reloadStory = useCallback(async () => {
    lastStoryLoad.current = Date.now();
    setChapters(await story({ data: previewArgs() }));
  }, [story, previewArgs]);

  const restore = useCallback(
    async (token?: string) => {
      const status = await check({ data: { previewToken: token } });
      if (!status.access && !status.preview) {
        setAccess(false);
        return;
      }
      lastStoryLoad.current = Date.now();
      const [content, progress] = await Promise.all([
        story({ data: previewArgs() }),
        read({ data: { previewToken: token } }),
      ]);
      // Keep what she already chose on this device (Begin / sound) so the opening never repeats.
      const local = localRef.current;
      // progress is null when no database is configured: then this device's own copy is the truth.
      const merged: SavedProgress = progress
        ? {
            ...progress,
            entered: progress.entered || local.entered,
            soundOn: progress.soundOn || local.soundOn,
          }
        : local;
      const catchUp: Partial<SavedProgress> = {};
      if (progress && merged.entered && !progress.entered) catchUp.entered = true;
      if (progress && merged.soundOn && !progress.soundOn) catchUp.soundOn = true;
      setChapters(content);
      setSaved(merged);
      setAccess(true);
      pending.current = catchUp;
      hydrated.current = true;
    },
    [check, story, read, previewArgs],
  );

  useEffect(() => {
    let alive = true;
    let retryTimer: ReturnType<typeof setTimeout>;
    try {
      const cache = localStorage.getItem(CACHE);
      if (cache) {
        const parsed = { ...initialProgress, ...JSON.parse(cache) } as SavedProgress;
        localRef.current = parsed;
        setSaved(parsed);
      }
      const raw = sessionStorage.getItem(PREVIEW);
      if (raw) {
        const p = JSON.parse(raw) as PreviewState;
        previewRef.current = p;
        setPreview(p);
      }
    } catch {
      /* cache is optional */
    }
    const boot = async () => {
      try {
        await restore(previewRef.current?.token);
        if (alive) setReady(true);
      } catch {
        // Network trouble: keep trying quietly, and let the screen show a calm waiting state.
        if (alive) retryTimer = setTimeout(boot, 4000);
      }
    };
    void boot();
    return () => {
      alive = false;
      clearTimeout(retryTimer);
    };
  }, [restore]);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const result = await clockFn();
        offset.current = result.epoch - Date.now();
        if (active) setClock({ now: Date.now() + offset.current, synced: true });
      } catch {
        // Device clock fallback, but the "synced" flag stays false until the server answers.
        if (active) setClock((c) => ({ now: Date.now() + offset.current, synced: c.synced }));
      }
    };
    void sync();
    const tick = setInterval(
      () => setClock((c) => ({ now: Date.now() + offset.current, synced: c.synced })),
      1000,
    );
    const refresh = setInterval(() => void sync(), 60000);
    return () => {
      active = false;
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, [clockFn]);

  useEffect(() => {
    if (!ready || preview) return;
    try {
      localStorage.setItem(CACHE, JSON.stringify(saved));
    } catch {
      /* offline cache optional */
    }
  }, [saved, ready, preview]);

  useEffect(() => {
    if (!access || preview || !hydrated.current) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const flush = async () => {
      const patch = pending.current;
      if (!Object.keys(patch).length) return;
      pending.current = {};
      try {
        await write({ data: { patch } });
      } catch {
        pending.current = { ...patch, ...pending.current };
        if (!cancelled) timer = setTimeout(flush, 5000);
      }
    };
    timer = setTimeout(flush, 800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [saved, access, preview, write]);

  const now = preview?.dateOverride ? parseIstDateTime(preview.dateOverride) : clock.now;

  // When a locked chapter's moment arrives while the page is open, fetch its content.
  useEffect(() => {
    if (!access || !clock.synced) return;
    const due = chapters.some(
      (c) => c.locked && canUnlock(c.unlockDate, c.unlockTime, now, preview?.unlockAll ?? false),
    );
    if (due && Date.now() - lastStoryLoad.current > 5000) void reloadStory().catch(() => undefined);
  }, [now, chapters, access, clock.synced, preview?.unlockAll, reloadStory]);

  // Preview switches change what the server should send.
  const previewKey = preview ? `${preview.unlockAll}|${preview.dateOverride ?? ""}` : "";
  useEffect(() => {
    if (!access || !previewKey) return;
    void reloadStory().catch(() => undefined);
  }, [previewKey, access, reloadStory]);

  /** Update saved progress from the latest state, so callers never act on a stale copy. */
  const change = useCallback((fn: (s: SavedProgress) => Partial<SavedProgress>) => {
    setSaved((s) => {
      const patch = fn(s);
      if (!Object.keys(patch).length) return s;
      if (!previewRef.current) pending.current = { ...pending.current, ...patch };
      return { ...s, ...patch };
    });
  }, []);

  const update = useCallback(
    (patch: Partial<ExperienceState>) => {
      const { unlockAll, dateOverride, ...progress } = patch;
      if (unlockAll !== undefined || dateOverride !== undefined) {
        setPreview((p) => {
          if (!p) return p;
          const next = {
            ...p,
            ...(unlockAll !== undefined ? { unlockAll } : {}),
            ...(dateOverride !== undefined ? { dateOverride } : {}),
          };
          previewRef.current = next;
          try {
            sessionStorage.setItem(PREVIEW, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
      }
      change(() => progress);
    },
    [change],
  );

  const completeChapter = useCallback(
    (id: string) =>
      change((s) =>
        s.chapterProgress[id] ? {} : { chapterProgress: { ...s.chapterProgress, [id]: true } },
      ),
    [change],
  );
  const answer = useCallback(
    (key: string, value: string) =>
      change((s) => ({ quizAnswers: { ...s.quizAnswers, [key]: value } })),
    [change],
  );
  const discover = useCallback(
    (memory: string) =>
      change((s) => (s.memories.includes(memory) ? {} : { memories: [...s.memories, memory] })),
    [change],
  );
  const unlockEgg = useCallback(
    (id: string) =>
      change((s) => (s.easterEggs.includes(id) ? {} : { easterEggs: [...s.easterEggs, id] })),
    [change],
  );
  const reset = useCallback(() => update(initialProgress), [update]);

  const startPreview = useCallback(
    async (token: string) => {
      const p = { token, unlockAll: false, dateOverride: null };
      sessionStorage.setItem(PREVIEW, JSON.stringify(p));
      previewRef.current = p;
      setPreview(p);
      await restore(token);
    },
    [restore],
  );

  const exit = useCallback(() => {
    sessionStorage.removeItem(PREVIEW);
    previewRef.current = null;
    setPreview(null);
    setAccess(false);
    setChapters([]);
    hydrated.current = false;
    void leave()
      .then(() => restore())
      .catch(() => undefined);
  }, [leave, restore]);

  const checkStep = useCallback(
    async (chapterId: string, stepId: string, value: string) => {
      const result = await checkAnswerFn({
        data: { ...previewArgs(), chapterId, stepId, value },
      });
      return result.ok;
    },
    [checkAnswerFn, previewArgs],
  );

  const state = useMemo(
    () => ({
      ...saved,
      unlockAll: preview?.unlockAll ?? false,
      dateOverride: preview?.dateOverride ?? null,
    }),
    [saved, preview],
  );

  const value: Ctx = {
    state,
    ready,
    clockReady: clock.synced || Boolean(preview?.dateOverride),
    access,
    chapters,
    now,
    previewToken: preview?.token,
    activate: () => restore(),
    retry: () => restore(previewRef.current?.token),
    startPreview,
    exit,
    update,
    completeChapter,
    answer,
    discover,
    unlockEgg,
    reset,
    checkStep,
  };
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error("Experience provider required");
  return ctx;
}
