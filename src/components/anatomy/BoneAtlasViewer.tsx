/**
 * BoneAtlasViewer
 *
 * Renders a bone visual by zooming into the master skeleton atlas image
 * using CSS background-position (sprite technique).
 *
 * • If the boneId has a coordinate entry in boneStyles, the component
 *   shows the atlas image cropped and zoomed to that bone's region.
 *
 * • If no coordinate entry exists (unmapped bone), it falls back to
 *   the full atlas image with an animated red-circle indicator so the
 *   user can still see the skeleton context.
 */

import { getBoneAtlasStyle } from "@/data/boneStyles";
import { cn } from "@/lib/utils";

interface BoneAtlasViewerProps {
  boneId: string;
  className?: string;
  /** Label shown in the fallback tooltip (optional) */
  boneName?: string;
}

export function BoneAtlasViewer({ boneId, className, boneName }: BoneAtlasViewerProps) {
  const atlasStyle = getBoneAtlasStyle(boneId);

  // ── Mapped bone: zoomed sprite ─────────────────────────────────────────
  if (atlasStyle) {
    return (
      <div
        role="img"
        aria-label={boneName ? `${boneName} on skeleton atlas` : "Bone on skeleton atlas"}
        className={cn("w-full h-full rounded-lg", className)}
        style={atlasStyle}
      />
    );
  }

  // ── Unmapped bone: full image + red-circle fallback ────────────────────
  return (
    <div
      role="img"
      aria-label={boneName ? `Full skeleton — ${boneName} not yet mapped` : "Full skeleton atlas"}
      className={cn("relative w-full h-full rounded-lg overflow-hidden", className)}
    >
      {/* Full atlas image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/master_skeleton.jpg')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Pulsing red circle — "bone not yet pinned" indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="relative flex h-10 w-10">
          {/* Outer ping ring */}
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: "rgba(239, 68, 68, 0.4)" }}
          />
          {/* Inner solid circle */}
          <span
            className="relative inline-flex rounded-full h-10 w-10 items-center justify-center"
            style={{
              border: "2.5px solid #ef4444",
              background: "rgba(239, 68, 68, 0.15)",
            }}
          >
            <span
              className="block w-2 h-2 rounded-full"
              style={{ background: "#ef4444" }}
            />
          </span>
        </span>
      </div>

      {/* Small label */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
          style={{
            background: "rgba(239,68,68,0.18)",
            color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.35)",
          }}
        >
          Region not yet pinned
        </span>
      </div>
    </div>
  );
}
