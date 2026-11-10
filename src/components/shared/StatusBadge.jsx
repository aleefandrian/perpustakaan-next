import React from "react";
import { getStockStatus } from "@/utils/bookUtils";

export default function StatusBadge({ availableStock, className = "" }) {
  const status = getStockStatus(availableStock);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border font-semibold select-none ${status.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dotClass}`} />
      <span>{status.label}</span>
    </span>
  );
}
