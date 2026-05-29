"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { type AlertProps } from "@/types/portfolio-types";

const alertVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -50, scale: 0.8 },
};

export const Alert: FC<AlertProps> = ({ type, text }) => {
  const isDanger = type === "danger";

  return (
    <motion.div
      className="fixed z-50 flex items-center justify-center bottom-5 right-5"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={alertVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div
        className={`p-2 ${
          isDanger ? "bg-red-800" : "bg-royal"
        } items-center text-indigo-100 leading-none lg:rounded-full flex lg:inline-flex rounded-md p-5`}
      >
        <p
          className={`flex rounded-full ${
            isDanger ? "bg-red-500" : "bg-lavender"
          } uppercase px-2 py-1 text-xs font-semibold mr-3`}
        >
          {isDanger ? "Failed" : "Success"}
        </p>
        <p className="mr-2 text-left">{text}</p>
      </div>
    </motion.div>
  );
};
