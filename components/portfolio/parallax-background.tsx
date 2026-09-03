"use client";

import Image from "next/image";
import { type FC } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useDeferredLayers } from "@/hooks/use-deferred-3d";

const LAYER_SIZES = "100vw";

export const ParallaxBackground: FC = () => {
  const withLayers = useDeferredLayers();
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { damping: 50 });
  const mountain3Y = useTransform(x, [0, 0.5], ["0%", "70%"]);
  const planetsX = useTransform(x, [0, 0.5], ["0%", "-20%"]);
  const mountain2Y = useTransform(x, [0, 0.5], ["0%", "30%"]);

  return (
    <section className="absolute inset-0 bg-black/40">
      <div className="relative h-screen overflow-y-hidden">
        <div className="absolute inset-0 -z-50">
          <Image
            src="/assets/sky.webp"
            alt=""
            aria-hidden
            fill
            priority
            fetchPriority="high"
            sizes={LAYER_SIZES}
            className="object-cover object-bottom"
          />
        </div>

        {!withLayers && (
          <div
            aria-hidden
            className="absolute inset-0 -z-40 bg-gradient-to-b from-transparent via-primary/30 to-primary"
          />
        )}

        {withLayers && (
          <>
            <motion.div
              aria-hidden
              className="absolute inset-0 -z-40"
              style={{ y: mountain3Y }}
            >
              <Image
                src="/assets/mountain-3.webp"
                alt=""
                fill
                sizes={LAYER_SIZES}
                className="object-cover object-bottom"
              />
            </motion.div>

            <motion.div
              aria-hidden
              className="absolute inset-0 -z-30"
              style={{ x: planetsX }}
            >
              <Image
                src="/assets/planets.webp"
                alt=""
                fill
                sizes={LAYER_SIZES}
                className="object-cover object-bottom"
              />
            </motion.div>

            <motion.div
              aria-hidden
              className="absolute inset-0 -z-20"
              style={{ y: mountain2Y }}
            >
              <Image
                src="/assets/mountain-2.webp"
                alt=""
                fill
                sizes={LAYER_SIZES}
                className="object-cover object-bottom"
              />
            </motion.div>

            <div aria-hidden className="absolute inset-0 -z-10">
              <Image
                src="/assets/mountain-1.webp"
                alt=""
                fill
                sizes={LAYER_SIZES}
                className="object-cover object-bottom"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
};
