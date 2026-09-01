import { type FC } from "react";
import { type AdminPanelProps } from "@/types/admin-types";

/** The centred card the admin area uses for every non-inbox state. */
export const AdminPanel: FC<Omit<AdminPanelProps, "title">> = ({
  children,
}) => (
  <main className="mx-auto w-full max-w-lg px-5 py-16 md:py-24">
    <div className="glass gradient-border p-6">{children}</div>
  </main>
);
