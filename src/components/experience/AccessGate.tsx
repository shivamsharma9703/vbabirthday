import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { unlockAccess } from "@/lib/experience/story.functions";
import { useExperience } from "@/lib/experience/state";
import { Button } from "@/components/ui/button";

export function AccessGate() {
  const unlock = useServerFn(unlockAccess);
  const { activate } = useExperience();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="flex min-h-dvh items-center justify-center px-6">
      <form
        className="w-full max-w-lg"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!code.trim() || busy) return;
          setBusy(true);
          setMessage("");
          try {
            const result = await unlock({ data: { code } });
            if (result.ok) {
              setCode("");
              await activate();
            } else {
              setMessage(
                result.locked
                  ? "Take a breath. Try again in a moment."
                  : "Not quite. Try once more.",
              );
            }
          } catch {
            setMessage("Not quite. Try once more.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h1 className="display-sm">Say the word.</h1>
        <label className="sr-only" htmlFor="access-code">
          Private access code
        </label>
        <input
          id="access-code"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (message) setMessage("");
          }}
          className="mt-12 min-h-12 w-full border-b border-border bg-transparent text-xl outline-none focus:border-accent"
        />
        <Button variant="outline" type="submit" disabled={busy} className="mt-8 min-h-12 px-8">
          Enter
        </Button>
        <p className="mt-6 min-h-6 text-muted-foreground" aria-live="polite">
          {message}
        </p>
      </form>
    </section>
  );
}
