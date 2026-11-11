import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
