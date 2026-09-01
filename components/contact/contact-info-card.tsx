import { type FC } from "react";
import { type ContactInfoCardProps } from "@/types/contact-types";

export const ContactInfoCard: FC<ContactInfoCardProps> = ({
  icon,
  label,
  value,
  href,
  gradient,
}) => {
  const body = (
    <>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-lg ${gradient}`}
      >
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          {label}
        </p>
        <p
          className={`truncate text-sm text-white ${
            href ? "transition-colors group-hover:text-coral" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </>
  );

  const className = "glass gradient-border flex items-center gap-4 p-4";

  return href ? (
    <a
      href={href}
      className={`${className} group transition-colors hover:bg-white/[0.06]`}
    >
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
};
