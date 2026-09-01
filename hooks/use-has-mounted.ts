"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * "Have we hydrated yet?" without a state update in an effect.
 *
 * A media query cannot be known during SSR, so the first client render has to
 * match the server's guess or React reports a hydration mismatch. The usual
 * `mounted` flag set from `useEffect` schedules an extra render pass, which
 * React now flags as a cascading render.
 *
 * `useSyncExternalStore` answers the same question by design: the server
 * snapshot is `false`, the client snapshot is `true`, and the switch happens
 * during hydration rather than in a follow-up commit. Nothing ever changes, so
 * the store never needs to notify and `subscribe` is a no-op.
 */
export const useHasMounted = (): boolean =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
