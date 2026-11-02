import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
export function VoicePlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    let active = true;
    fetch(src, { method: "HEAD" })
      .then((r) => {
        if (active) setAvailable(r.ok && r.headers.get("content-type")?.includes("audio") === true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [src]);
  return (
    <section className="mx-auto max-w-2xl px-6 py-24">
      <p className="eyebrow">From Shivam</p>
      {available ? (
        <div className="mt-8 flex items-center gap-6">
          <audio
            ref={ref}
            src={src}
            preload="none"
            onEnded={() => setPlaying(false)}
            onError={() => setAvailable(false)}
          />
          <Button
            variant="outline"
            size="icon"
            aria-label={playing ? "Pause voice message" : "Play voice message"}
            onClick={() => {
              const audio = ref.current;
              if (!audio) return;
              if (playing) {
                audio.pause();
                setPlaying(false);
              } else
                void audio
                  .play()
                  .then(() => setPlaying(true))
                  .catch(() => undefined);
            }}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <div
            className={`waveform flex h-16 flex-1 items-center justify-between gap-1 ${playing ? "is-playing" : ""}`}
            aria-hidden="true"
          >
            {Array.from({ length: 32 }, (_, i) => (
              <span key={i} className={`wave-bar wave-${i % 4}`} />
            ))}
          </div>
        </div>
      ) : (
        <p className="editorial mt-8">Some things I want to say in person.</p>
      )}
    </section>
  );
}
