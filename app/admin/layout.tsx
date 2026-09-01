import { type Metadata } from "next";
import { type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin · Hasnain Irfan",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen w-full bg-primary">{children}</div>;
}
