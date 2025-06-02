
"use client";

import React, { useState, useEffect } from "react";
import ArewaLogo from "@/components/arewa-logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react"; // Added Loader2
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function RegistrationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [applicantAppId, setApplicantAppId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);


  useEffect(() => {
    setIsClient(true);
    const sessionString = localStorage.getItem("currentApplicantSession");
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString) as { appId: string; email: string };
        setApplicantAppId(session.appId);
      } catch (error) {
        console.error("Failed to parse applicant session:", error);
        localStorage.removeItem("currentApplicantSession"); // Clear corrupted session
        toast({ variant: "destructive", title: "Session Error", description: "Invalid session data. Please log in again." });
        router.push("/registration/login");
      }
    } else {
      // If no session, redirect to login
      // router.push("/registration/login"); // Let page handle this to avoid layout shift if already redirecting
    }
    setIsLoadingSession(false);
  }, [router, toast]);

  const handleLogout = () => {
    localStorage.removeItem("currentApplicantSession");
    toast({
      title: "Logged Out",
      description: "You have been logged out of the applicant portal.",
    });
    router.push("/registration/login");
  };

  if (isLoadingSession || !isClient) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <p>Loading Applicant Portal...</p>
        </div>
    );
  }
  // If still no applicantAppId after loading, it means the page component should handle redirect.
  // This layout won't render children if no session, but the page itself will redirect if check fails.

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/registration/dashboard" className="flex items-center gap-2">
            <ArewaLogo className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">SIAT-Institute, Zaria</span>
              <span className="text-xs text-muted-foreground">Applicant Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {applicantAppId && <span className="text-sm text-muted-foreground hidden sm:inline">App ID: {applicantAppId}</span>}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {applicantAppId ? children : null} {/* Render children only if appId is present */}
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground border-t bg-background">
        &copy; {new Date().getFullYear()} Scholars Institute of Arts & Technology. All rights reserved.
      </footer>
    </div>
  );
}

    