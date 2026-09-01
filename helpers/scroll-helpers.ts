import { NAV_OFFSET } from "@/constants/navigation-constants";

export const scrollToSection = (id: string): void => {
  const element = document.getElementById(id);
  if (!element) return;

  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
    behavior: "smooth",
  });
};

export const goToAnchor = (href: string): void => {
  if (!href.startsWith("#")) return;
  scrollToSection(href.slice(1));
  history.replaceState(null, "", href);
};
