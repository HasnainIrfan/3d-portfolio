import { type FC } from "react";
import { type StatCardProps } from "@/types/admin-types";

export const StatCard: FC<StatCardProps> = ({ label, value }) => (
  <div className="glass p-5">
    <p className="text-eyebrow">{label}</p>
    <p className="mt-2 text-3xl font-extrabold text-gradient">{value}</p>
  </div>
);
