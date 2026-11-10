import AdminLayout from "@/components/layout/AdminLayout";

export const metadata = {
  title: "Libra - Library Management System",
  description: "Libra Bintang Harapan - Library Management System Admin",
};

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
