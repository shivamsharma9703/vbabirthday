/**
 * SERVER-ONLY persistence for Vaishali's progress.
 * Production: Supabase (service role, table is private).
 * Local development (no Supabase env vars): a JSON file in .data/.
 */
import { initialProgress, type SavedProgress } from "./rules";

const PROFILE = "vaishali";

function hasSupabase() {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}

async function readFileStore(): Promise<Partial<SavedProgress>> {
  const { readFile } = await import("node:fs/promises");
  try {
    return JSON.parse(await readFile(".data/progress.json", "utf8")) as Partial<SavedProgress>;
  } catch {
    return {};
  }
}

async function writeFileStore(value: SavedProgress) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(".data", { recursive: true });
  await writeFile(".data/progress.json", JSON.stringify(value, null, 2));
}

/**
 * With no database configured (production) progress simply lives in her browser.
 * Locally, a JSON file stands in for the database.
 */
export function storeConfigured() {
  if (process.env["NO_PROGRESS_STORE"]) return false; // lets us test the no-database mode locally
  return hasSupabase() || !import.meta.env.PROD;
}

export async function getProgress(): Promise<SavedProgress | null> {
  if (!storeConfigured()) return null;
  if (!hasSupabase()) return { ...initialProgress, ...(await readFileStore()) };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("story_progress")
    .select("progress")
    .eq("profile_id", PROFILE)
    .maybeSingle();
  if (error) throw new Error("Try again");
  return { ...initialProgress, ...((data?.progress as Partial<SavedProgress> | null) ?? {}) };
}

type Patch = { [K in keyof SavedProgress]?: SavedProgress[K] | undefined };

export async function mergeProgress(input: Patch): Promise<SavedProgress | null> {
  if (!storeConfigured()) return null;
  const patch = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined),
  ) as Partial<SavedProgress>;
  if (!hasSupabase()) {
    const next = { ...initialProgress, ...(await readFileStore()), ...patch };
    await writeFileStore(next);
    return next;
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("merge_story_progress", {
    p_profile: PROFILE,
    p_patch: patch as never,
  });
  if (error) throw new Error("Try again");
  return { ...initialProgress, ...((data as Partial<SavedProgress> | null) ?? {}) };
}
