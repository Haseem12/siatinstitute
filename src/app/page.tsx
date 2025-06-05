
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  UserCircle,
  LogIn,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  Newspaper,
  Mail,
  Loader2,
  Menu
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import ArewaLogo from "@/components/arewa-logo"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { mockUsers as initialMockUsers } from "@/lib/mock-users";
import type { User, NewIntakeApplicationData } from "@/types";


const carouselImages = [
  { src: "/assets/slider/slide-1.jpg", alt: "SIAT Campus Main Gate", title: "Welcome to SIAT", subtitle: "Excellence in Education, Innovation in Learning", dataAiHint: "campus gate"},
  { src: "/assets/slider/slide-2.jpg", alt: "Modern Lecture Halls", title: "State-of-the-Art Facilities", subtitle: "Modern classrooms equipped with latest technology", dataAiHint: "lecture hall"},
  { src: "/assets/slider/slide-3.jpg", alt: "Computer Laboratory", title: "Advanced Computer Labs", subtitle: "Hands-on learning with cutting-edge equipment", dataAiHint: "computer lab"},
  { src: "/assets/slider/slide-4.jpg", alt: "Library Complex", title: "Comprehensive Library", subtitle: "Vast collection of books and digital resources", dataAiHint: "library building"},
  { src: "/assets/slider/slide-5.jpg", alt: "Students in Class", title: "Interactive Learning", subtitle: "Engaging classroom experiences with expert faculty", dataAiHint: "students classroom"},
  { src: "/assets/slider/slide-6.jpg", alt: "Science Laboratory", title: "Well-Equipped Labs", subtitle: "Practical learning in modern laboratory settings", dataAiHint: "science lab"},
  { src: "/assets/slider/slide-7.jpg", alt: "Campus Cafeteria", title: "Student Life", subtitle: "Comfortable dining and social spaces", dataAiHint: "campus cafeteria"},
  { src: "/assets/slider/slide-8.jpg", alt: "Sports Complex", title: "Sports & Recreation", subtitle: "Maintaining physical fitness and team spirit", dataAiHint: "sports field"},
  { src: "/assets/slider/slide-9.jpg", alt: "Graduation Ceremony", title: "Success Stories", subtitle: "Celebrating achievements of our graduates", dataAiHint: "graduation event"},
  { src: "/assets/slider/slide-10.jpg", alt: "Workshop Training", title: "Practical Training", subtitle: "Skill development through hands-on workshops", dataAiHint: "workshop students"},
  { src: "/assets/slider/slide-11.jpg", alt: "Campus Garden", title: "Serene Environment", subtitle: "Beautiful landscaped campus for peaceful learning", dataAiHint: "campus garden"},
  { src: "/assets/slider/slide-12.jpg", alt: "Innovation Hub", title: "Innovation Center", subtitle: "Fostering creativity and entrepreneurship", dataAiHint: "innovation hub"},
];

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loginInput, setLoginInput] = useState("") // Can be email or App ID
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // 1. Check against local mock users (admin, instructor, predefined students)
    let foundUser: User | undefined = initialMockUsers.find(
      (user) => user.email.toLowerCase() === loginInput.toLowerCase() && user.password === loginPassword
    );

    if (!foundUser && typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem("mockAddedUsers");
      const addedUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      foundUser = addedUsers.find(
        (user) => user.email.toLowerCase() === loginInput.toLowerCase() && user.password === loginPassword
      );
    }

    if (foundUser) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', foundUser.email);
        localStorage.setItem('userRole', foundUser.role || 'student');
         // For admin/instructor/mock students, we might not have an AppID in this flow.
        // If they are also applicants, their AppID session might be set separately.
        // For now, only set AppID if the user is a student from mock data with an ID that resembles an AppID.
        if(foundUser.role === 'student' && foundUser.studentId?.startsWith('SIAT-APP-')) {
            localStorage.setItem('currentApplicantSession', JSON.stringify({ appId: foundUser.studentId, email: foundUser.email, fullName: foundUser.name, admissionStatus: "Not Submitted" }));
        }
      }
      toast({ title: `${(foundUser.role || 'User').charAt(0).toUpperCase() + (foundUser.role || 'User').slice(1)} Login Successful`, description: "Redirecting..." });
      switch (foundUser.role) {
        case "admin": router.push("/admin/dashboard"); break;
        case "instructor": router.push("/instructor/dashboard"); break;
        default: router.push("/dashboard"); break; // Default student dashboard
      }
      setIsLoggingIn(false);
      return;
    }

    // 2. If not found in mock users, and input looks like an App ID, try fetching from API
    //    This part is a SIMULATION and doesn't validate password against API.
    if (loginInput.toUpperCase().includes("SIAT-APP-")) {
      const appIdToFetch = loginInput;
      try {
        const response = await fetch(`https://sajfoods.net/api/siat/get-applicant-data.php?appId=${appIdToFetch}`);
        if (!response.ok) {
          const errorText = await response.text();
          let errorMsg = `Could not verify Application ID (${response.status}).`;
          try { const errorJson = JSON.parse(errorText); errorMsg = errorJson.message || errorMsg; } catch (parseErr) { /* ignore */ }
          toast({ variant: "destructive", title: "Login Failed", description: errorMsg });
          setIsLoggingIn(false);
          return;
        }
        const result = await response.json();
        if (result.success && result.data && result.data.application_id === appIdToFetch) {
          // API returned data for the App ID, simulate successful student login
          const applicantData = result.data as NewIntakeApplicationData; // Assuming types are aligned
          if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', applicantData.email); // Use email from API
            localStorage.setItem('userRole', 'student'); // Assume student role for API-verified App IDs
            localStorage.setItem('currentApplicantSession', JSON.stringify({ 
              appId: applicantData.applicationId, 
              email: applicantData.email,
              fullName: applicantData.fullName, // If API returns it
              admissionStatus: applicantData.admissionStatus || "Not Submitted"
            }));
          }
          toast({ title: "Applicant Login Successful", description: "Redirecting to your application dashboard..." });
          router.push("/registration/dashboard"); // Redirect to applicant specific dashboard
        } else {
          toast({ variant: "destructive", title: "Login Failed", description: "Application ID not found or invalid." });
        }
      } catch (apiError) {
        console.error("API login simulation error:", apiError);
        toast({ variant: "destructive", title: "Login Error", description: "Could not connect to verify Application ID. Please try again." });
      }
      setIsLoggingIn(false);
      return;
    }

    // 3. If all checks fail
    if (!loginInput || !loginPassword) {
      toast({ variant: "destructive", title: "Login Failed", description: "Please enter your credentials." });
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid credentials or Application ID not found." });
    }
    setIsLoggingIn(false);
  };

  const navItems = [
    { href: "#hero", label: "Home" },
    { href: "#auth-section", label: "Portal Login" },
    { href: "#features", label: "Why SIAT?" },
    { href: "#news", label: "News & Events" },
    { href: "#contact", label: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArewaLogo className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg text-primary">SIAT-Institute, Zaria</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="text-foreground/80 hover:text-primary transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <div className="flex flex-col space-y-4 p-4">
                <SheetClose asChild>
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <ArewaLogo className="h-8 w-8 text-primary" />
                    <span className="font-bold text-lg text-primary">SIAT-Institute</span>
                  </Link>
                </SheetClose>
                  {navItems.map((item) => (
                     <SheetClose asChild key={item.label}>
                        <Link href={item.href} className="text-lg text-foreground/80 hover:text-primary transition-colors py-2">
                        {item.label}
                        </Link>
                     </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section id="hero" className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden scroll-mt-16">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
          className="w-full h-full"
        >
          <CarouselContent>
            {carouselImages.map((item, index) => (
              <CarouselItem key={index} className="relative w-full h-full">
                <Image
                  src={item.src || "/assets/slider/slide-1.jpg"}
                  alt={item.alt}
                  fill
                  style={{ objectFit: "cover" }}
                  className="brightness-75"
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-ai-hint={item.dataAiHint}
                  onError={(e) => console.error("Image failed to load:", item.src, (e.target as HTMLImageElement).src)}
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center md:justify-start text-center md:text-left">
                  <div className="container px-4 md:px-6 max-w-2xl text-white">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                      {item.title}
                    </h1>
                    <p className="mt-4 text-lg text-gray-200 sm:text-xl md:text-2xl leading-relaxed">
                      {item.subtitle}
                    </p>
                    <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-4">
                      <Link href="#auth-section">
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Get Started
                      </Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50" />
        </Carousel>
      </section>
      
      {/* Student Portal Login & New Intake */}
      <section id="auth-section" className="container mx-auto px-4 pt-24 lg:pt-32 pb-16 lg:pb-24 scroll-mt-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">New to SIAT?</CardTitle>
              <CardDescription>
                Embark on your academic journey with us. Apply for admission to our various programs. 
                Explore a diverse range of courses in a supportive and innovative learning environment. 
                We are committed to nurturing talent and fostering future leaders.
                <br/><br/>
                <strong>The Admission Process:</strong>
                <ol className="list-decimal list-inside text-left text-sm mt-2 space-y-1">
                    <li>Ensure you meet the basic entry requirements for your desired program.</li>
                    <li>Click the "Apply for Admission" button below.</li>
                    <li>You will be directed to our multi-step application form.</li>
                    <li>Complete your bio-data, academic qualifications, and program choices.</li>
                    <li>Upload scanned copies of your relevant documents (e.g., SSCE, Diploma certificates).</li>
                    <li>Preview your application details carefully before final submission.</li>
                    <li>Upon successful submission, you will receive an application ID and further instructions via email.</li>
                </ol>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-8 text-base">
                <Link href="/registration/pre-register">
                  Apply for Admission <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Student Portal Login</CardTitle>
              <CardDescription>Welcome back! Access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="loginInput" className="text-sm font-medium text-foreground">
                      Application ID or Email Address
                    </label>
                    <Input
                      id="loginInput"
                      type="text"
                      placeholder="e.g., SIAT-APP-XXXXXX or student@siat.edu.ng"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="passwordLogin" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      id="passwordLogin"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base" disabled={isLoggingIn}>
                    {isLoggingIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                    {isLoggingIn ? "Logging in..." : "Login to Portal"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Forgot your password?{" "}
                    <Link href="#contact" className="text-primary hover:underline">
                      Contact support
                    </Link>
                    .
                  </p>
                </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Choose SIAT */}
      <section id="features" className="bg-muted/30 py-16 lg:py-24 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary">Why Choose SIAT?</h2>
            <p className="mt-2 text-lg text-muted-foreground">Discover the advantages of studying with us.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BookOpen, title: "Quality Education", desc: "Curriculum designed for excellence and practical knowledge.", dataAiHint: "teacher student" },
              { icon: UserCircle, title: "Experienced Lecturers", desc: "Learn from seasoned professionals and academics.", dataAiHint: "lecturer portrait" },
              { icon: GraduationCap, title: "Conducive Environment", desc: "A serene and well-equipped campus for optimal learning.", dataAiHint: "campus garden" },
              { icon: CheckSquare, title: "Skill Acquisition", desc: "Focus on hands-on skills and entrepreneurial development.", dataAiHint: "students workshop" },
            ].map(feature => (
              <Card key={feature.title} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-accent/50">
                    <Image src={`https://placehold.co/100x100.png`} alt={feature.title} width={100} height={100} className="object-cover" data-ai-hint={feature.dataAiHint} />
                </div>
                <CardTitle className="text-xl mb-2 text-primary">{feature.title}</CardTitle>
                <CardDescription>{feature.desc}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Events */}
      <section id="news" className="container mx-auto px-4 py-16 lg:py-24 scroll-mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary">Latest News & Events</h2>
          <p className="mt-2 text-lg text-muted-foreground">Stay updated with happenings at SIAT.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {id: "news1", date: "July 15, 2024", title: "Admission for 2024/2025 Session Now Open!", excerpt: "Prospective students can now apply for various programs for the upcoming academic session...", image: "https://placehold.co/600x400.png", dataAiHint: "students admission"},
            {id: "news2", date: "July 10, 2024", title: "SIAT Hosts Tech Innovation Summit", excerpt: "The institute successfully hosted a summit bringing together tech leaders and innovators...", image: "https://placehold.co/600x400.png", dataAiHint: "tech summit"},
            {id: "news3", date: "June 28, 2024", title: "New Library Wing Inaugurated", excerpt: "Our library has been expanded with a new wing, offering more resources and study spaces...", image: "https://placehold.co/600x400.png", dataAiHint: "library interior"},
          ].map(newsItem => (
            <Card key={newsItem.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <Image src={newsItem.image || "/assets/slider/slide-1.jpg"} alt={newsItem.title} width={600} height={350} className="w-full h-56 object-cover" data-ai-hint={newsItem.dataAiHint} />
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-1">{newsItem.date}</p>
                <CardTitle className="text-xl mb-2 leading-tight text-primary hover:text-accent transition-colors">
                  <Link href={`#`}>{newsItem.title}</Link>
                </CardTitle>
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {newsItem.excerpt}
                </p>
                <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80 font-semibold">
                  <Link href={`#`}>
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-primary text-primary-foreground mt-12 scroll-mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">SIAT-Institute, Zaria</h3>
              <p className="text-sm text-primary-foreground/80">Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#hero" className="hover:underline text-primary-foreground/80">Home</Link></li>
                <li><Link href="/registration/pre-register" className="hover:underline text-primary-foreground/80">Apply for Admission</Link></li>
                <li><Link href="#news" className="hover:underline text-primary-foreground/80">News & Events</Link></li>
                <li><Link href="#auth-section" className="hover:underline text-primary-foreground/80">Student Portal</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-primary-foreground/80">
                  <Mail className="h-4 w-4"/>
                  <a href="mailto:info@siat.edu.ng" className="hover:underline">info@siat.edu.ng</a>
                </li>
                <li className="flex items-center gap-2 text-primary-foreground/80">
                  <UserCircle className="h-4 w-4"/>
                  <a href="tel:+2348012345678" className="hover:underline">+234 801 234 5678</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs text-primary-foreground/70 border-t border-primary-foreground/20 pt-8 mt-8">
            © {new Date().getFullYear()} SIAT-Institute, Zaria. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

