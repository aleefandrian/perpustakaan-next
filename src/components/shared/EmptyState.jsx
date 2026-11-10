import React from "react";
import { BookX, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function EmptyState({
  title = "Buku Tidak Ditemukan",
  description = "Tidak ada koleksi buku yang sesuai dengan kriteria pencarian atau filter yang Anda pilih.",
  onReset,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-[#E5E7EB] ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-[#F5F0FF] text-[#6D28D9] flex items-center justify-center mb-4 shadow-xs">
        <BookX className="w-7 h-7" strokeWidth={1.8} />
      </div>
      <h3 className="text-base font-bold text-[#27233A] mb-1">{title}</h3>
      <p className="text-sm text-[#858095] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="flex items-center gap-2 text-[13px] border-[#E5E7EB] text-[#4B465C] hover:border-[#6D28D9] hover:text-[#6D28D9]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Semua Filter</span>
        </Button>
      )}
    </div>
  );
}
