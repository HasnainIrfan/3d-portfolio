import { type Metadata } from "next";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin · Hasnain Irfan",
  // This area lists visitors' names, email addresses and IPs. Keeping it out of
  // search indexes is the bare minimum on top of the login itself.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen w-full bg-primary">{children}</div>;
}
