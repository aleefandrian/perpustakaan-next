import React from "react";

export default function Avatar({
  src,
  alt = "User Avatar",
  name,
  size = "md",
  className = "",
}) {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const getInitials = (str) => {
    if (!str) return "U";
    return str
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover shrink-0 border border-[#E5E7EB] ${selectedSize} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-[#EBDFFF] text-[#6D28D9] font-bold flex items-center justify-center shrink-0 border border-[#DAC5FC] select-none ${selectedSize} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
