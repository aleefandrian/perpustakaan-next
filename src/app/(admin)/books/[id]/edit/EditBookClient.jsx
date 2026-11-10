"use client";

import BookForm from "@/features/books/components/BookForm";
import { updateBook } from "@/features/books/services/bookService";

export default function EditBookClient({ book }) {
  const handleUpdate = async (formData) => {
    return await updateBook(book.id, formData);
  };

  return <BookForm initialData={book} isEdit={true} onSubmit={handleUpdate} />;
}
