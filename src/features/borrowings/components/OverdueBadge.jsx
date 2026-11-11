import React from "react";
import { AlertCircle, Clock } from "lucide-react";

/**
 * Reusable badge indicating remaining days or overdue status with late fine
 */
export default function OverdueBadge({ isOverdue, overdueDays, daysRemaining, fineAmount }) {
  if (isOverdue) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>Terlambat {overdueDays} hari</span>
      </div>
    );
  }

  if (daysRemaining === 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Batas Hari Ini</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
      <span>Sisa {daysRemaining} hari</span>
    </div>
  );
}
