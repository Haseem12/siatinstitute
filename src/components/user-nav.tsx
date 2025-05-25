"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@/types"; // Renamed to avoid conflict

// Mock user data
const mockUser: UserType = {
  id: "1",
  name: "Aisha Bello",
  email: "aisha.bello@example.com",
  studentId: "SIAT/001",
  avatarUrl: "https://placehold.co/100x100.png",
};


export default function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<UserType | null>(null);

  React.useEffect(() => {
    // In a real app, fetch user data or get from context/store
    setUser(mockUser);
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/'); // Redirect to login if not logged in
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

  if (!user) {
    return null; // Or a loading skeleton
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  return (
    <div className="flex items-center gap-4">
       <Button variant="ghost" size="icon" className="rounded-full text-foreground/70 hover:text-foreground">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-primary/50">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="student avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/dashboard/profile" passHref>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/profile#settings" passHref>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
