/** How quickly a particle fades up to its target alpha, per frame. */
export const ALPHA_STEP = 0.02;

/** Distance from an edge, in px, over which a particle fades out. */
export const EDGE_FADE_DISTANCE = 20;

/** Debounce on resize before the field is rebuilt, in ms. */
export const RESIZE_DEBOUNCE = 200;

/** Alpha each particle drifts toward, before the edge fade is applied. */
export const TARGET_ALPHA = { min: 0.1, range: 0.6 } as const;

/** Per-frame drift, and how strongly a particle is pulled toward the cursor. */
export const DRIFT = 0.1;
export const MAGNETISM = { min: 0.1, range: 4 } as const;
