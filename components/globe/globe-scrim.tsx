import { type FC } from "react";

/** The page background, `--color-primary`, so the globe dissolves into the page
 *  rather than into grey. */
const PAGE = "3, 4, 18";

/**
 * Overlay above the canvas. It fades the sphere out toward the viewport edges,
 * so a globe half off-screen ends in a soft falloff instead of a hard cut, and
 * holds it far enough down in contrast that text laid over it still reads.
 *
 * The vignette stays off the bottom: the globe lives in the bottom band, and an
 * evenly radial one would crush exactly the part of the frame it occupies.
 */
export const GlobeScrim: FC = () => (
  <>
    <div
      className="absolute inset-0"
      style={{ background: `rgba(${PAGE}, 0.14)` }}
    />
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(145% 115% at 50% 52%, rgba(${PAGE}, 0) 48%, rgba(${PAGE}, 0.28) 80%, rgba(${PAGE}, 0.6) 100%)`,
      }}
    />
    {/* Keeps the globe from crowding the fixed navbar. */}
    <div
      className="absolute inset-x-0 top-0 h-28"
      style={{
        background: `linear-gradient(to bottom, rgba(${PAGE}, 0.9), rgba(${PAGE}, 0))`,
      }}
    />
  </>
);
