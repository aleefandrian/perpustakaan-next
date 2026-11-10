import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import EditBookClient from "./EditBookClient";

export const instant = false;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) return { title: "Edit Buku" };

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { title: true },
  });

  return {
    title: book ? `Edit: ${book.title} - Libra` : "Edit Buku",
  };
}

export default async function EditBookPage({ params }) {
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
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!book) {
    notFound();
  }

  const serializedBook = {
    ...book,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    activeLoansCount: book.loans.length,
    loans: [],
  };

  return <EditBookClient book={serializedBook} />;
}
