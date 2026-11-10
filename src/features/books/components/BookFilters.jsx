"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, Filter, ArrowUpDown, X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function BookFilters({
  search = "",
  category = "all",
  status = "all",
  sort = "id-asc",
  categories = [],
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onSortChange,
  onResetFilters,
  totalResults = 0,
}) {
  const [prevSearch, setPrevSearch] = useState(search);
  const [localSearch, setLocalSearch] = useState(search);

  // Sync internal state with external search prop during render
  if (search !== prevSearch) {
    setPrevSearch(search);
    setLocalSearch(search);
  }

  // Debounced search trigger (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch, search, onSearchChange]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    status !== "all" ||
    sort !== "id-asc";

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-2xs space-y-3.5">
      {/* Top Row: Search Input + Sorting */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Cari judul buku, ISBN, pengarang, penerbit..."
            className="w-full h-10 pl-10 pr-9 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[13px] text-[#27233A] placeholder-[#858095] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onSearchChange("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#858095] hover:text-[#27233A]"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 md:w-56">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858095] pointer-events-none">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Urutkan data buku"
              className="w-full h-10 pl-9 pr-8 bg-[#F8F9FC] border border-[#E5E7EB] rounded-[9px] text-[12.5px] font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all cursor-pointer appearance-none"
            >
              <option value="id-asc">Urutkan: Default (ID)</option>
              <option value="title-asc">Judul: A - Z</option>
              <option value="title-desc">Judul: Z - A</option>
              <option value="year-desc">Tahun Terbit: Terbaru</option>
              <option value="year-asc">Tahun Terbit: Terlama</option>
              <option value="stock-desc">Stok: Terbanyak</option>
              <option value="stock-asc">Stok: Paling Sedikit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Row: Category & Status Filters + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#E5E7EB]/60">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#858095] uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span>Filter:</span>
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter berdasarkan Kategori"
            className="h-8.5 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat._count?.books ?? 0})
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter berdasarkan Status Stok"
            className="h-8.5 px-3 bg-[#F8F9FC] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#4B465C] hover:border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6D28D9] cursor-pointer"
          >
            <option value="all">Semua Status Stok</option>
            <option value="tersedia">Tersedia (&gt; 2)</option>
            <option value="menipis">Stok Menipis (1 - 2)</option>
            <option value="habis">Habis (0)</option>
          </select>

          {/* Reset Filter Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 h-8.5 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Counter hint */}
        <div className="text-xs text-[#858095]">
          Ditemukan <span className="font-semibold text-[#27233A]">{totalResults}</span> buku
        </div>
      </div>
    </div>
  );
}
