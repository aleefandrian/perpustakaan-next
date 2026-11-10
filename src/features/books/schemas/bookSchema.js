/**
 * Book Validation Schema and Validator
 */

export function validateBookInput(data) {
  const errors = {};

  if (!data.title || typeof data.title !== "string" || data.title.trim().length < 2) {
    errors.title = "Judul buku wajib diisi (minimal 2 karakter).";
  }

  if (!data.author || typeof data.author !== "string" || data.author.trim().length < 2) {
    errors.author = "Nama pengarang wajib diisi (minimal 2 karakter).";
  }

  if (!data.coverUrl || typeof data.coverUrl !== "string" || !data.coverUrl.trim().startsWith("http")) {
    errors.coverUrl = "URL sampul buku valid wajib diisi (format http/https).";
  }

  const totalStock = Number(data.totalStock);
  if (isNaN(totalStock) || totalStock < 0) {
    errors.totalStock = "Stok total harus berupa angka minimal 0.";
  }

  const availableStock = Number(data.availableStock);
  if (isNaN(availableStock) || availableStock < 0) {
    errors.availableStock = "Stok tersedia harus berupa angka minimal 0.";
  } else if (!isNaN(totalStock) && availableStock > totalStock) {
    errors.availableStock = "Stok tersedia tidak boleh melebihi total stok.";
  }

  if (data.publishedYear) {
    const year = Number(data.publishedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1400 || year > currentYear + 1) {
      errors.publishedYear = `Tahun terbit harus antara 1400 dan ${currentYear + 1}.`;
    }
  }

  if (data.isbn) {
    const cleanIsbn = String(data.isbn).replace(/[^0-9X]/gi, "");
    if (cleanIsbn.length > 0 && cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
      errors.isbn = "Format ISBN harus 10 atau 13 digit angka.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
