
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  LogIn,
  UserPlus,
  BookOpen,
  Users,
  Building,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Newspaper,
  CalendarDays,
  Briefcase, 
  Lightbulb, 
  ShieldCheck, 
  School,
  ArrowRight, // Added ArrowRight here
} from "lucide-react";
import ArewaLogo from "@/components/arewa-logo";
import { useToast } from "@/hooks/use-toast";
// import type { Metadata } from "next"; // Metadata export from client component has no effect.

// export const metadata: Metadata = {
//   title: "Welcome to Arewa Scholar Hub - SIAT Zaria",
//   description: "Official portal for Scholars Institute of Arts & Technology, Zaria. Login, apply, and explore our programs.",
// };

const carouselImages = Array.from({ length: 12 }, (_, i) => ({
  src: `/assets/slider/slide-${i + 1}.jpg`,
  alt: `Campus image ${i + 1}`,
  title: i === 0 ? "Welcome to Arewa Scholar Hub" : i === 1 ? "Empowering Future Leaders" : "Excellence in Education",
  subtitle: i === 0 ? "Your gateway to academic excellence and innovation." : i === 1 ? "Nurturing talent for a brighter tomorrow." : "Discover your potential with us.",
  dataAiHint: i === 0 ? "university campus" : i === 1 ? "students learning" : "modern building"
}));

const navLinks = [
  { href: "#login-apply", label: "Apply / Login" },
  { href: "#why-siat", label: "Why SIAT?" },
  { href: "#news", label: "News" },
  { href: "#contact-us", label: "Contact Us" },
];

const TopNav = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ArewaLogo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg text-primary hidden sm:inline-block">
            Arewa Scholar Hub
          </span>
        </Link>
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-6">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <ArewaLogo className="h-7 w-7 text-primary" />
                  <span className="text-primary">Arewa Scholar</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};


const HeroCarousel = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <section id="hero" className="relative w-full h-[calc(100vh-4rem)] min-h-[500px] max-h-[700px] md:max-h-[800px] overflow-hidden scroll-mt-16">
      <Carousel
        plugins={[plugin.current]}
        className="w-full h-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {carouselImages.map((item, index) => (
            <CarouselItem key={index} className="relative w-full h-full">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                priority={index === 0}
                className="object-cover brightness-50"
                data-ai-hint={item.dataAiHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => console.error("Image failed to load:", item.src, e)}
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                <div className="text-white max-w-2xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-fade-in-down">
                    {item.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 text-gray-200 animate-fade-in-up">
                    {item.subtitle}
                  </p>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3 animate-fade-in-up animation-delay-300" asChild>
                    <Link href="#login-apply">Get Started</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex text-white bg-black/30 hover:bg-black/50 border-none h-12 w-12" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex text-white bg-black/30 hover:bg-black/50 border-none h-12 w-12" />
      </Carousel>
    </section>
  );
};


export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    if (!studentId.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please enter both Student ID and Password.",
      });
      setIsLoggingIn(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (studentId && password) { 
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true'); 
      }
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid Student ID or Password.",
      });
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav />
      <main className="flex-grow">
        <HeroCarousel />

        <section id="login-apply" className="py-16 lg:py-24 bg-muted/30 scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Card className="shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <LogIn className="h-8 w-8 text-primary" />
                    <CardTitle className="text-3xl font-bold text-primary">Student Portal Login</CardTitle>
                  </div>
                  <CardDescription className="text-md">Welcome back! Access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="e.g., SIAT/001"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="text-base"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-lg py-3" disabled={isLoggingIn}>
                      {isLoggingIn ? "Logging in..." : "Login to Portal"}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="text-sm">
                  <p className="text-muted-foreground">
                    Forgot your password? <Link href="#contact-us" className="text-primary hover:underline">Contact support</Link>.
                  </p>
                </CardFooter>
              </Card>

              <div className="text-center lg:text-left p-8 bg-card rounded-lg shadow-xl">
                 <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                    <UserPlus className="h-8 w-8 text-accent" />
                    <h2 className="text-3xl font-bold text-accent">New to SIAT?</h2>
                  </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Begin your academic journey with us. Apply for our diverse programs.
                </p>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-3" asChild>
                  <Link href="/registration/new-intake">
                    Apply for New Intake
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="why-siat" className="py-16 lg:py-24 scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary">Why Choose SIAT?</h2>
              <p className="text-lg text-muted-foreground mt-2">Discover the advantages of studying with us.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Quality Education", description: "We offer a curriculum designed for excellence and practical knowledge.", icon: ShieldCheck, dataAiHint: "education shield" },
                { title: "Experienced Lecturers", description: "Learn from seasoned professionals and academics in their fields.", icon: Users, dataAiHint: "lecturers team" },
                { title: "Conducive Environment", description: "A serene and well-equipped campus for optimal learning.", icon: School, dataAiHint: "campus building" },
                { title: "Skill Acquisition", description: "Focus on hands-on skills and entrepreneurial development.", icon: Lightbulb, dataAiHint: "skill idea" },
              ].map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                      <feature.icon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                     <Image src={`https://placehold.co/600x400.png`} alt={feature.title} width={600} height={400} className="rounded-md mt-4 object-cover aspect-video" data-ai-hint={feature.dataAiHint} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="py-16 lg:py-24 bg-muted/30 scroll-mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-bold text-primary">Latest News & Events</h2>
               <p className="text-lg text-muted-foreground mt-2">Stay updated with happenings at SIAT.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { date: "July 15, 2024", title: "Admission for 2024/2025 Session Now Open!", excerpt: "Prospective students can now apply for various programs for the upcoming academic session...", imageHint: "admission open" },
                { date: "July 10, 2024", title: "SIAT Hosts Tech Innovation Summit", excerpt: "The institute successfully hosted a summit bringing together tech leaders and innovators...", imageHint: "tech summit" },
                { date: "June 28, 2024", title: "New Library Wing Inaugurated", excerpt: "Our library has been expanded with a new wing, offering more resources and study spaces...", imageHint: "library interior" },
              ].map((newsItem, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <Image src={`https://placehold.co/600x400.png`} alt={newsItem.title} width={600} height={300} className="w-full object-cover aspect-[16/9]" data-ai-hint={newsItem.imageHint} />
                  <CardHeader>
                    <p className="text-xs text-muted-foreground">{newsItem.date}</p>
                    <CardTitle className="text-xl text-primary mt-1">{newsItem.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">{newsItem.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" asChild className="text-accent p-0">
                      <Link href="#">Read More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <footer id="contact-us" className="bg-primary text-primary-foreground py-12 scroll-mt-16">
        <div className="container mx-auto px-4 text-center">
          <ArewaLogo className="h-16 w-16 mx-auto mb-4 text-accent" />
          <h3 className="text-2xl font-semibold mb-2">Scholars Institute of Arts & Technology, Zaria</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-x-6 gap-y-2 text-muted-foreground text-sm mb-6">
            <span className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-accent" /> Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</span>
            <span className="hidden sm:inline">|</span>
            <a href="mailto:info@siat.edu.ng" className="flex items-center hover:text-accent transition-colors"><Mail className="h-4 w-4 mr-2 text-accent" /> info@siat.edu.ng</a>
            <span className="hidden sm:inline">|</span>
            <a href="tel:+2348012345678" className="flex items-center hover:text-accent transition-colors"><Phone className="h-4 w-4 mr-2 text-accent" /> +234 801 234 5678</a>
          </div>
          <p className="text-xs text-muted-foreground/80">&copy; {new Date().getFullYear()} SIAT. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

    