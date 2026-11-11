import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Standard Libra Button Component
 * Variants: primary, secondary, outline, ghost, danger, success, default
 * Sizes: sm, md, lg, icon, icon-toggle, icon-navbar
 */
export default function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs rounded-[7px] gap-1.5",
    md: "h-9 px-4 text-sm rounded-[9px] gap-2",
    lg: "h-10 px-5 text-base rounded-[9px] gap-2.5",
    icon: "w-9 h-9 p-0 rounded-[9px] shrink-0",
    "icon-sm": "w-8 h-8 p-0 rounded-[7px] shrink-0",
    "icon-toggle": "w-9 h-9 p-0 rounded-[9px] shrink-0",
    "icon-navbar": "w-[38px] h-[38px] p-0 rounded-[9px] shrink-0",
  };

  const variantStyles = {
    primary:
      "bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-xs",
    secondary:
      "bg-[#F5F0FF] text-[#6D28D9] hover:bg-[#EBDFFF] active:bg-[#DAC5FC]",
    default:
      "bg-white border border-[#E5E7EB] text-[#4B465C] hover:bg-gray-50 active:bg-gray-100",
    outline:
      "bg-white border border-[#E5E7EB] text-[#4B465C] hover:border-gray-300 hover:bg-gray-50",
    ghost:
      "bg-transparent text-[#4B465C] hover:bg-[#F5F0FF] hover:text-[#6D28D9]",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-xs",
    "danger-outline":
      "bg-white border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs",
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedVariant = variantStyles[variant] || variantStyles.default;
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${selectedSize} ${selectedVariant} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon className="w-4 h-4 shrink-0" />
          )}
          {children}
          {Icon && iconPosition === "right" && (
            <Icon className="w-4 h-4 shrink-0" />
          )}
        </>
      )}
    </button>
  );
}
