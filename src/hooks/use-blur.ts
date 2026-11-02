import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Returns a function that builds a literal CSS blur() string for animations.
 * Framer Motion cannot interpolate var() inside filter, so values are computed here.
 * Weaker devices get a lighter blur; reduced-motion gets none.
 */
export function useBlur() {
  const reduced = useReducedMotion();
  const [weak, setWeak] = useState(false);
  useEffect(() => {
    setWeak(navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
  }, []);
  return (px: number) =>
    reduced ? "blur(0px)" : `blur(${weak ? Math.max(2, Math.round(px / 3)) : px}px)`;
}
