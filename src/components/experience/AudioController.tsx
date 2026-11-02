import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useExperience } from "@/lib/experience/state";
import { Button } from "@/components/ui/button";
export function AudioController({
  src,
  label,
}: {
  src?: string | undefined;
  label?: string | undefined;
}) {
  const { state, update } = useExperience();
  const ref = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    setAvailable(false);
    if (src)
      fetch(src, { method: "HEAD" })
        .then((r) => {
          if (active)
            setAvailable(r.ok && r.headers.get("content-type")?.includes("audio") === true);
        })
        .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [src]);
  useEffect(() => {
    if (!state.soundOn) ref.current?.pause();
    const start = () => {
      const audio = ref.current;
      if (state.soundOn && audio && audio.paused) {
        audio.volume = 0.35;
        void audio.play().catch(() => undefined);
      }
    };
    document.addEventListener("pointerdown", start);
    document.addEventListener("keydown", start);
    return () => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
    };
  }, [state.soundOn, available]);
  if (!src || !available) return null;
  return (
    <div className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-50">
      <audio ref={ref} src={src} loop preload="none" onError={() => setAvailable(false)} />
      <Button
        variant="outline"
        aria-label={state.soundOn ? "Mute sound" : "Unmute sound"}
        className="h-11 gap-2"
        onClick={() => {
          const on = !state.soundOn;
          update({ soundOn: on });
          if (on) {
            const audio = ref.current;
            if (audio) {
              audio.volume = 0.35;
              void audio.play().catch(() => undefined);
            }
          } else ref.current?.pause();
        }}
      >
        {state.soundOn ? <Volume2 /> : <VolumeX />}
        <span className="eyebrow">{label ?? "Ambience"}</span>
      </Button>
    </div>
  );
}
