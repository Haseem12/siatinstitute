
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Megaphone,
  UserCircle,
  FileText,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next"; // Keep for reference, but not directly used in client component for title
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { NewIntakeApplicationData } from "@/types";

// Slider images and mock data remain the same as before
const sliderImages = [
  {
    src: "/assets/slider/slide-2.jpg",
    alt: "Zaria Campus View",
    title: "Welcome to SIAT-Institute",
    subtitle: "Your gateway to academic excellence",
    dataAiHint: "campus view",
  },
  {
    src: "/assets/slider/slide-2.jpg",
    alt: "Students Learning",
    title: "Empowering Future Leaders",
    subtitle: "Quality education for tomorrow's innovators",
    dataAiHint: "students learning",
  },
  {
    src: "/assets/slider/slide-3.jpg",
    alt: "Campus Library",
    title: "Resources at Your Fingertips",
    subtitle: "Access world-class learning materials",
    dataAiHint: "library campus",
  },
];

const upcomingClasses = [
  { id: "1", course: "CSC101: Intro to Computing", time: "Today, 10:00 AM", location: "Hall A" },
  { id: "2", course: "MAT101: Algebra", time: "Tomorrow, 02:00 PM", location: "Room 102" },
];

const pendingAssignments = [
  { id: "1", title: "CSC101 - Algorithm Design", dueDate: "3 days left" },
  { id: "2", title: "ENG102 - Essay on Culture", dueDate: "1 week left" },
];

const recentAnnouncements = [
  { id: "1", title: "Mid-semester Break Announced", date: "2 days ago" },
  { id: "2", title: "Library New Opening Hours", date: "5 days ago" },
];

// Helper function to map raw API data (similar to admin/registration dashboards)
// This should ideally be in a shared util file, but copied for this specific change.
const mapRawApplicantData = (app: any): NewIntakeApplicationData => {
    let fullNameConstructed = app.full_name || "";
    if (!fullNameConstructed && app.surname && app.firstname) {
        fullNameConstructed = `${app.surname} ${app.firstname}${app.othername ? ' ' + app.othername : ''}`.trim();
    }
    return {
        applicationId: String(app.application_id || app.applicationId || ""),
        fullName: fullNameConstructed,
        email: app.email || "",
        phoneNumber: app.phone_number || app.phoneNumber || "",
        dateOfBirth: app.date_of_birth ? new Date(app.date_of_birth) : undefined,
        gender: app.gender || "",
        address: app.address || "",
        city: app.city || "",
        stateOfOrigin: app.state_of_origin || app.stateOfOrigin || "",
        nationality: app.nationality || "",
        photograph: app.photograph_name ? { name: app.photograph_name, type: app.photograph_type, size: parseInt(String(app.photograph_size || 0), 10) } : (app.photograph || null),
        nextOfKinName: app.next_of_kin_name || app.nextOfKinName || "",
        nextOfKinPhone: app.next_of_kin_phone || app.nextOfKinPhone || "",
        nextOfKinRelationship: app.next_of_kin_relationship || app.nextOfKinRelationship || "",
        preferredProgram: app.preferred_program || app.preferredProgram || "",
        preferredCampus: app.preferred_campus || app.preferredCampus || "",
        entryMode: app.entry_mode || app.entryMode || "",
        admissionStatus: app.admission_status || app.admissionStatus || "Not Submitted",
        rejectionReason: app.rejection_reason || app.rejectionReason,
        admission_number: app.admission_number || undefined,
        submitted_at: app.submitted_at ? new Date(app.submitted_at) : undefined,
        
        oLevels: (app.oLevels || []).map((ol: any) => ({
            id: String(ol.id || crypto.randomUUID()),
            examType: ol.exam_type || ol.examType || "", 
            examYear: ol.exam_year || ol.examYear || "", 
            examNumber: ol.exam_number || ol.examNumber || "",
            subjects: (ol.subjects || []).map((s: any) => ({ 
                id: String(s.id || crypto.randomUUID()),
                subject: s.subject_name || s.subject || "",
                grade: s.grade || ""
            })),
            file: ol.certificate_file_name ? { name: ol.certificate_file_name, type: ol.certificate_file_type, size: parseInt(String(ol.certificate_file_size || 0), 10) } : (ol.file || null),
        })),
        
        aLevels: (app.aLevels || []).map((al: any) => ({
            id: String(al.id || crypto.randomUUID()),
            type: al.qualification_type || al.type || "", 
            institution: al.institution || "",
            courseOfStudy: al.course_of_study || al.courseOfStudy || "", 
            gradeOrClass: al.grade_or_class || al.gradeOrClass || "",   
            yearAwarded: al.year_awarded || al.yearAwarded || "",     
            file: al.certificate_file_name ? { name: al.certificate_file_name, type: al.certificate_file_type, size: parseInt(String(al.certificate_file_size || 0), 10) } : (al.file || null),
        })),
        
        experiences: (app.experiences || []).map((exp: any) => ({
            id: String(exp.id || crypto.randomUUID()),
            organization: exp.organization || "",
            role: exp.role || "",
            startDate: exp.start_date || exp.startDate || "",
            endDate: exp.end_date || exp.endDate || "",
            file: exp.document_file_name ? { name: exp.document_file_name, type: exp.document_file_type, size: parseInt(String(exp.document_file_size || 0), 10) } : (exp.file || null),
        })),
    };
};


