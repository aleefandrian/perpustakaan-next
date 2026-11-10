import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);

    if (isNaN(catId)) {
      return NextResponse.json(
        { success: false, message: "ID kategori tidak valid." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: catId },
      include: {
        _count: { select: { books: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const catId = parseInt(id, 10);

    if (isNaN(catId)) {
      return NextResponse.json(
        { success: false, message: "ID kategori tidak valid." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { id: catId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const name = body.name?.trim();
    const description = body.description !== undefined ? body.description?.trim() || null : existing.description;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Nama kategori maksimal 100 karakter." },
        { status: 400 }
      );
    }

    // Check duplicate name on other category
    const duplicate = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        NOT: { id: catId },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: `Kategori dengan nama "${name}" sudah digunakan oleh data lain.` },
        { status: 400 }
      );
    }

    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const updated = await prisma.category.update({
      where: { id: catId },
      data: {
        name,
        slug,
        description,
      },
      include: {
        _count: { select: { books: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui kategori." },
      { status }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const catId = parseInt(id, 10);

    if (isNaN(catId)) {
      return NextResponse.json(
        { success: false, message: "ID kategori tidak valid." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: catId },
      include: {
        _count: { select: { books: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    // Restriction check: prevent deletion if books exist!
    if (category._count.books > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${category._count.books} buku dalam katalog perpustakaan.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: catId },
    });

    return NextResponse.json({
      success: true,
      message: `Kategori "${category.name}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus kategori." },
      { status }
    );
  }
}
