"use client";

import { type FC } from "react";
import { motion } from "motion/react";
import { revealProps } from "@/animations/scroll-animations";
import {
  CONTACT_EMAIL,
  HERO_LOCATION,
} from "@/constants/portfolio-constants";
import { ContactInfoCard } from "./contact-info-card";

export const ContactDetails: FC = () => (
  <motion.div {...revealProps()} className="lg:col-span-5">
    <p className="text-eyebrow">Let&apos;s Talk</p>
    <h2 className="text-heading mt-3">
      Have an idea? <br />
      <span className="text-gradient">Let&apos;s ship it.</span>
    </h2>
    <p className="mt-4 leading-relaxed text-neutral-400">
      Whether you&apos;re launching something new, scaling what you have, or
      rescuing a stuck project, drop me a line and I&apos;ll get back within 24
      hours.
    </p>

    <div className="mt-8 space-y-4">
      <ContactInfoCard
        icon="✉"
        label="Email"
        value={CONTACT_EMAIL}
        href={`mailto:${CONTACT_EMAIL}`}
        gradient="from-coral/30 to-lavender/30"
      />
      <ContactInfoCard
        icon="⌖"
        label="Based In"
        value={`${HERO_LOCATION} · Open to remote work worldwide`}
        gradient="from-aqua/30 to-mint/30"
      />
      <ContactInfoCard
        icon="⏱"
        label="Response Time"
        value="Usually within 24 hours"
        gradient="from-royal/30 to-fuchsia/30"
      />
    </div>
  </motion.div>
);
