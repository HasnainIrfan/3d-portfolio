"use client";

import {
  useMemo,
  useRef,
  useState,
  type FC,
  type FormEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Alert } from "@/components/portfolio/alert";
import { Particles } from "@/components/portfolio/particles";
import {
  CONTACT_EMAIL,
  HERO_LOCATION,
} from "@/constants/portfolio-constants";

interface ContactFormData {
  name: string;
  email: string;
  budget: string;
  message: string;
}

const initialFormState: ContactFormData = {
  name: "",
  email: "",
  budget: "",
  message: "",
};

const REQUIRED_FIELDS: Array<keyof ContactFormData> = [
  "name",
  "email",
  "message",
];

const FloatingField: FC<{
  id: keyof ContactFormData;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
  autoComplete?: string;
}> = ({ id, label, type = "text", value, onChange, required, textarea, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const floated = focused || filled;

  return (
    <div className="relative">
      <div
        className={`relative rounded-xl border transition-colors ${
          focused
            ? "border-coral/60 bg-white/[0.06]"
            : "border-white/10 bg-white/[0.03]"
        }`}
      >
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 transition-all duration-300 ${
            floated
              ? "top-1 text-[10px] tracking-[0.25em] uppercase text-neutral-400"
              : "top-1/2 -translate-y-1/2 text-sm text-neutral-500"
          } ${textarea && floated ? "translate-y-0" : ""}`}
        >
          {label}
        </label>
        {textarea ? (
          <textarea
            id={id}
            name={id}
            rows={5}
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="block w-full bg-transparent px-4 pt-7 pb-3 text-sm text-white placeholder-transparent focus:outline-none resize-none"
          />
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            required={required}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="block w-full bg-transparent px-4 pt-6 pb-2 text-sm text-white placeholder-transparent focus:outline-none"
          />
        )}
        <AnimatePresence>
          {focused && (
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ originX: 0 }}
              className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-coral to-lavender"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const BudgetField: FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  const options = [
    { v: "< $1k", label: "< $1k" },
    { v: "$1k–$5k", label: "$1k – $5k" },
    { v: "$5k–$15k", label: "$5k – $15k" },
    { v: "$15k+", label: "$15k+" },
    { v: "hourly", label: "Hourly" },
  ];
  return (
    <div>
      <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 mb-3">
        Project budget
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => onChange(active ? "" : o.v)}
              className={`group relative rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                active
                  ? "border-coral/60 text-white bg-white/[0.06]"
                  : "border-white/10 text-neutral-300 hover:border-white/30"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="budget-bg"
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-coral/20 to-lavender/20"
                />
              )}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const Contact: FC = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const [alertMessage, setAlertMessage] = useState("");

  const update = (key: keyof ContactFormData, v: string) =>
    setFormData((s) => ({ ...s, [key]: v }));

  const completion = useMemo(() => {
    const filled = REQUIRED_FIELDS.filter((k) => formData[k].trim()).length;
    return filled / REQUIRED_FIELDS.length;
  }, [formData]);
  const completionMV = useMotionValue(0);
  useMemo(() => completionMV.set(completion), [completion, completionMV]);
  const completionSpring = useSpring(completionMV, {
    stiffness: 100,
    damping: 18,
  });
  const completionPct = useTransform(completionSpring, (v) =>
    Math.round(v * 100)
  );

  const showAlertMessage = (type: "success" | "danger", message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const glow = useMotionTemplate`radial-gradient(600px circle at ${px}% ${py}%, rgba(234,72,132,0.15), transparent 40%)`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      setFormData(initialFormState);
      showAlertMessage("success", "Message sent — I'll reply within 24 hours.");
    } catch (error) {
      console.error(error);
      showAlertMessage(
        "danger",
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative c-space section-spacing overflow-hidden"
    >
      <Particles
        className="absolute inset-0 -z-10"
        quantity={120}
        ease={80}
        color="#ffffff"
        refresh
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/3 h-72 w-72 rounded-full bg-royal/15 blur-[140px]" />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-coral/15 blur-[140px]" />
      </div>

      {showAlert && <Alert type={alertType} text={alertMessage} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-5"
        >
          <p className="text-eyebrow">Let&apos;s Talk</p>
          <h2 className="text-heading mt-3">
            Have an idea? <br />
            <span className="text-gradient">Let&apos;s ship it.</span>
          </h2>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            Whether you&apos;re launching something new, scaling what you have,
            or rescuing a stuck project — drop me a line and I&apos;ll get
            back within 24 hours.
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="glass gradient-border flex items-center gap-4 p-4 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-coral/30 to-lavender/30 flex items-center justify-center text-lg">
                ✉
              </div>
              <div className="overflow-hidden">
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  Email
                </p>
                <p className="text-sm text-white truncate group-hover:text-coral transition-colors">
                  {CONTACT_EMAIL}
                </p>
              </div>
            </a>
            <div className="glass gradient-border flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-aqua/30 to-mint/30 flex items-center justify-center text-lg">
                ⌖
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  Based In
                </p>
                <p className="text-sm text-white">
                  {HERO_LOCATION} · Open to remote work worldwide
                </p>
              </div>
            </div>
            <div className="glass gradient-border flex items-center gap-4 p-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-royal/30 to-fuchsia/30 flex items-center justify-center text-lg">
                ⏱
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  Response Time
                </p>
                <p className="text-sm text-white">
                  Usually within 24 hours
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          ref={cardRef}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            px.set(((e.clientX - r.left) / r.width) * 100);
            py.set(((e.clientY - r.top) / r.height) * 100);
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-7 relative glass gradient-border p-7 md:p-10 overflow-hidden"
        >
          <motion.div
            aria-hidden
            style={{ backgroundImage: glow }}
            className="pointer-events-none absolute inset-0"
          />

          <div className="relative flex items-end justify-between mb-7 gap-6">
            <div>
              <p className="text-eyebrow">Place an order</p>
              <h3 className="text-xl md:text-2xl font-bold mt-1">
                Tell me about your project
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <motion.span className="text-[10px] tracking-[0.3em] uppercase text-neutral-400">
                <motion.span>{completionPct}</motion.span>%
              </motion.span>
              <div className="relative h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingField
                id="name"
                label="Your name"
                value={formData.name}
                onChange={(v) => update("name", v)}
                required
                autoComplete="name"
              />
              <FloatingField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(v) => update("email", v)}
                required
                autoComplete="email"
              />
            </div>
            <BudgetField
              value={formData.budget}
              onChange={(v) => update("budget", v)}
            />
            <FloatingField
              id="message"
              label="What are you building?"
              value={formData.message}
              onChange={(v) => update("message", v)}
              required
              textarea
            />

            <motion.button
              type="submit"
              disabled={isLoading || completion < 1}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full overflow-hidden rounded-full px-6 py-4 text-sm md:text-base font-medium text-white transition-opacity ${
                isLoading || completion < 1
                  ? "opacity-60 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              style={{
                background:
                  "linear-gradient(135deg, #5c33cc 0%, #ea4884 100%)",
                boxShadow: "0 10px 30px -10px rgba(234, 72, 132, 0.55)",
              }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="inline-flex items-center gap-3"
                  >
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Sending...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="inline-flex items-center gap-2"
                  >
                    Send message
                    <span aria-hidden>→</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <p className="text-center text-[11px] text-neutral-500">
              By sending, you agree to be contacted at the email provided.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
