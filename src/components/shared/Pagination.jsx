"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  className = "",
}) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination range with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none ${className}`}
      aria-label="Navigasi Halaman"
    >
      {/* Information text: "Menampilkan 1–20 dari 300 buku" */}
      <div className="text-[13px] text-[#858095]">
        Menampilkan{" "}
        <span className="font-semibold text-[#27233A]">
          {startItem}–{endItem}
        </span>{" "}
        dari <span className="font-semibold text-[#27233A]">{totalItems}</span>{" "}
        buku{" "}
        <span className="text-xs text-gray-400">({pageSize} per halaman)</span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman Sebelumnya"
          className="flex items-center gap-1 h-9 px-3 text-[13px] font-medium rounded-[9px] border border-[#E5E7EB] bg-white text-[#4B465C] hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center space-x-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-sm text-[#858095]"
                >
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
                className={`w-9 h-9 flex items-center justify-center text-[13px] font-medium rounded-[9px] transition-all duration-150 ${
                  isActive
                    ? "bg-[#6D28D9] text-white shadow-xs font-semibold ring-2 ring-[#6D28D9]/20"
                    : "bg-white border border-[#E5E7EB] text-[#4B465C] hover:bg-gray-50 hover:text-[#6D28D9]"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Halaman Selanjutnya"
          className="flex items-center gap-1 h-9 px-3 text-[13px] font-medium rounded-[9px] border border-[#E5E7EB] bg-white text-[#4B465C] hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
