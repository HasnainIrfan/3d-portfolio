"use client";

import { useRef, type FC } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  SERVICE_ACCENTS,
  STACK_OFFSET_REM,
  STACK_SCALE_STEP,
} from "@/constants/services-ui-constants";
import { formatCounter, padIndex } from "@/helpers/format-helpers";
import { type ServiceCardProps } from "@/types/services-types";
import { ServiceBullets } from "./service-bullets";
import { ServiceCta } from "./service-cta";

export const ServiceCard: FC<ServiceCardProps> = ({
  service,
  index,
  total,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 30%"],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1 - (total - index) * STACK_SCALE_STEP]
  );
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0.7]);

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `calc(8rem + ${index * STACK_OFFSET_REM}rem)` }}
    >
      <motion.article
        style={{ scale, opacity }}
        className="relative h-[80vh] overflow-hidden rounded-3xl border border-white/10 bg-midnight md:h-[78vh]"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br opacity-30 ${
            SERVICE_ACCENTS[index % SERVICE_ACCENTS.length]
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.10),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(0,0,0,0.5),transparent_45%)]" />

        <div className="relative grid h-full grid-cols-1 gap-8 p-8 md:p-12 lg:grid-cols-12 lg:p-16">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-white/60">
                  Service {formatCounter(index, total)}
                </span>
                <span className="block h-px w-12 bg-white/30" />
              </div>

              <h3 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl">
                {service.title}
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                {service.description}
              </p>
            </div>

            <div className="mt-8">
              <ServiceCta />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 lg:col-span-5">
            <div className="relative flex items-start justify-end">
              <span className="text-[7rem] font-black leading-none tracking-tighter text-white/10 md:text-[10rem]">
                {padIndex(index + 1)}
              </span>
              <div className="absolute right-0 top-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md md:h-20 md:w-20">
                <img
                  src={service.icon}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-8 w-8 opacity-90 md:h-9 md:w-9"
                />
              </div>
            </div>

            <ServiceBullets bullets={service.bullets} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
      </motion.article>
    </div>
  );
};
