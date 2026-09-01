"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export const useHasMounted = (): boolean =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
