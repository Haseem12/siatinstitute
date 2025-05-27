
import InstructorLayout from "@/components/instructor-layout";
import type { ReactNode } from "react";

export default function InstructorDashboardLayout({ children }: { children: ReactNode }) {
  return <InstructorLayout>{children}</InstructorLayout>;
}
