"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { type CardProps } from "@/types/portfolio-types";

export const Card: FC<CardProps> = ({ style, text, image, containerRef }) => {
  if (image && !text) {
    return (
      <motion.img
        className="absolute w-15 cursor-grab"
        src={image}
        alt=""
        style={style}
        whileHover={{ scale: 1.05 }}
        drag
        dragConstraints={containerRef}
        dragElastic={1}
      />
    );
  }

  return (
    <motion.div
      className="absolute px-1 py-4 text-xl text-center rounded-full ring ring-gray-700 font-extralight bg-storm w-[12rem] cursor-grab"
      style={style}
      whileHover={{ scale: 1.05 }}
      drag
      dragConstraints={containerRef}
      dragElastic={1}
    >
      {text}
    </motion.div>
  );
};
