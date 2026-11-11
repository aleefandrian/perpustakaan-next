"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Standard Libra Modal Component
 * Sizes: sm (max-w-md), md (max-w-lg), lg (max-w-2xl), xl (max-w-4xl)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  footer,
  className = "",
  showClose = true,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-10 overflow-hidden flex flex-col max-h-[90vh] my-auto ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] shrink-0 bg-white">
            <div>
              {title && (
                <h3 className="text-base font-bold text-[#27233A]">{title}</h3>
              )}
              {subtitle && (
                <p className="text-xs text-[#858095] mt-0.5">{subtitle}</p>
              )}
            </div>
            {showClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-[#858095] hover:text-[#27233A] -mr-2"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-[#E5E7EB] shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
