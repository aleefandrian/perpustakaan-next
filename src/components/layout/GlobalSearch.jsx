"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Badge from "../ui/Badge";

export default function GlobalSearch({
  placeholder = "Cari katalog, ISBN, peminjam...",
  className = "",
  onSearch,
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Listen to Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Esc to blur
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
    inputRef.current?.focus();
  };

  return (
    <div
      className={`relative flex items-center w-full max-w-[320px] h-10 ${className}`}
    >
      <div className="absolute left-3 flex items-center pointer-events-none text-[#858095]">
        <Search className="w-4 h-4 text-[#858095]" strokeWidth={2} />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-16 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] text-[#27233A] placeholder-[#858095] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all duration-150"
      />

      <div className="absolute right-2.5 flex items-center gap-1">
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded text-[#858095] hover:text-[#4B465C] transition-colors"
            title="Hapus pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Badge
            variant="shortcut"
            size="xs"
            className="pointer-events-none font-medium px-1.5 py-0.5 text-[10.5px] text-[#858095]"
          >
            Ctrl K
          </Badge>
        )}
      </div>
    </div>
  );
}
