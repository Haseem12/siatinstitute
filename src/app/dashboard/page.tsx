
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { useState, useEffect, useCallback } from "react";

// Metadata can't be used directly in client components like this.
// For dynamic metadata, you'd use the generateMetadata function if this were a Server Component or layout.
// For a client page, set document.title in useEffect if needed, or handle metadata at a higher level.
// export const metadata: Metadata = {
//   title: "Dashboard - Arewa Scholar Hub",
// };

// Mock data for dashboard summaries
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

const sliderImages = [
  {
    src: "/assets/slider/slide-2.jpg",
    alt: "Zaria Campus View",
    title: "Welcome to ASIAT-Institute",
    subtitle: "Your gateway to academic excellence",
    dataAiHint: "campus view",
  },
  {
    src: "/assets/slider/slide-2.jpg", // Note: This src is a duplicate, consider using a unique image.
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

export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const AUTOPLAY_INTERVAL = 5000; // 5 seconds
  const USER_INTERACTION_PAUSE_DURATION = 10000; // 10 seconds

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
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(goToNext, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, goToNext]);

  const activeSlide = sliderImages[currentSlide];

  return (
    <div className="space-y-6">
      {/* Hero Section with Slider and Auth Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Slider Section */}
        <Card className="lg:col-span-2 shadow-lg border-primary/10 overflow-hidden">
          <div className="relative">
            <div className="relative h-64 md:h-80 overflow-hidden">
              {/* Image Container - uses key to force re-render on slide change for transitions if CSS supports it */}
              <div
                key={currentSlide} // Helps with triggering CSS animations if any are added for slide transitions
                className="w-full h-full"
              >
                <Image
                  src={activeSlide.src}
                  alt={activeSlide.alt}
                  width={1200}
                  height={320}
                  className="object-cover w-full h-full"
                  data-ai-hint={activeSlide.dataAiHint}
                  priority={currentSlide === 0} // Prioritize the first image
                  onError={(e) => console.error("Image failed to load:", activeSlide.src, e)}
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

            {/* Slider Navigation Dots */}
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
            <CardTitle className="text-xl font-bold text-primary">Student Quick Access</CardTitle>
            <CardDescription>Manage your academic journey</CardDescription>
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

      {/* Dashboard Summary Cards */}
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
