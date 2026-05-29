"use client";

import { useRef, type FC } from "react";
import { motion, useInView } from "motion/react";
import { twMerge } from "tailwind-merge";
import { Marquee } from "@/components/portfolio/marquee";
import { REVIEWS } from "@/constants/portfolio-constants";
import { type Review } from "@/types/portfolio-types";

const firstRow = REVIEWS.slice(0, REVIEWS.length / 2);
const secondRow = REVIEWS.slice(REVIEWS.length / 2);

const ReviewCard: FC<Review> = ({ img, name, username, body }) => (
  <figure
    className={twMerge(
      "relative h-full w-72 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-storm/60 to-indigo/40 backdrop-blur-md p-5 transition-all hover:border-white/30 hover:-translate-y-1"
    )}
  >
    <div className="flex flex-row items-center gap-3">
      <img
        className="rounded-full bg-white/10"
        width={40}
        height={40}
        alt={name}
        src={img}
      />
      <div className="flex flex-col">
        <figcaption className="text-sm font-semibold text-white">
          {name}
        </figcaption>
        <p className="text-xs font-medium text-white/40">{username}</p>
      </div>
    </div>
    <blockquote className="mt-3 text-sm text-neutral-300 leading-relaxed">
      &ldquo;{body}&rdquo;
    </blockquote>
  </figure>
);

export const Testimonial: FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="testimonials"
      className="relative c-space section-spacing overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-[60%] rounded-full bg-lavender/10 blur-[140px]" />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-eyebrow"
      >
        Trusted By
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="text-heading mt-3 max-w-3xl"
      >
        What clients <span className="text-gradient">say about working with me.</span>
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative flex flex-col items-center justify-center w-full mt-12 overflow-hidden gap-4"
      >
        <Marquee pauseOnHover className="[--duration:32s] [--gap:1rem]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          className="[--duration:38s] [--gap:1rem]"
        >
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <div className="absolute inset-y-0 left-0 w-1/5 pointer-events-none bg-gradient-to-r from-primary to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/5 pointer-events-none bg-gradient-to-l from-primary to-transparent" />
      </motion.div>
    </section>
  );
};
