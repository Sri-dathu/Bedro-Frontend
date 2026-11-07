import { Suspense, lazy, useEffect, useState } from "react";

// React Bits MetallicPaint (installed unmodified), loaded after first paint. Rendered fully static: no speed, no
// intro, no pointer tilt — it draws once and its animation loop stays idle.
const MetallicPaint = lazy(() => import("@/components/MetallicPaint"));

function TextMark() {
  return <span className="font-display text-lg font-bold tracking-tight">BEDRO</span>;
}

function webgl2(): boolean {
  if (typeof WebGL2RenderingContext === "undefined") return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/** Static metallic BEDRO wordmark (with the brand's blue full stop). Falls back to the text wordmark when WebGL2 is
 *  unavailable, during server rendering, and while the component loads — same box, so nothing shifts. */
export function BrandWordmark() {
  const [metal, setMetal] = useState(false);
  useEffect(() => setMetal(webgl2()), []);
  return (
    <span className="flex items-end">
      <span className={`relative inline-flex items-center ${metal ? "h-7 w-[86px]" : ""}`} aria-hidden={metal || undefined}>
        {metal ? (
          <Suspense fallback={<TextMark />}>
            <MetallicPaint
              text="BEDRO"
              fontFamily="Sora, ui-sans-serif, system-ui, sans-serif"
              fontWeight={800}
              color="#c9d6ea"
              backgroundColor="transparent"
              lightMode
              density={2}
              softness={0.1}
              dispersion={0.25}
              distortion={0.05}
              edgeBend={0.6}
              angle={70}
              scale={1}
              speed={0}
              paused
              intro={false}
              mouseTilt={0}
            />
          </Suspense>
        ) : (
          <TextMark />
        )}
      </span>
      {metal && <span className="sr-only">BEDRO</span>}
      {/* the canvas pads around the glyphs: lift the full stop onto the letters' baseline */}
      <span className={`font-display text-lg font-bold leading-none text-primary relative ${metal ? "mb-1" : "mb-[3px]"}`} aria-hidden>.</span>
    </span>
  );
}
