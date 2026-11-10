/**
 * Book helper utilities for Libra Library Management System
 */

export function getStockStatus(availableStock) {
  const stock = Number(availableStock) || 0;
  if (stock > 2) {
    return {
      label: "Tersedia",
      variant: "success",
      badgeClass: "bg-emerald-50 text-[#16A34A] border-emerald-200/60 font-semibold",
      dotClass: "bg-[#16A34A]",
    };
  }
  if (stock >= 1) {
    return {
      label: "Stok Menipis",
      variant: "warning",
      badgeClass: "bg-amber-50 text-[#D97706] border-amber-200/60 font-semibold",
      dotClass: "bg-[#D97706]",
    };
  }
  return {
    label: "Habis",
    variant: "danger",
    badgeClass: "bg-rose-50 text-[#DC2626] border-rose-200/60 font-semibold",
    dotClass: "bg-[#DC2626]",
  };
}

export function formatIsbn(isbn) {
  if (!isbn) return "-";
  const clean = String(isbn).replace(/[^0-9X]/gi, "");
  if (clean.length === 13) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 4)}-${clean.slice(4, 9)}-${clean.slice(9, 12)}-${clean.slice(12)}`;
  }
  if (clean.length === 10) {
    return `${clean.slice(0, 1)}-${clean.slice(1, 4)}-${clean.slice(4, 9)}-${clean.slice(9)}`;
  }
  return isbn;
}

export function getCoverUrl(coverId, size = "M") {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}
