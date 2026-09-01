"use client";

import { useRef, type FC } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ServiceCard } from "@/components/services/service-card";
import { ServicesCtaCard } from "@/components/services/services-cta-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SERVICES } from "@/constants/services-constants";
import { padIndex } from "@/helpers/format-helpers";

export const Services: FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const auroraY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const auroraOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.3, 0.7, 0.3]
  );

  return (
    <section
      ref={sectionRef}
      id="services"
      className="c-space section-spacing relative overflow-visible"
    >
      <motion.div
        aria-hidden
        style={{ y: auroraY, opacity: auroraOpacity }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute right-10 top-10 h-80 w-80 rounded-full bg-lavender/20 blur-[140px]" />
        <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-aqua/15 blur-[140px]" />
      </motion.div>

      <SectionHeader
        className="mb-12"
        eyebrow={`Services · ${padIndex(SERVICES.length)}`}
        title={
          <>
            What I can build for you,{" "}
            <span className="text-gradient">end-to-end.</span>
          </>
        }
        hint={["Scroll", "Stack"]}
      />

      <div className="relative space-y-6 md:space-y-8">
        {SERVICES.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            total={SERVICES.length}
          />
        ))}
      </div>

      <ServicesCtaCard />
    </section>
  );
};
