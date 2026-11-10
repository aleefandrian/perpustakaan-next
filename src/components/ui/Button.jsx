import React from "react";

export default function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none";

  const sizeStyles = {
    sm: "h-8 px-3 text-xs rounded-[7px]",
    md: "h-9 px-4 text-sm rounded-[9px]",
    lg: "h-10 px-5 text-base rounded-[9px]",
    "icon-toggle": "w-9 h-9 rounded-[9px] shrink-0", // 36px toggle button
    "icon-navbar": "w-[38px] h-[38px] rounded-[9px] shrink-0", // 38px notification button
    icon: "w-9 h-9 rounded-[9px] shrink-0",
  };

  const variantStyles = {
    default:
      "bg-white border border-[#E5E7EB] text-[#4B465C] hover:bg-gray-50 active:bg-gray-100",
    primary:
      "bg-[#6D28D9] text-white hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-xs",
    ghost: "bg-transparent text-[#4B465C] hover:bg-[#F5F0FF] hover:text-[#6D28D9]",
    outline:
      "bg-white border border-[#E5E7EB] text-[#4B465C] hover:border-gray-300 hover:bg-gray-50",
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedVariant = variantStyles[variant] || variantStyles.default;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${selectedSize} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
