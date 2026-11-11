import React from "react";
import { Loader2 } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

/**
 * Standard Libra Table Component
 */
export function Table({ children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead className={`bg-[#F8F9FA] border-b border-[#E5E7EB] ${className}`}>
      {children}
    </thead>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-bold tracking-wider text-[#858095] uppercase select-none ${className}`}
    >
      {children}
    </th>
  );
}

export function TableBody({
  children,
  loading = false,
  empty = false,
  emptyMessage = "Tidak ada data ditemukan.",
  colSpan = 5,
  className = "",
}) {
  if (loading) {
    return (
      <tbody className={className}>
        <tr>
          <td colSpan={colSpan} className="py-16 text-center text-[#858095]">
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#6D28D9]" />
              <p className="text-xs">Memuat data...</p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (empty) {
    return (
      <tbody className={className}>
        <tr>
          <td colSpan={colSpan} className="py-12">
            <EmptyState message={emptyMessage} />
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className={`divide-y divide-[#E5E7EB] bg-white ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", onClick }) {
  const cursorStyle = onClick ? "cursor-pointer" : "";
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-[#FDFBFF] transition-colors duration-100 ${cursorStyle} ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-3.5 text-sm text-[#27233A] ${className}`}>
      {children}
    </td>
  );
}

export default Table;
