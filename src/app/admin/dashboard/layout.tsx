
import AdminLayout from "@/components/admin-layout";
import type { ReactNode } from "react";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
