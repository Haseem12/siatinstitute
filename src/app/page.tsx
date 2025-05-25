
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  UserCircle,
  LogIn,
  GraduationCap,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"; // Added this import
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useToast } from "@/hooks/use-toast";
import ArewaLogo from "@/components/arewa-logo";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const carouselImages = [
  { src: "/assets/slider/slide-1.jpg", alt: "SIAT Campus Main Gate", title: "Welcome to SIAT", subtitle: "Excellence in Education, Innovation in Learning", dataAiHint: "campus building" },
  { src: "/assets/slider/slide-2.jpg", alt: "Modern Lecture Halls", title: "State-of-the-Art Facilities", subtitle: "Modern classrooms equipped with latest technology", dataAiHint: "lecture hall" },
  { src: "/assets/slider/slide-3.jpg", alt: "Computer Laboratory", title: "Advanced Computer Labs", subtitle: "Hands-on learning with cutting-edge equipment", dataAiHint: "computer lab" },
  { src: "/assets/slider/slide-4.jpg", alt: "Library Complex", title: "Comprehensive Library", subtitle: "Vast collection of books and digital resources", dataAiHint: "library interior" },
  { src: "/assets/slider/slide-5.jpg", alt: "Students in Class", title: "Interactive Learning", subtitle: "Engaging classroom experiences with expert faculty", dataAiHint: "students classroom" },
  { src: "/assets/slider/slide-6.jpg", alt: "Science Laboratory", title: "Well-Equipped Labs", subtitle: "Practical learning in modern laboratory settings", dataAiHint: "science lab" },
  { src: "/assets/slider/slide-7.jpg", alt: "Campus Cafeteria", title: "Student Life", subtitle: "Comfortable dining and social spaces", dataAiHint: "student cafeteria" },
  { src: "/assets/slider/slide-8.jpg", alt: "Sports Complex", title: "Sports & Recreation", subtitle: "Maintaining physical fitness and team spirit", dataAiHint: "sports field" },
  { src: "/assets/slider/slide-9.jpg", alt: "Graduation Ceremony", title: "Success Stories", subtitle: "Celebrating achievements of our graduates", dataAiHint: "graduation ceremony" },
  { src: "/assets/slider/slide-10.jpg", alt: "Workshop Training", title: "Practical Training", subtitle: "Skill development through hands-on workshops", dataAiHint: "workshop training" },
  { src: "/assets/slider/slide-11.jpg", alt: "Campus Garden", title: "Serene Environment", subtitle: "Beautiful landscaped campus for peaceful learning", dataAiHint: "campus garden" },
  { src: "/assets/slider/slide-12.jpg", alt: "Innovation Hub", title: "Innovation Center", subtitle: "Fostering creativity and entrepreneurship", dataAiHint: "innovation hub" },
];

const navLinks = [
  { href: "#auth-section", label: "Apply / Login" },
  { href: "#features", label: "Features" },
  { href: "#news", label: "News" },
  { href: "#contact", label: "Contact" },
];

