import React, { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    className = "",
    error,
    disabled = false,
    rows = 3,
    ...props
  },
  ref
) {
  const baseStyles =
    "w-full px-3.5 py-2.5 text-sm bg-white border rounded-[9px] text-[#27233A] placeholder-[#858095] transition-all duration-150 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed resize-y";

  const stateStyles = error
    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
    : "border-[#E5E7EB] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/15";

  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${className}`}
      {...props}
    />
  );
});

export default Textarea;
