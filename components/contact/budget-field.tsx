"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { SPRING_SNAPPY } from "@/animations/ui-animations";
import { BUDGET_OPTIONS } from "@/constants/contact-constants";
import { type BudgetFieldProps } from "@/types/contact-types";

export const BudgetField: FC<BudgetFieldProps> = ({ value, onChange }) => (
  <div>
    <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
      Project budget
    </p>
    <div className="flex flex-wrap gap-2">
      {BUDGET_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            // Clicking the active chip clears it — budget is optional, and
            // without this there is no way back to "prefer not to say".
            onClick={() => onChange(active ? "" : option.value)}
            aria-pressed={active}
            className={`group relative rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              active
                ? "border-coral/60 bg-white/[0.06] text-white"
                : "border-white/10 text-neutral-300 hover:border-white/30"
            }`}
          >
            {active && (
              <motion.span
                layoutId="budget-bg"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-coral/20 to-lavender/20"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);
