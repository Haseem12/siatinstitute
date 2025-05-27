
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UsersRound,
  LibrarySquare,
  Settings,
  BellRing,
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
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: LayoutDashboard, tooltip: "Admin Overview" },
  { href: "/admin/dashboard/manage-users", label: "Manage Users", icon: UsersRound, tooltip: "Manage Students & Staff" },
  { href: "/admin/dashboard/manage-courses", label: "Manage Courses", icon: LibrarySquare, tooltip: "Manage Academic Courses" },
  { href: "/admin/dashboard/announcements", label: "Post Announcements", icon: BellRing, tooltip: "Create & Manage Announcements" },
  { href: "/admin/dashboard/settings", label: "System Settings", icon: Settings, tooltip: "Configure Portal Settings" },
];

export default function AdminNavLinks() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href));
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
