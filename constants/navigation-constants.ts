export const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
] as const;

/** Height of the fixed header, subtracted when scrolling to an anchor so the
 *  target does not land underneath it. */
export const NAV_OFFSET = 72;

/** Band across the middle of the viewport that decides the active link. Biased
 *  above centre so a section highlights as you arrive at it, not once it fills
 *  the screen. */
export const NAV_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "-40% 0px -50% 0px",
  threshold: [0, 0.25, 0.5, 0.75, 1],
};

/** Where the page scrolls past before the header takes on its solid background. */
export const NAV_SCROLLED_AT = 20;
