"use client";

import { useCallback, useEffect, useState, type FC, type MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const NAV_OFFSET = 72;

const smoothScrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top =
    el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
};

const NavLink: FC<{
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}> = ({ href, label, active, onClick }) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      smoothScrollTo(href.slice(1));
      history.replaceState(null, "", href);
    }
    onClick?.();
  };
  return (
  <li className="nav-li relative">
    <a
      className={`nav-link relative ${active ? "text-white" : ""}`}
      href={href}
      onClick={handleClick}
    >
      {label}
      {active && (
        <motion.span
          layoutId="active-nav"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="absolute -bottom-1 left-0 right-0 mx-auto h-px w-6 bg-gradient-to-r from-coral to-lavender"
        />
      )}
    </a>
  </li>
  );
};

const HireMeButton: FC<{ onClick?: () => void; full?: boolean }> = ({
  onClick,
  full,
}) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    smoothScrollTo("contact");
    history.replaceState(null, "", "#contact");
    onClick?.();
  };
  return (
  <a
    href="#contact"
    onClick={handleClick}
    className={`group relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md pl-4 pr-1.5 py-1.5 text-sm font-medium text-white transition-colors hover:border-white/30 ${
      full ? "w-full justify-between" : ""
    }`}
  >
    <span>Hire Me</span>
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary transition-transform duration-300 group-hover:translate-x-0.5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 -rotate-45"
        aria-hidden
      >
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
      </svg>
    </span>
  </a>
  );
};

export const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((i) => i.href.replace("#", ""));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-30 w-full transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-primary/70 border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto c-space max-w-7xl">
        <div className="flex items-center justify-between py-3">
          <a
            href="#home"
            className="group flex items-center gap-2 text-base font-semibold tracking-tight text-white"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-royal to-coral text-white text-sm font-black shadow-lg shadow-coral/20 group-hover:scale-105 transition-transform">
              H
            </span>
            <span className="hidden sm:inline">Hasnain Irfan</span>
          </a>

          <nav className="hidden sm:flex">
            <ul className="nav-ul">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  active={active === item.href}
                />
              ))}
            </ul>
          </nav>

          <div className="hidden sm:flex items-center">
            <HireMeButton />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex cursor-pointer text-neutral-300 hover:text-white sm:hidden"
            aria-label="Toggle menu"
          >
            <img
              src={isOpen ? "/assets/close.svg" : "/assets/menu.svg"}
              className="w-6 h-6"
              alt=""
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="block overflow-hidden text-center sm:hidden border-t border-white/10 bg-primary/90 backdrop-blur-xl"
          >
            <nav className="py-5">
              <ul className="nav-ul">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    active={active === item.href}
                    onClick={() => setIsOpen(false)}
                  />
                ))}
              </ul>
              <div className="mt-4 px-6">
                <HireMeButton full onClick={() => setIsOpen(false)} />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
