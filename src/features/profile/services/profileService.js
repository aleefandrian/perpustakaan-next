export async function fetchProfile() {
  const response = await fetch("/api/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data profil.");
  }
  return result;
}

export async function updateProfile(data) {
  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui data profil.");
  }
  return result;
}

export async function changePassword(data) {
  const response = await fetch("/api/profile/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui password.");
  }
  return result;
}
