import React from "react";

export default function LoadingState({
  message = "Memuat data...",
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="w-8 h-8 border-3 border-[#E5E7EB] border-t-[#6D28D9] rounded-full animate-spin mb-3" />
      <p className="text-xs text-[#858095] font-medium">{message}</p>
    </div>
  );
}
