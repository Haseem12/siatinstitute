
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardPlus,
  FileText,
  GraduationCap,
  BellRing,
  UserCircle,
  School, // Added School icon
  type LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  tooltip: string;
}

// Example: Assuming instructor has a few courses, IDs would be dynamic
const mockInstructorCourseId = "CSC101";

const navLinks: NavLink[] = [
  { href: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard, tooltip: "Instructor Overview" },
  // A real app would dynamically list courses or have a generic "My Courses" link
  { href: `/instructor/dashboard/my-courses/${mockInstructorCourseId}`, label: "Manage Course", icon: BookOpen, tooltip: "Manage Course Content" },
  { href: "/instructor/dashboard/create-assignment", label: "Create Assignment", icon: ClipboardPlus, tooltip: "Create New Assignments" },
  { href: "/instructor/dashboard/view-submissions", label: "View Submissions", icon: FileText, tooltip: "Review Student Submissions" },
  { href: "/instructor/dashboard/gradebook", label: "Gradebook", icon: GraduationCap, tooltip: "Manage Student Grades" },
  { href: "/instructor/dashboard/my-learning", label: "My Learning", icon: School, tooltip: "Courses you are taking" }, // New Link
  { href: "/instructor/dashboard/announcements", label: "Post Announcement", icon: BellRing, tooltip: "Post to Students" },
  { href: "/instructor/dashboard/profile", label: "Profile", icon: UserCircle, tooltip: "Your Profile" },
];

export default function InstructorNavLinks() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navLinks.map((link) => {
        // More specific active check for dynamic routes if needed
        const isActive = pathname === link.href || (link.href !== "/instructor/dashboard" && pathname.startsWith(link.href.split('[')[0]));
        return (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={link.tooltip}
                className={cn(
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <a>
                  <link.icon />
                  <span>{link.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