export default function LandingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const studentId = (event.currentTarget.elements.namedItem("studentId") as HTMLInputElement)?.value;
    if (studentId) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${studentId}! Redirecting to dashboard...`,
      });
      localStorage.setItem('isLoggedIn', 'true');
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please enter your Student ID and Password.",
      });
    }
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArewaLogo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary hidden sm:inline">Arewa Scholar Hub</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="md:hidden">
             <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                            <ArewaLogo className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl text-primary">Arewa Scholar</span>
                        </Link>
                        <SheetClose asChild>
                             <Button variant="ghost" size="icon">
                                <X className="h-6 w-6" />
                                <span className="sr-only">Close menu</span>
                            </Button>
                        </SheetClose>
                    </div>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleScrollTo(e, link.href)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-primary/10"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section id="hero" className="relative w-full h-[50vh] md:h-[65vh] lg:h-[calc(100vh-4rem)] overflow-hidden scroll-mt-16">
        <Carousel
          opts={{ loop: true }}
          plugins={[autoplay.current]}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
          className="w-full h-full"
        >
          <CarouselContent className="h-full">
            {carouselImages.map((item, index) => (
              <CarouselItem key={index} className="min-w-full relative p-0">
                <Image
                  src={item.src || "/assets/slider/slide-1.jpg"}
                  alt={item.alt}
                  fill
                  className="object-cover w-full h-full brightness-50 group-hover:brightness-75 transition-all duration-300"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  data-ai-hint={item.dataAiHint}
                  onError={(e) => console.error("Image failed to load:", item.src, (e.target as HTMLImageElement).src)}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white p-4 max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 animate-fade-in-down">{item.title}</h1>
                    <p className="text-md md:text-xl mb-6 md:mb-8 animate-fade-in-up">{item.subtitle}</p>
                    <Button
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground animate-fade-in-up animation-delay-300"
                      onClick={(e) => handleScrollTo(e, '#auth-section')}
                    >
                      <LogIn className="mr-2 h-5 w-5" /> Get Started
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex text-white bg-black/30 hover:bg-black/50" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex text-white bg-black/30 hover:bg-black/50" />
        </Carousel>
      </section>

      {/* Auth & Apply Section */}
      <section id="auth-section" className="py-16 lg:py-24 bg-background scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* New Intake Card */}
            <div className="order-2 lg:order-1">
              <Card className="shadow-xl border-accent/20 h-full flex flex-col">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-accent">New to SIAT?</CardTitle>
                  <CardDescription>Begin your academic journey with us. Click below to start your application process.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                  <Button size="lg" asChild className="bg-accent hover:bg-accent/80 text-accent-foreground">
                    <Link href="/registration/new-intake">
                      <GraduationCap className="mr-2 h-5 w-5" /> Apply for New Intake
                    </Link>
                  </Button>
                </CardContent>
                 <CardContent>
                    <p className="text-center text-sm text-muted-foreground">
                        Explore our programs and discover your potential.
                    </p>
                </CardContent>
              </Card>
            </div>

            {/* Login Card */}
            <div className="order-1 lg:order-2">
              <Card className="shadow-xl border-primary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-primary">Student Portal Login</CardTitle>
                  <CardDescription>Welcome back! Access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="studentId" className="text-sm font-medium text-foreground">
                        Student ID
                      </label>
                      <Input
                        id="studentId"
                        name="studentId"
                        type="text"
                        placeholder="e.g., SIAT/001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-foreground">
                        Password
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login to Portal
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Forgot your password?{" "}
                      <Link href="#contact" onClick={(e) => handleScrollTo(e, '#contact')} className="text-primary hover:underline">
                        Contact support
                      </Link>
                      .
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose SIAT Section */}
      <section id="features" className="py-16 lg:py-24 bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">Why Choose SIAT?</h2>
            <p className="mt-2 text-lg text-muted-foreground">Discover the advantages of studying with us.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: "Quality Education", desc: "Curriculum designed for excellence and practical knowledge.", dataAiHint: "open book" },
              { icon: UserCircle, title: "Experienced Lecturers", desc: "Learn from seasoned professionals and academics.", dataAiHint: "teacher silhouette" },
              { icon: GraduationCap, title: "Conducive Environment", desc: "Serene and well-equipped campus for optimal learning.", dataAiHint: "campus building" },
              { icon: CheckSquare, title: "Skill Acquisition", desc: "Focus on hands-on skills and entrepreneurial development.", dataAiHint: "gears tools" },
            ].map((feature, index) => (
              <Card key={index} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow border-accent/10">
                <div className="mb-4 inline-flex items-center justify-center p-3 bg-accent/10 rounded-full">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
                <div className="mt-4 h-40 w-full relative overflow-hidden rounded-md">
                    <Image src={`https://placehold.co/300x200.png`} alt={feature.title} layout="fill" objectFit="cover" data-ai-hint={feature.dataAiHint} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Events Section */}
      <section id="news" className="py-16 lg:py-24 bg-background scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">Latest News & Events</h2>
            <p className="mt-2 text-lg text-muted-foreground">Stay updated with happenings at SIAT.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { date: "July 15, 2024", title: "Admission for 2024/2025 Session Now Open!", desc: "Prospective students can now apply for various programs...", dataAiHint: "students studying" },
              { date: "July 10, 2024", title: "SIAT Hosts Tech Innovation Summit", desc: "The institute successfully hosted a summit bringing together tech leaders...", dataAiHint: "conference presentation" },
              { date: "June 28, 2024", title: "New Library Wing Inaugurated", desc: "Our library has been expanded with a new wing, offering more resources...", dataAiHint: "library books" },
            ].map((newsItem, index) => (
              <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-primary/10 flex flex-col">
                <div className="h-48 w-full relative">
                    <Image src={`https://placehold.co/400x250.png`} alt={newsItem.title} layout="fill" objectFit="cover" data-ai-hint={newsItem.dataAiHint} />
                </div>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <p className="text-xs text-muted-foreground mb-1">{newsItem.date}</p>
                  <h3 className="text-lg font-semibold text-primary mb-2">{newsItem.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">{newsItem.desc}</p>
                  <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80 self-start mt-auto">
                    <Link href="#">
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" className="bg-muted/50 border-t border-border py-12 scroll-mt-16">
        <div className="container mx-auto px-4 text-center">
          <ArewaLogo className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-primary mb-2">Scholars Institute of Arts & Technology, Zaria</h3>
          <p className="text-muted-foreground mb-4">Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-sm text-muted-foreground mb-6">
            <a href="mailto:info@siat.edu.ng" className="hover:text-primary transition-colors">info@siat.edu.ng</a>
            <span className="hidden sm:inline">|</span>
            <a href="tel:+2348012345678" className="hover:text-primary transition-colors">+234 801 234 5678</a>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} SIAT. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

    