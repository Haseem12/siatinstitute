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
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import Image from "next/image";
import { BookOpen, Lightbulb, Users, Award, Newspaper, Phone, Mail } from "lucide-react";
import type { NewIntakeFormData } from "@/types";

const loginFormSchema = z.object({
  studentId: z.string().min(1, { message: "Student ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const intakeFormSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  preferredProgram: z.string().min(1, { message: "Please select a program." }),
  previousQualification: z.string().optional(),
});

type IntakeFormValues = z.infer<typeof intakeFormSchema>;

// Mock login action
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

// Mock new intake registration action
async function handleNewIntakeRegistration(data: IntakeFormValues): Promise<{ success: boolean; message: string }> {
  console.log("New Intake Registration Data:", data);
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate success or failure
  if (data.email.includes("test")) { // Simple mock failure condition
    return { success: false, message: "Registration failed. Please try a different email." };
  }
  return { success: true, message: `Thank you, ${data.fullName}! Your application has been received.` };
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

const availablePrograms = [
    "Computer Science",
    "Software Engineering",
    "Mass Communication",
    "Business Administration",
    "Accounting",
    "Electrical Engineering Technology",
    "Public Administration"
];


export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingLogin, setIsLoadingLogin] = React.useState(false);
  const [isLoadingIntake, setIsLoadingIntake] = React.useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { studentId: "", password: "" },
  });

  const intakeForm = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: { fullName: "", email: "", phoneNumber: "", preferredProgram: "", previousQualification: "" },
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

  async function onIntakeSubmit(data: IntakeFormValues) {
    setIsLoadingIntake(true);
    const result = await handleNewIntakeRegistration(data);
    setIsLoadingIntake(false);
    if (result.success) {
      toast({ title: "Registration Successful", description: result.message, duration: 5000 });
      intakeForm.reset();
    } else {
      toast({ variant: "destructive", title: "Registration Failed", description: result.message, duration: 5000 });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section with Carousel */}
      <section id="hero" className="relative h-[60vh] md:h-[80vh] w-full text-white">
        <Carousel
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full h-full"
        >
          <CarouselContent>
            {[
              { src: "https://placehold.co/1920x1080.png", alt: "Students on campus", title: "Empowering Future Leaders", subtitle: "Join a community dedicated to knowledge and innovation.", dataAiHint: "students campus" },
              { src: "https://placehold.co/1920x1080.png", alt: "Modern library", title: "Excellence in Education", subtitle: "Discover your potential with our state-of-the-art facilities.", dataAiHint: "modern library"},
              { src: "https://placehold.co/1920x1080.png", alt: "Graduation ceremony", title: "Your Journey Starts Here", subtitle: "Scholars Institute of Arts & Technology, Zaria.", dataAiHint: "graduation ceremony" },
            ].map((item, index) => (
              <CarouselItem key={index} className="relative h-[60vh] md:h-[80vh]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  layout="fill"
                  objectFit="cover"
                  className="brightness-50"
                  data-ai-hint={item.dataAiHint}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/40">
                  <ArewaLogo className="h-16 w-16 md:h-20 md:w-20 text-white mb-4" />
                  <h1 className="text-4xl md:text-6xl font-bold mb-2">{item.title}</h1>
                  <p className="text-lg md:text-2xl max-w-2xl">{item.subtitle}</p>
                  {index === 2 && <Button size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6" onClick={() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })}>Apply Now</Button>}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex text-white bg-black/30 hover:bg-black/50 border-white/50" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex text-white bg-black/30 hover:bg-black/50 border-white/50" />
        </Carousel>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-muted/30">
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

      {/* Login/Register Tabs Section */}
      <section id="auth" className="py-16 lg:py-24">
        <div className="container mx-auto px-4 flex justify-center">
          <Tabs defaultValue="login" className="w-full max-w-xl">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="login" className="py-3 text-base data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md">Student Login</TabsTrigger>
              <TabsTrigger value="register" className="py-3 text-base data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-md">New Intake Registration</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
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
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoadingLogin}>
                        {isLoadingLogin ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="register">
              <Card className="shadow-xl border-2 border-primary/10">
                <CardHeader className="text-center">
                 <ArewaLogo className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-primary">New Student Application</CardTitle>
                  <CardDescription>Start your academic journey with us. Fill the form below.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...intakeForm}>
                    <form onSubmit={intakeForm.handleSubmit(onIntakeSubmit)} className="space-y-4">
                      <FormField
                        control={intakeForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={intakeForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={intakeForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input type="tel" placeholder="08012345678" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={intakeForm.control}
                        name="preferredProgram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Program of Study</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select a program" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availablePrograms.map(program => (
                                    <SelectItem key={program} value={program}>{program}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={intakeForm.control}
                        name="previousQualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Previous Qualification (Optional)</FormLabel>
                            <FormControl><Textarea placeholder="e.g., SSCE, Diploma in..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoadingIntake}>
                        {isLoadingIntake ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* News & Events Section */}
      <section id="news" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary">Latest News & Events</h2>
            <p className="text-muted-foreground mt-2 text-lg">Stay updated with happenings at SIAT.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <Card key={item.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  {/* Optional: Placeholder image for news */}
                  {/* <Image src="https://placehold.co/600x400.png" alt={item.title} width={600} height={400} className="rounded-t-lg mb-4" data-ai-hint="news event related"/> */}
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

      {/* Footer */}
      <footer className="py-12 bg-primary text-primary-foreground">
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
