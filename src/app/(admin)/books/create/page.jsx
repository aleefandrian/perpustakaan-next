"use client";

import BookForm from "@/features/books/components/BookForm";
import { createBook } from "@/features/books/services/bookService";

export default function CreateBookPage() {
  const handleCreate = async (formData) => {
    return await createBook(formData);
  };

  return <BookForm isEdit={false} onSubmit={handleCreate} />;
}
