import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { unlockAccess } from "@/lib/experience/story.functions";
import { useExperience } from "@/lib/experience/state";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Our Story · Private preview" },
      { name: "description", content: "Private preview." },
      { property: "og:title", content: "A story for Vaishali" },
      { property: "og:description", content: "A private birthday story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Preview,
});
function Preview() {
  const { state, update, reset, ready, previewToken, startPreview, chapters } = useExperience();
  const [pass, setPass] = useState("");
  const [wrong, setWrong] = useState(false);
  const unlock = useServerFn(unlockAccess);
  if (!ready) return null;
  if (!previewToken)
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <form
          className="w-full max-w-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const r = await unlock({ data: { code: pass, preview: true } });
              if (r.ok && r.token) {
                setPass("");
                await startPreview(r.token);
              } else setWrong(true);
            } catch {
              setWrong(true);
            }
          }}
        >
          <label htmlFor="pass" className="eyebrow">
            Passphrase
          </label>
          <input
            id="pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="mt-4 min-h-12 w-full border-b border-border bg-transparent text-lg"
          />
          <Button type="submit" variant="outline" className="mt-8 min-h-12 w-full">
            Enter
          </Button>
          {wrong && <p className="mt-6 text-muted-foreground">Not quite. Try once more.</p>}
        </form>
      </main>
    );
  return (
    <main className="min-h-dvh px-6 py-24 sm:px-12">
      <p className="eyebrow">Control room</p>
      <h1 className="display-sm mt-4">Preview</h1>
      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <section>
          <p className="eyebrow">Switches</p>
          <div className="mt-5 space-y-3">
            <Toggle
              label="Unlock all chapters"
              on={state.unlockAll}
              onClick={() => update({ unlockAll: !state.unlockAll })}
            />
            <Toggle
              label="Sound on"
              on={state.soundOn}
              onClick={() => update({ soundOn: !state.soundOn })}
            />
            <Toggle
              label="Entered"
              on={state.entered}
              onClick={() => update({ entered: !state.entered })}
            />
          </div>
          <label className="eyebrow mt-10 block" htmlFor="preview-date">
            Simulate date and time (Asia/Kolkata)
          </label>
          <input
            id="preview-date"
            type="datetime-local"
            value={state.dateOverride ?? ""}
            onChange={(e) => update({ dateOverride: e.target.value || null })}
            className="mt-4 min-h-12 w-full border border-border bg-transparent px-4"
          />
          <Button variant="link" className="mt-3" onClick={() => update({ dateOverride: null })}>
            Use real date
          </Button>
          <p className="eyebrow mt-10">Reset preview</p>
          <Button variant="outline" className="mt-4" onClick={reset}>
            Everything
          </Button>
        </section>
        <section>
          <p className="eyebrow">Jump to chapter</p>
          <ul className="mt-5 space-y-2">
            {chapters.map((c) => (
              <li key={c.id}>
                <Link
                  to="/day/$day"
                  params={{ day: c.id }}
                  className="text-lg hover:text-accent-text"
                >
                  <span className="font-mono text-xs">{c.number}</span>{" "}
                  {c.locked ? "locked" : c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      aria-pressed={on}
      className="min-h-12 w-full justify-between"
    >
      <span>{label}</span>
      <span>{on ? "ON" : "OFF"}</span>
    </Button>
  );
}
