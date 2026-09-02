import { type FC } from "react";
import { THEME } from "@/constants/globe-constants";
import { GlobeScrim } from "./globe-scrim";

const orb = `radial-gradient(circle at 42% 38%, ${THEME.spark}40 0%, ${THEME.base}59 22%, ${THEME.deep}80 46%, transparent 68%)`;

const flare = `radial-gradient(circle at 68% 66%, ${THEME.hot}33 0%, transparent 55%)`;

const halo = `radial-gradient(circle at 50% 50%, ${THEME.base}1f 0%, transparent 62%)`;

export const GlobePoster: FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    style={{ backgroundColor: THEME.core }}
  >
    <div
      className="absolute left-1/2 top-1/2 aspect-square w-[150vw] max-w-[880px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ backgroundImage: `${orb}, ${flare}` }}
    />
    <div className="absolute inset-0" style={{ backgroundImage: halo }} />
    <GlobeScrim />
  </div>
);
