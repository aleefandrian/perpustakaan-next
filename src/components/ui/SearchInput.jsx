import React from "react";
import Input from "@/components/ui/Input";
import { Search } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Cari data...",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon={Search}
      iconPosition="left"
      disabled={disabled}
      className={className}
      {...props}
    />
  );
}
