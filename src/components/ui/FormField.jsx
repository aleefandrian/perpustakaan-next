import React from "react";

export default function FormField({
  label,
  required = false,
  error,
  hint,
  children,
  className = "",
  id,
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-[#4B465C] select-none"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-[#858095]">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}
