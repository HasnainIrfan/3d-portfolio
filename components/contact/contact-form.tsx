"use client";

import { useEffect, type FC } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { revealProps } from "@/animations/scroll-animations";
import { SPRING_SOFT, swapLabel } from "@/animations/ui-animations";
import { useContactForm } from "@/hooks/use-contact-form";
import { Alert } from "@/components/portfolio/alert";
import { BudgetField } from "./budget-field";
import { FloatingField } from "./floating-field";

export const ContactForm: FC = () => {
  const { formData, update, completion, isLoading, alert, handleSubmit } =
    useContactForm();

  const completionValue = useMotionValue(completion);
  useEffect(() => completionValue.set(completion), [completion, completionValue]);
  const completionSpring = useSpring(completionValue, SPRING_SOFT);
  const completionPercent = useTransform(completionSpring, (value) =>
    Math.round(value * 100)
  );

  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(600px circle at ${pointerX}% ${pointerY}%, rgba(234,72,132,0.15), transparent 40%)`;

  const disabled = isLoading || completion < 1;

  return (
    <>
      {alert.visible && <Alert type={alert.type} text={alert.message} />}

      <motion.div
        {...revealProps(0.1)}
        onMouseMove={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          pointerX.set(((event.clientX - bounds.left) / bounds.width) * 100);
          pointerY.set(((event.clientY - bounds.top) / bounds.height) * 100);
        }}
        className="glass gradient-border relative overflow-hidden p-7 md:p-10 lg:col-span-7"
      >
        <motion.div
          aria-hidden
          style={{ backgroundImage: glow }}
          className="pointer-events-none absolute inset-0"
        />

        <div className="relative mb-7 flex items-end justify-between gap-6">
          <div>
            <p className="text-eyebrow">Place an order</p>
            <h3 className="mt-1 text-xl font-bold md:text-2xl">
              Tell me about your project
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              <motion.span>{completionPercent}</motion.span>%
            </span>
            <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/5">
              <motion.div
                style={{
                  scaleX: completionSpring,
                  transformOrigin: "0% 50%",
                }}
                className="absolute inset-0 bg-gradient-to-r from-coral to-lavender"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingField
              id="name"
              label="Your name"
              value={formData.name}
              onChange={(value) => update("name", value)}
              required
              autoComplete="name"
            />
            <FloatingField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => update("email", value)}
              required
              autoComplete="email"
            />
          </div>

          <BudgetField
            value={formData.budget}
            onChange={(value) => update("budget", value)}
          />

          <FloatingField
            id="message"
            label="What are you building?"
            value={formData.message}
            onChange={(value) => update("message", value)}
            required
            textarea
          />

          <motion.button
            type="submit"
            disabled={disabled}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full overflow-hidden rounded-full px-6 py-4 text-sm font-medium text-white transition-opacity md:text-base ${
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
            style={{
              background: "linear-gradient(135deg, #5c33cc 0%, #ea4884 100%)",
              boxShadow: "0 10px 30px -10px rgba(234, 72, 132, 0.55)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isLoading ? "loading" : "idle"}
                variants={swapLabel}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="inline-flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send message
                    <span aria-hidden>→</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <p className="text-center text-[11px] text-neutral-500">
            By sending, you agree to be contacted at the email provided.
          </p>
        </form>
      </motion.div>
    </>
  );
};
