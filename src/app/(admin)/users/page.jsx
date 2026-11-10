import UserManagement from "@/features/users/components/UserManagement";

export const metadata = {
  title: "Data User - Libra Library Management",
  description: "Kelola akun administrator dan siswa perpustakaan.",
};

export default function UsersPage() {
  return <UserManagement />;
}
