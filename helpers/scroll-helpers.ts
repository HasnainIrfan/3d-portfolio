import { NAV_OFFSET } from "@/constants/navigation-constants";

/**
 * Scrolls to an anchor, leaving room for the fixed header.
 *
 * Done manually rather than with `scroll-margin-top` in CSS because the same
 * handler also rewrites the hash with `replaceState` — letting the browser
 * navigate would add a history entry per nav click, so Back would walk through
 * the menu instead of leaving the page.
 */
export const scrollToSection = (id: string): void => {
  const element = document.getElementById(id);
  if (!element) return;

  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
    behavior: "smooth",
  });
};

/** Scroll to an in-page target and sync the hash without a history entry. */
export const goToAnchor = (href: string): void => {
  if (!href.startsWith("#")) return;
  scrollToSection(href.slice(1));
  history.replaceState(null, "", href);
};
