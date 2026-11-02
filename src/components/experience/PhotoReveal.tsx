import { useState } from "react";
import { motion } from "motion/react";
import type { MediaSlot } from "@/lib/story/content";
import { PHOTO_SIZES } from "@/lib/story/photo-sizes";
import { useBlur } from "@/hooks/use-blur";

/**
 * A real photograph from /public/assets/photos, shown at its own proportions
 * so nothing is cropped. If a file is missing the slot renders nothing at all.
 */
export function PhotoReveal({
  slot,
  className = "",
  priority = false,
  caption = true,
}: {
  slot: MediaSlot;
  className?: string;
  priority?: boolean;
  caption?: boolean;
}) {
  const blur = useBlur();
  const [failed, setFailed] = useState(false);
  const dir = slot.kind === "video" ? "videos" : slot.kind === "document" ? "documents" : "photos";
  const src = `/assets/${dir}/${slot.file}`;
  const size = PHOTO_SIZES[slot.file];
  if (failed) return null;

  return (
    <motion.figure
      className={`group relative overflow-hidden bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] ${className}`}
      {...(size ? { style: { aspectRatio: `${size[0]} / ${size[1]}` } } : {})}
      initial={{ opacity: 0, scale: 1.03, filter: blur(14) }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <img
        src={src}
        alt={slot.label}
        width={size?.[0]}
        height={size?.[1]}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        onError={() => setFailed(true)}
      />
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-4 text-[11px] tracking-[0.18em] text-white/85 uppercase">
          <span>{slot.label}</span>
        </figcaption>
      )}
    </motion.figure>
  );
}
