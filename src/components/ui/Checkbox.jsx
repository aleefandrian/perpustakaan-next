import React from "react";

export default function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  id,
  ...props
}) {
  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[#4B465C] ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded text-[#6D28D9] border-[#E5E7EB] focus:ring-[#6D28D9]/20 cursor-pointer"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
