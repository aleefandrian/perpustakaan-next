import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import BookDetail from "@/features/books/components/BookDetail";

export const instant = false;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) return { title: "Buku Tidak Ditemukan" };

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { title: true, author: true },
  });

  if (!book) return { title: "Buku Tidak Ditemukan" };
  return {
    title: `${book.title} - Libra Library Management`,
    description: `Detail buku ${book.title} oleh ${book.author}`,
  };
}

export default async function BookDetailPage({ params }) {
  const { id } = await params;
  const bookId = parseInt(id, 10);

  if (isNaN(bookId)) {
    notFound();
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      category: true,
      loans: {
        orderBy: { borrowDate: "desc" },
        take: 10,
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Format dates for client component
  const serializedBook = {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    loans: book.loans.map((loan) => ({
      ...loan,
      borrowDate: loan.borrowDate.toISOString(),
      dueDate: loan.dueDate.toISOString(),
      returnDate: loan.returnDate ? loan.returnDate.toISOString() : null,
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
    })),
  };

  return <BookDetail book={serializedBook} />;
}
