"use client";

import { type FC } from "react";
import { Particles } from "@/components/portfolio/particles";
import { useInViewOnce } from "@/hooks/use-in-view-once";
import { ContactDetails } from "@/components/contact/contact-details";
import { ContactForm } from "@/components/contact/contact-form";

export const Contact: FC = () => {
  const [particlesRef, particlesInView] = useInViewOnce<HTMLDivElement>();

  return (
    <section
      id="contact"
      className="c-space section-spacing relative overflow-hidden"
    >
      <div ref={particlesRef} className="absolute inset-0 -z-10">
        {particlesInView && (
          <Particles
            className="absolute inset-0"
            quantity={120}
            ease={80}
            color="#ffffff"
            refresh
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-10 h-72 w-72 rounded-full bg-royal/15 blur-[140px]" />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-coral/15 blur-[140px]" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <ContactDetails />
        <ContactForm />
      </div>
    </section>
  );
};
