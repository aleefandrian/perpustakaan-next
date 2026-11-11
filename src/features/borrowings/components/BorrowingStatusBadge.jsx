import React from "react";
import { Clock, CheckCircle2, XCircle, BookmarkCheck, AlertTriangle } from "lucide-react";

/**
 * Reusable badge for borrowing requests and active borrowings
 */
export default function BorrowingStatusBadge({ status, size = "md" }) {
  const normalized = (status || "").toUpperCase();

  const configs = {
    PENDING: {
      label: "Menunggu Persetujuan",
      icon: Clock,
      className: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
    APPROVED: {
      label: "Disetujui",
      icon: CheckCircle2,
      className: "bg-[#F5F0FF] text-[#6D28D9] border-purple-200",
    },
    REJECTED: {
      label: "Ditolak",
      icon: XCircle,
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    AKTIF: {
      label: "Aktif",
      icon: BookmarkCheck,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    TERLAMBAT: {
      label: "Terlambat",
      icon: AlertTriangle,
      className: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
    },
    RETURNED: {
      label: "Dikembalikan",
      icon: CheckCircle2,
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };

  const current = configs[normalized] || {
    label: status || "-",
    icon: Clock,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

  const Icon = current.icon;
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border shadow-2xs whitespace-nowrap ${current.className} ${sizeClasses}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span>{current.label}</span>
    </span>
  );
}
