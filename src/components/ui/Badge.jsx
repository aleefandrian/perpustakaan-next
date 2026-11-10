import React from "react";

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors";

  const sizeStyles = {
    xs: "text-[10px] px-1.5 py-0.5",
    sm: "text-[11px] px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
    counter: "w-4 h-4 text-[10px] font-bold p-0",
  };

  const variantStyles = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    success:
      "bg-[#E8F8F0] text-[#16A34A] font-semibold border border-[#BFF0D4] rounded-full",
    purple:
      "bg-[#EBDFFF] text-[#6D28D9] font-semibold border border-[#DAC5FC] rounded-full",
    danger: "bg-[#DC2626] text-white font-bold rounded-full",
    shortcut:
      "bg-white text-[#858095] border border-[#E5E7EB] rounded font-medium shadow-xs",
  };

  const selectedSize = sizeStyles[size] || sizeStyles.sm;
  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`${baseStyles} ${selectedSize} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
