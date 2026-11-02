import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dodgePosition } from "@/lib/experience/rules";
const MotionButton = motion.create(Button);
export function NoButton({ onYes }: { onYes: () => void }) {
  const [attempts, setAttempts] = useState(0);
  const [said, setSaid] = useState(false);
  const reduced = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  function approach() {
    if (attempts >= 4) {
      setAttempts(5);
      setPos({ x: 0, y: 0 });
      return;
    }
    const next = attempts + 1;
    setAttempts(next);
    setPos(dodgePosition(next));
  }
  return (
    <div className="relative mx-auto w-full max-w-2xl px-6 py-32 text-center">
      <p className="editorial">Will you be my person forever?</p>
      <AnimatePresence mode="wait">
        {!said ? (
          <motion.div
            key="ask"
            exit={{ opacity: 0 }}
            className="relative mt-16 flex h-44 items-center justify-center gap-10"
          >
            <Button className="relative z-20 min-h-14 w-28 shrink-0" onClick={() => setSaid(true)}>
              Yes
            </Button>
            <MotionButton
              variant="outline"
              className="relative z-10 min-h-14 w-24 shrink-0"
              animate={{
                x: reduced ? 0 : pos.x,
                y: reduced ? 0 : pos.y,
                opacity: attempts >= 5 ? 0.55 : 1,
              }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}
              onPointerEnter={approach}
              onPointerDown={(e) => {
                if (e.pointerType !== "mouse") approach();
              }}
              onClick={() => {
                if (attempts >= 4) setSaid(true);
              }}
            >
              No
            </MotionButton>
          </motion.div>
        ) : (
          <motion.div
            key="yes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="mt-16 space-y-6"
            onAnimationComplete={onYes}
          >
            <p className="editorial">I already knew your answer.</p>
            <p className="editorial">Because I chose you too.</p>
          </motion.div>
        )}
      </AnimatePresence>
      {!said && attempts > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          {attempts >= 5
            ? "Vaishali. You know that's not an option."
            : [
                "",
                "You know that’s not an option.",
                "Nice try.",
                "Still not an option.",
                "Still not an option.",
              ][attempts]}
        </p>
      )}
    </div>
  );
}
