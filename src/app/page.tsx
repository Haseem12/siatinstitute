
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
// import Autoplay from "embla-carousel-autoplay"; // Temporarily removed for debugging
import { useToast } from "@/hooks/use-toast";
import ArewaLogo from "@/components/arewa-logo";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Lightbulb, Users, Award, Newspaper, Phone, Mail, LogIn, UserPlus, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const loginFormSchema = z.object({
  studentId: z.string().min(1, { message: "Student ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

async function handleLogin(data: LoginFormValues): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (data.studentId && data.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
    }
    return { success: true, message: "Login successful!" };
  }
  return { success: false, message: "Invalid Student ID or Password." };
}

const schoolFeatures = [
  { title: "Quality Education", description: "We offer a curriculum designed for excellence and practical knowledge.", icon: Award },
  { title: "Experienced Lecturers", description: "Learn from seasoned professionals and academics in their fields.", icon: Users },
  { title: "Conducive Environment", description: "A serene and well-equipped campus for optimal learning.", icon: Lightbulb },
  { title: "Skill Acquisition", description: "Focus on hands-on skills and entrepreneurial development.", icon: BookOpen },
];

const newsItems = [
  { id: 1, title: "Admission for 2024/2025 Session Now Open!", date: "July 15, 2024", excerpt: "Prospective students can now apply for various programs for the upcoming academic session..." },
  { id: 2, title: "SIAT Hosts Tech Innovation Summit", date: "July 10, 2024", excerpt: "The institute successfully hosted a summit bringing together tech leaders and innovators..." },
  { id: 3, title: "New Library Wing Inaugurated", date: "June 28, 2024", excerpt: "Our library has been expanded with a new wing, offering more resources and study spaces..." },
];

const carouselImages = [
  { src: "/assets/slider/slide-1.jpg", alt: "Scenic view of SIAT campus", title: "Empowering Future Leaders", subtitle: "Join a community dedicated to knowledge and innovation.", dataAiHint: "campus view" },
  { src: "/assets/slider/slide-2.jpg", alt: "Students collaborating in a modern classroom", title: "Excellence in Education", subtitle: "Discover your potential with our state-of-the-art facilities.", dataAiHint: "students classroom" },
  { src: "/assets/slider/slide-3.jpg", alt: "SIAT graduation ceremony", title: "Your Journey Starts Here", subtitle: "Scholars Institute of Arts & Technology, Zaria.", dataAiHint: "graduation event" },
  { src: "/assets/slider/slide-4.jpg", alt: "Well-equipped science laboratory", title: "Innovation & Discovery", subtitle: "Explore the frontiers of science and technology.", dataAiHint: "science lab" },
  { src: "/assets/slider/slide-5.jpg", alt: "Library interior with students studying", title: "Hub of Knowledge", subtitle: "Access a vast collection of resources in our library.", dataAiHint: "library interior" },
  { src: "/assets/slider/slide-6.jpg", alt: "Students engaged in a workshop", title: "Hands-On Learning", subtitle: "Gain practical skills for real-world challenges.", dataAiHint: "student workshop" },
  { src: "/assets/slider/slide-7.jpg", alt: "Architectural detail of a SIAT building", title: "Inspiring Architecture", subtitle: "Learn in an environment designed for inspiration.", dataAiHint: "campus architecture" },
  { src: "/assets/slider/slide-8.jpg", alt: "Sports facilities at SIAT", title: "Holistic Development", subtitle: "Excel in academics, sports, and extracurriculars.", dataAiHint: "sports field" },
  { src: "/assets/slider/slide-9.jpg", alt: "Art and design studio", title: "Creative Expression", subtitle: "Unleash your creativity in our dedicated studios.", dataAiHint: "art studio" },
  { src: "/assets/slider/slide-10.jpg", alt: "Students presenting a project", title: "Collaborate & Innovate", subtitle: "Work together to solve complex problems.", dataAiHint: "student presentation" },
  { src: "/assets/slider/slide-11.jpg", alt: "Campus green spaces", title: "Serene Learning Environment", subtitle: "Focus and grow in our peaceful campus.", dataAiHint: "campus garden" },
  { src: "/assets/slider/slide-12.jpg", alt: "SIAT main entrance", title: "Welcome to SIAT", subtitle: "Your gateway to a brighter future.", dataAiHint: "school entrance" },
];


const navLinks = [
    { href: "#auth-section", label: "Apply / Login" },
    { href: "#features", label: "Features" },
    { href: "#news", label: "News & Events" },
    { href: "#contact", label: "Contact Us" },
];

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingLogin, setIsLoadingLogin] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { studentId: "", password: "" },
  });

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoadingLogin(true);
    const result = await handleLogin(data);
    setIsLoadingLogin(false);
    if (result.success) {
      toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
      router.push("/dashboard");
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: result.message });
      loginForm.setError("studentId", { type: "manual", message: " " });
      loginForm.setError("password", { type: "manual", message: result.message });
    }
  }
  
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerOffset = 80; 
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="#hero" onClick={(e) => handleNavLinkClick(e, '#hero')} className="flex items-center gap-2">
            <ArewaLogo className="h-10 w-10 text-primary" />
            <span className="font-bold text-xl text-primary hidden sm:block">Arewa Scholar Hub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button key={link.label} variant="ghost" asChild className="text-foreground hover:bg-primary/10 hover:text-primary">
                <Link href={link.href} onClick={(e) => handleNavLinkClick(e, link.href)}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0">
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                         <Link href="#hero" onClick={(e) => handleNavLinkClick(e, '#hero')} className="flex items-center gap-2">
                            <ArewaLogo className="h-8 w-8 text-primary" />
                            <span className="font-bold text-lg text-primary">Arewa Scholar Hub</span>
                        </Link>
                    </div>
                    <nav className="flex-grow p-6 space-y-2">
                    {navLinks.map((link) => (
                      <Button key={link.label} variant="ghost" asChild className="w-full justify-start text-lg py-3">
                        <Link href={link.href} onClick={(e) => handleNavLinkClick(e, link.href)}>{link.label}</Link>
                      </Button>
                    ))}
                    </nav>
                     <div className="p-6 border-t">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => {
                            const authSection = document.getElementById('auth-section');
                            if (authSection) {
                              const headerOffset = 80;
                              const elementPosition = authSection.getBoundingClientRect().top;
                              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                            }
                            setIsMobileMenuOpen(false);
                          }}>
                            <LogIn className="mr-2 h-5 w-5"/> Login / Apply
                        </Button>
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section id="hero" className="relative h-[calc(60vh-80px)] md:h-[calc(70vh-80px)] w-full text-white -mt-20 pt-20">
          <Carousel
            opts={{ loop: true }}
            // plugins={[Autoplay({ delay: 5000 })]} // Temporarily removed for debugging
            className="w-full h-full"
          >
            <CarouselContent>
              {carouselImages.map((item, index) => {
                console.log("Rendering carousel item, image src:", item.src); 
                const bgColor = index % 3 === 0 ? 'bg-red-500/30' : index % 3 === 1 ? 'bg-blue-500/30' : 'bg-green-500/30';
                return (
                  <CarouselItem key={index} className="relative h-full">
                    {/* Simplified content for debugging */}
                    <div className={`w-full h-full flex items-center justify-center text-center p-4 ${bgColor}`}>
                      <div className="text-white">
                        <ArewaLogo className="h-16 w-16 md:h-20 md:w-20 text-white mb-4 mx-auto" />
                        <h1 className="text-3xl md:text-5xl font-bold mb-2">Slide {index + 1}: {item.title}</h1>
                        <p className="text-lg md:text-xl max-w-2xl">{item.subtitle}</p>
                         <Button size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6" onClick={() => {
                            const authSection = document.getElementById('auth-section');
                            if (authSection) {
                              const headerOffset = 80;
                              const elementPosition = authSection.getBoundingClientRect().top;
                              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                              window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                            }
                          }}>Get Started</Button>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex text-white bg-black/30 hover:bg-black/50 border-white/50" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex text-white bg-black/30 hover:bg-black/50 border-white/50" />
          </Carousel>
        </section>

        <section id="auth-section" className="py-16 lg:py-24 bg-muted/20 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Card className="shadow-xl border-2 border-primary/10 p-6">
                  <CardHeader className="text-center md:text-left">
                    <UserPlus className="h-12 w-12 text-primary mx-auto md:mx-0 mb-3" />
                    <CardTitle className="text-2xl lg:text-3xl font-bold text-primary">New to SIAT?</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-1">
                      Begin your academic journey with us. Apply for admission into our diverse programs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-muted-foreground">
                      Our streamlined application process makes it easy to get started. Click the button below to access the new intake registration portal.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm mb-6">
                      <li>Comprehensive bio-data form.</li>
                      <li>Upload academic qualifications.</li>
                      <li>Showcase relevant experience (optional).</li>
                      <li>Choose your desired program and campus.</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button asChild size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3">
                      <Link href="/registration/new-intake">
                        <UserPlus className="mr-2 h-5 w-5" /> Apply for Admission
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="order-1 md:order-2">
                <Card className="shadow-xl border-2 border-primary/10">
                  <CardHeader className="text-center">
                    <ArewaLogo className="h-12 w-12 text-primary mx-auto mb-2" />
                    <CardTitle className="text-2xl font-bold text-primary">Student Portal Login</CardTitle>
                    <CardDescription>Welcome back! Access your dashboard.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField
                          control={loginForm.control}
                          name="studentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student ID</FormLabel>
                              <FormControl><Input placeholder="e.g., SIAT/001" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoadingLogin}>
                          <LogIn className="mr-2 h-5 w-5" />
                          {isLoadingLogin ? "Logging in..." : "Login to Portal"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="text-center text-xs text-muted-foreground">
                      <p>Forgot your password? Contact support.</p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 lg:py-24 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary">Why Choose SIAT?</h2>
              <p className="text-muted-foreground mt-2 text-lg">Discover the advantages of studying with us.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {schoolFeatures.map((feature) => (
                <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-2">
                      <feature.icon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-primary">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="news" className="py-16 lg:py-24 bg-muted/30 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary">Latest News & Events</h2>
              <p className="text-muted-foreground mt-2 text-lg">Stay updated with happenings at SIAT.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => (
                <Card key={item.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Newspaper className="h-4 w-4 mr-2 text-primary" />
                      <span>{item.date}</span>
                    </div>
                    <CardTitle className="text-xl text-primary">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">{item.excerpt}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="link" className="text-accent p-0">Read More &rarr;</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="py-12 bg-primary text-primary-foreground scroll-mt-20">
        <div className="container mx-auto px-4 text-center">
          <ArewaLogo className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-semibold">Scholars Institute of Arts & Technology, Zaria</p>
          <p className="text-sm text-primary-foreground/80 mt-1">Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</p>
          <div className="flex justify-center items-center gap-4 mt-4 text-sm text-primary-foreground/80">
            <a href="mailto:info@siat.edu.ng" className="hover:text-accent flex items-center gap-1">
              <Mail className="h-4 w-4" /> info@siat.edu.ng
            </a>
            <span className="opacity-50">|</span>
            <a href="tel:+2348012345678" className="hover:text-accent flex items-center gap-1">
              <Phone className="h-4 w-4" /> +234 801 234 5678
            </a>
          </div>
          <p className="text-xs text-primary-foreground/60 mt-8">
            &copy; {new Date().getFullYear()} SIAT. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
    
