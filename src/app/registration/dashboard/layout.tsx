
"use client";

import React, { useState, useEffect } from "react";
import ArewaLogo from "@/components/arewa-logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ApplicantSession {
  appId: string;
  email: string;
  fullName?: string; // FullName is now optional in the session from login
  admissionStatus?: string;
}

export default function RegistrationDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [applicantSession, setApplicantSession] = useState<ApplicantSession | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const sessionString = localStorage.getItem("currentApplicantSession");
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString) as ApplicantSession;
        // Only appId and email are strictly required from login session now
        if (session.appId && session.email) { 
          setApplicantSession(session);
        } else {
          throw new Error("Incomplete session data (appId or email missing).");
        }
      } catch (error) {
        console.error("Failed to parse applicant session:", error);
        localStorage.removeItem("currentApplicantSession");
        toast({ variant: "destructive", title: "Session Error", description: "Invalid session data. Please log in again." });
        router.push("/registration/login");
      }
    } else {
       // No session, individual page will handle redirect if needed
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
  
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href={applicantSession ? "/registration/dashboard" : "/"} className="flex items-center gap-2">
            <ArewaLogo className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary">SIAT-Institute, Zaria</span>
              <span className="text-xs text-muted-foreground">Applicant Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {applicantSession && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:flex items-center gap-1">
                   <UserCircle className="h-4 w-4"/> 
                   {applicantSession.fullName ? `${applicantSession.fullName} (ID: ${applicantSession.appId})` : `ID: ${applicantSession.appId}`}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            )}
            {!applicantSession && !isLoadingSession && (
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/registration/login"><LogOut className="mr-2 h-4 w-4" /> Login</Link>
                 </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Render children only if session is established enough for them */}
        {/* The page component will handle full session validation & redirection */}
        {children} 
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground border-t bg-background">
        &copy; {new Date().getFullYear()} Scholars Institute of Arts & Technology. All rights reserved.
      </footer>
    </div>
  );
}
    