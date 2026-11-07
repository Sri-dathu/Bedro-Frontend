// Types for the React Bits MetallicPaint component (MetallicPaint.jsx, installed unmodified from
// https://reactbits.dev/r/MetallicPaint-JS-CSS.json). Mirrors the props the component destructures.
import type { CSSProperties, JSX } from "react";

export type MetallicPaintProps = {
  imageSrc?: string;
  text?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  color?: string;
  backgroundColor?: string;
  density?: number;
  softness?: number;
  dispersion?: number;
  distortion?: number;
  edgeBend?: number;
  angle?: number;
  speed?: number;
  scale?: number;
  rotation?: number;
  mouseTilt?: number;
  lightMode?: boolean;
  intro?: boolean;
  paused?: boolean;
  dpr?: number;
  className?: string;
  style?: CSSProperties;
};

declare function MetallicPaint(props: MetallicPaintProps): JSX.Element;
export default MetallicPaint;
