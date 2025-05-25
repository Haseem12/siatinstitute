
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  GraduationCap,
  Megaphone,
  UserCircle,
  ClipboardList, // Added for Course Registration
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

const navLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tooltip: "Dashboard" },
  { href: "/dashboard/timetable", label: "Timetable", icon: CalendarDays, tooltip: "Timetable & Calendar" },
  { href: "/dashboard/assignments", label: "Assignments", icon: FileText, tooltip: "Assignments & Grades" },
  { href: "/dashboard/course-registration", label: "Course Registration", icon: ClipboardList, tooltip: "Register Courses" },
  { href: "/dashboard/results", label: "Results", icon: GraduationCap, tooltip: "Academic Results" },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone, tooltip: "Notifications & News" },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle, tooltip: "Profile Settings" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
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
