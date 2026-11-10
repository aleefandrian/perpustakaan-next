import BookManagement from "@/features/books/components/BookManagement";

export const metadata = {
  title: "Daftar Buku - Libra Library Management",
  description: "Kelola koleksi buku, informasi bibliografi, dan ketersediaan stok perpustakaan.",
};

export default function BooksPage() {
  return <BookManagement />;
}
