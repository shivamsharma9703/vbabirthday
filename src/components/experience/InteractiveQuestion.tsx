import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { PublicStep } from "@/lib/story/content";
import { useExperience } from "@/lib/experience/state";
import { normalizeAnswer } from "@/lib/experience/rules";
import { Button } from "@/components/ui/button";

export function InteractiveQuestion({
  chapterId,
  step,
  onSolved,
  memory,
}: {
  chapterId: string;
  step: PublicStep;
  onSolved?: () => void;
  memory?: string;
}) {
  const { state, answer, discover, checkStep } = useExperience();
  const solved = state.quizAnswers[step.id] !== undefined;
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(0);
  const [busy, setBusy] = useState(false);

  function accept(v: string) {
    answer(step.id, normalizeAnswer(v) || "skipped");
    if (memory) discover(memory);
    onSolved?.();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const typed = value.trim();
    if (!typed || busy) return;
    if (!step.checkable) {
      accept(typed);
      return;
    }
    setBusy(true);
    try {
      if (await checkStep(chapterId, step.id, typed)) accept(typed);
      else setWrong((w) => w + 1);
    } catch {
      /* quiet: she can simply try again */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-24">
      <p className="eyebrow">A question</p>
      <p className="editorial mt-6">{step.prompt}</p>
      <AnimatePresence mode="wait">
        {solved ? (
          <motion.p
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-sm text-accent-text"
          >
            {step.reveal ?? "You remembered."}
          </motion.p>
        ) : step.options ? (
          <motion.div
            key="options"
            exit={{ opacity: 0 }}
            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {step.options.map((option) => (
              <Button
                variant="outline"
                className="min-h-14 whitespace-normal"
                key={option}
                onClick={() => accept(option)}
              >
                {option}
              </Button>
            ))}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0 }}
            onSubmit={submit}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <label className="sr-only" htmlFor={`q-${step.id}`}>
              {step.prompt}
            </label>
            <input
              id={`q-${step.id}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              placeholder="Type your answer"
              className="min-h-12 min-w-0 flex-1 border-b border-border bg-transparent pb-3 text-lg outline-none placeholder:text-muted-foreground focus:border-accent"
            />
            <Button type="submit" variant="outline" disabled={busy} className="min-h-12 px-8">
              Answer
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
      {!solved && wrong > 0 && step.hint && (
        <p className="mt-6 text-sm text-muted-foreground italic">{step.hint}</p>
      )}
      {!solved && !step.options && wrong >= 3 && (
        <Button variant="link" className="mt-6 text-xs" onClick={() => accept("skipped")}>
          Let me through anyway
        </Button>
      )}
    </div>
  );
}