export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { toast } = useToast();
  const [applicantData, setApplicantData] = useState<NewIntakeApplicationData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);


  const AUTOPLAY_INTERVAL = 5000; 
  const USER_INTERACTION_PAUSE_DURATION = 10000; 

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  }, []);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    pauseAutoplay();
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    pauseAutoplay();
  };

  const pauseAutoplay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), USER_INTERACTION_PAUSE_DURATION);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = "Dashboard - Arewa Scholar Hub";
    }

    const fetchProfileData = async (appId: string) => {
      setIsLoadingProfile(true);
      try {
        const response = await fetch(`https://sajfoods.net/api/siat/get-applicant-data.php?appId=${appId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch profile data. Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          const mappedData = mapRawApplicantData(result.data);
          setApplicantData(mappedData);
        } else {
          throw new Error(result.message || "Failed to retrieve valid profile data.");
        }
      } catch (error: any) {
        console.error("Error fetching student profile data:", error);
        toast({
          variant: "destructive",
          title: "Profile Load Error",
          description: error.message || "Could not load your profile information.",
        });
        setApplicantData(null); // Ensure it's reset on error
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const sessionString = localStorage.getItem("currentApplicantSession");
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        if (session.appId) {
          fetchProfileData(session.appId);
        } else {
          setIsLoadingProfile(false); // No App ID in session
          setApplicantData(null);
        }
      } catch (error) {
        console.error("Error parsing session for dashboard:", error);
        setIsLoadingProfile(false);
        setApplicantData(null);
      }
    } else {
      setIsLoadingProfile(false); // No session
      setApplicantData(null);
      // Potentially redirect or show guest view if session is strictly required for this page
      // For now, it will just not show personalized info.
    }
  }, [toast]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(goToNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, goToNext]);

  const activeSlide = sliderImages[currentSlide];

  return (
    <div className="space-y-6">
      {/* Hero Section with Slider */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg border-primary/10 overflow-hidden">
          <div className="relative">
            <div className="relative h-64 md:h-80 overflow-hidden">
              <div key={currentSlide} className="w-full h-full">
                <Image
                  src={activeSlide.src}
                  alt={activeSlide.alt}
                  width={1200}
                  height={320}
                  className="object-cover w-full h-full"
                  data-ai-hint={activeSlide.dataAiHint}
                  priority={currentSlide === 0}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-start p-6 md:p-8">
                <div className="text-white max-w-lg">
                  <h1 className="text-2xl md:text-4xl font-bold mb-2">{activeSlide.title}</h1>
                  <p className="text-sm md:text-lg text-gray-200 mb-4">{activeSlide.subtitle}</p>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Explore Resources
                  </Button>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? "bg-white scale-110" : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide ? "true" : "false"}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Student Quick Access Container */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="text-center">
            {isLoadingProfile ? (
              <div className="flex flex-col items-center justify-center h-full py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <CardDescription>Loading your details...</CardDescription>
              </div>
            ) : applicantData && applicantData.fullName ? (
              <>
                <UserCircle className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-xl font-bold text-primary">
                  Welcome, {applicantData.fullName.split(' ')[0]}!
                </CardTitle>
                <CardDescription>Manage your academic journey</CardDescription>
              </>
            ) : (
               <>
                <UserCircle className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-xl font-bold text-primary">Student Quick Access</CardTitle>
                <CardDescription>Manage your academic journey</CardDescription>
               </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/dashboard/profile">
                <UserCircle className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/results">
                <GraduationCap className="mr-2 h-4 w-4" />
                View My Results
              </Link>
            </Button>
             <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/dashboard/assignments">
                <FileText className="mr-2 h-4 w-4" />
                Assignments
              </Link>
            </Button>
            <div className="pt-4 border-t border-muted-foreground/20">
              <p className="text-xs text-center text-muted-foreground">
                Need help?{" "}
                <Link href="#contact-support" className="text-primary hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Summary Cards (remain with mock data for now) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Upcoming Classes</CardTitle>
            <CalendarCheck className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            {upcomingClasses.length > 0 ? (
              <ul className="space-y-2">
                {upcomingClasses.map((item) => (
                  <li key={item.id} className="text-sm border-l-2 border-accent pl-2">
                    <p className="font-medium">{item.course}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.time} - {item.location}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming classes today or tomorrow.</p>
            )}
            <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80 mt-2">
              <Link href="/dashboard/timetable">
                View Full Timetable <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Pending Assignments</CardTitle>
            <BookOpen className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            {pendingAssignments.length > 0 ? (
              <ul className="space-y-2">
                {pendingAssignments.map((item) => (
                  <li key={item.id} className="text-sm border-l-2 border-accent pl-2">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-destructive">{item.dueDate}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No pending assignments. Great job!</p>
            )}
            <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80 mt-2">
              <Link href="/dashboard/assignments">
                Manage Assignments <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Recent Announcements</CardTitle>
            <Megaphone className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length > 0 ? (
              <ul className="space-y-2">
                {recentAnnouncements.map((item) => (
                  <li key={item.id} className="text-sm border-l-2 border-accent pl-2">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent announcements.</p>
            )}
            <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80 mt-2">
              <Link href="/dashboard/announcements">
                View All Announcements <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
