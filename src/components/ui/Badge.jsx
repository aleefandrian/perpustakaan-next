import React from "react";

/**
 * Standard Libra Badge Component
 * Variants: default, success, purple, danger, warning, info, shortcut
 * Sizes: xs, sm, md, counter
 */
export default function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors select-none";

  const sizeStyles = {
    xs: "text-[10px] px-2 py-0.5 rounded-full",
    sm: "text-[11px] px-2.5 py-0.5 rounded-full",
    md: "text-xs px-3 py-1 rounded-full",
    counter: "w-4 h-4 text-[10px] font-bold p-0 rounded-full",
  };

  const variantStyles = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-[#E8F8F0] text-[#16A34A] border border-[#BFF0D4]",
    purple: "bg-[#F5F0FF] text-[#6D28D9] border border-[#DAC5FC]",
    danger: "bg-red-50 text-red-600 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    shortcut: "bg-white text-[#858095] border border-[#E5E7EB] rounded font-medium shadow-xs",
  };

  const dotColors = {
    default: "bg-gray-400",
    success: "bg-emerald-500",
    purple: "bg-[#6D28D9]",
    danger: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
  };

  const selectedSize = sizeStyles[size] || sizeStyles.sm;
  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`${baseStyles} ${selectedSize} ${selectedVariant} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
            dotColors[variant] || "bg-current"
          }`}
        />
      )}
      {children}
    </span>
  );
}
