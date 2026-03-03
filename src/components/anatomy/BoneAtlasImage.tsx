import { getBoneAtlasStyle } from "@/data/boneStyles";

const MASTER_IMAGE = "/images/master_skeleton.jpg";

interface BoneAtlasImageProps {
  boneId: string;
  /** Optional bone name for the fallback red-circle label */
  boneName?: string;
  className?: string;
}

/**
 * Displays a zoomed-in region of the master skeleton atlas image for a given bone.
 *
 * - If coordinates exist in boneStyles.ts the image is cropped/zoomed to that bone.
 * - If coordinates are missing the full atlas is shown with a pulsing red ring as
 *   a fallback placeholder until coordinates are calibrated.
 */
export function BoneAtlasImage({ boneId, boneName, className = "" }: BoneAtlasImageProps) {
  const style = getBoneAtlasStyle(boneId);

  const baseStyle: React.CSSProperties = {
    backgroundImage: `url('${MASTER_IMAGE}')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: style ? `${style.zoom * 100}%` : "contain",
    backgroundPosition: style ? `${style.x}% ${style.y}%` : "center center",
    backgroundColor: "rgba(0,0,0,0.35)",
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={baseStyle}>
      {/* Fallback overlay — shown only when no coordinates are set yet */}
      {!style && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-[2px]">
          {/* Pulsing red target ring */}
          <div
            className="w-14 h-14 rounded-full border-4 animate-ping"
            style={{ borderColor: "rgba(239,68,68,0.8)" }}
          />
          <div
            className="absolute w-14 h-14 rounded-full border-4"
            style={{ borderColor: "rgba(239,68,68,0.6)" }}
          />
          {boneName && (
            <p className="relative z-10 mt-10 text-[10px] font-semibold text-red-400 text-center px-2">
              {boneName}
            </p>
          )}
          <p className="relative z-10 text-[9px] text-muted-foreground">coordinates pending</p>
        </div>
      )}
    </div>
  );
}
