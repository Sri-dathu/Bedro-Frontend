// Types for the React Bits MicroSlats component (MicroSlats.jsx, installed unmodified from
// https://reactbits.dev/r/MicroSlats-JS-CSS.json). Mirrors the props the component destructures.
import type { CSSProperties, JSX } from "react";

export type MicroSlatsProps = {
  preset?: "swell" | "tide" | "storm" | "signal";
  color?: string;
  glintColor?: string;
  backgroundColor?: string;
  slatWidth?: number;
  slatHeight?: number;
  gap?: number;
  roundness?: number;
  scale?: number;
  speed?: number;
  direction?: number;
  chop?: number;
  stretch?: number;
  glint?: number;
  contrast?: number;
  perspective?: number;
  fog?: number;
  interactive?: boolean;
  cursorStrength?: number;
  cursorSize?: number;
  swirl?: number;
  trail?: number;
  lean?: number;
  intro?: boolean;
  introDuration?: number;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
};

declare function MicroSlats(props: MicroSlatsProps): JSX.Element;
export default MicroSlats;
