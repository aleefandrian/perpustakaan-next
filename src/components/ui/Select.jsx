import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  {
    className = "",
    error,
    disabled = false,
    children,
    ...props
  },
  ref
) {
  const baseSelectStyles =
    "w-full h-10 px-3.5 pr-10 text-sm bg-white border rounded-[9px] text-[#27233A] transition-all duration-150 focus:outline-none appearance-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer";

  const stateStyles = error
    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
    : "border-[#E5E7EB] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/15";

  return (
    <div className="relative w-full">
      <select
        ref={ref}
        disabled={disabled}
        className={`${baseSelectStyles} ${stateStyles} ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#858095]">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
});

export default Select;
