"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export default function BookCover({
  src,
  alt = "Sampul Buku",
  className = "",
  size = "md", // sm (36x48), md (45x62), lg (120x160)
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dimensionStyles = {
    sm: "w-9 h-12 min-w-[36px]",
    md: "w-[45px] h-[62px] min-w-[45px]",
    lg: "w-28 h-40 min-w-[112px]",
  };

  const selectedDim = dimensionStyles[size] || dimensionStyles.md;

  if (!src || hasError) {
    return (
      <div
        className={`${selectedDim} bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200/80 rounded-md flex flex-col items-center justify-center p-1 text-center shadow-2xs shrink-0 ${className}`}
        title={alt}
      >
        <BookOpen className="w-4 h-4 text-[#6D28D9]/70" />
        <span className="text-[8px] font-semibold text-[#6D28D9] mt-0.5 leading-tight line-clamp-1">
          {alt?.slice(0, 10)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative ${selectedDim} rounded-md overflow-hidden bg-gray-100 border border-[#E5E7EB] shrink-0 shadow-2xs group ${className}`}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
        </div>
      )}

      {/* Actual Cover Image */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50px, 120px"
        unoptimized
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`object-cover rounded-md transition-transform duration-200 group-hover:scale-105 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
