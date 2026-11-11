import React, { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    type = "text",
    className = "",
    error,
    icon: Icon,
    iconPosition = "left",
    disabled = false,
    ...props
  },
  ref
) {
  const baseInputStyles =
    "w-full h-10 px-3.5 text-sm bg-white border rounded-[9px] text-[#27233A] placeholder-[#858095] transition-all duration-150 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

  const stateStyles = error
    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
    : "border-[#E5E7EB] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/15";

  const paddingLeft = Icon && iconPosition === "left" ? "pl-10" : "";
  const paddingRight = Icon && iconPosition === "right" ? "pr-10" : "";

  return (
    <div className="relative w-full">
      {Icon && iconPosition === "left" && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#858095]">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseInputStyles} ${stateStyles} ${paddingLeft} ${paddingRight} ${className}`}
        {...props}
      />
      {Icon && iconPosition === "right" && (
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#858095]">
          <Icon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
});

export default Input;
