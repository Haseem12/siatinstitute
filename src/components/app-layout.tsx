"use client";
import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import ArewaLogo from "@/components/arewa-logo";
import NavLinks from "@/components/nav-links";
import UserNav from "@/components/user-nav";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    setIsClient(true);
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [router]);


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/");
  };

  if (!isClient) {
    // To prevent hydration mismatch issues or rendering protected content prematurely
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading portal...
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true} open={true} onOpenChange={() => {}}>
      <Sidebar variant="inset" side="left" collapsible="icon">
        <SidebarHeader className="p-4 items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <ArewaLogo className="h-8 w-8 text-sidebar-primary" />
            <span className="font-semibold text-lg text-sidebar-primary group-data-[collapsible=icon]:hidden">Arewa Scholar</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <NavLinks />
        </SidebarContent>
        <SidebarFooter className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 sm:p-6 bg-background">
          {children}
        </main>
        <footer className="border-t p-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Scholars Institute of Arts & Technology, Zaria.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
