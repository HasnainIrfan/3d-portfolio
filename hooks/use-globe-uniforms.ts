"use client";

import { useMemo } from "react";
import { Color, Vector3 } from "three";
import {
  GLOBE,
  LIGHT_POSITION,
  ORBITS,
  ORB_COLORS,
  THEME,
} from "@/constants/globe-constants";

export const useSpikeUniforms = () =>
  useMemo(
    () => ({
      u_scale: { value: GLOBE.spikeScale },
      u_breath: { value: 1 },
      u_push: { value: GLOBE.push },
      u_falloff: { value: GLOBE.falloff },
      u_glow: { value: GLOBE.glow },
      u_lightPosition: { value: LIGHT_POSITION.clone() },
      u_colorDeep: { value: new Color(THEME.deep) },
      u_colorBase: { value: new Color(THEME.base) },
      u_colorHot: { value: new Color(THEME.hot) },
      u_colorSpark: { value: new Color(THEME.spark) },
      u_colorRim: { value: new Color(THEME.rim) },
      u_orbs: { value: ORBITS.map(() => new Vector3()) },
      u_cursor: { value: new Vector3(0, 0, 999) },
      u_hover: { value: 0 },
      u_hoverRadius: { value: GLOBE.hoverRadius },
      u_hoverBulge: { value: GLOBE.hoverBulge },
    }),
    []
  );

export const useOrbUniforms = () =>
  useMemo(
    () =>
      ORB_COLORS.map((color) => ({
        u_color: { value: new Color(color) },
        u_lightPosition: { value: LIGHT_POSITION.clone() },
        u_intensity: { value: 1.05 },
      })),
    []
  );
