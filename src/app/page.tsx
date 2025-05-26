
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  UserCircle,
  LogIn,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Added for login redirection
import { useToast } from "@/hooks/use-toast"   // Added for login feedback

const sliderImages = [
  {
    src: "/assets/slider/slide-1.jpg",
    alt: "SIAT Campus Main Gate",
    title: "Welcome to SIAT",
    subtitle: "Excellence in Education, Innovation in Learning",
    dataAiHint: "campus gate"
  },
  {
    src: "/assets/slider/slide-2.jpg",
    alt: "Modern Lecture Halls",
    title: "State-of-the-Art Facilities",
    subtitle: "Modern classrooms equipped with latest technology",
    dataAiHint: "lecture hall"
  },
  {
    src: "/assets/slider/slide-3.jpg",
    alt: "Computer Laboratory",
    title: "Advanced Computer Labs",
    subtitle: "Hands-on learning with cutting-edge equipment",
    dataAiHint: "computer lab"
  },
  {
    src: "/assets/slider/slide-4.jpg",
    alt: "Library Complex",
    title: "Comprehensive Library",
    subtitle: "Vast collection of books and digital resources",
    dataAiHint: "library building"
  },
  {
    src: "/assets/slider/slide-5.jpg",
    alt: "Students in Class",
    title: "Interactive Learning",
    subtitle: "Engaging classroom experiences with expert faculty",
    dataAiHint: "students classroom"
  },
  {
    src: "/assets/slider/slide-6.jpg",
    alt: "Science Laboratory",
    title: "Well-Equipped Labs",
    subtitle: "Practical learning in modern laboratory settings",
    dataAiHint: "science lab"
  },
  {
    src: "/assets/slider/slide-7.jpg",
    alt: "Campus Cafeteria",
    title: "Student Life",
    subtitle: "Comfortable dining and social spaces",
    dataAiHint: "campus cafeteria"
  },
  {
    src: "/assets/slider/slide-8.jpg",
    alt: "Sports Complex",
    title: "Sports & Recreation",
    subtitle: "Maintaining physical fitness and team spirit",
    dataAiHint: "sports field"
  },
  {
    src: "/assets/slider/slide-9.jpg",
    alt: "Graduation Ceremony",
    title: "Success Stories",
    subtitle: "Celebrating achievements of our graduates",
    dataAiHint: "graduation event"
  },
  {
    src: "/assets/slider/slide-10.jpg",
    alt: "Workshop Training",
    title: "Practical Training",
    subtitle: "Skill development through hands-on workshops",
    dataAiHint: "workshop students"
  },
  {
    src: "/assets/slider/slide-11.jpg",
    alt: "Campus Garden",
    title: "Serene Environment",
    subtitle: "Beautiful landscaped campus for peaceful learning",
    dataAiHint: "campus garden"
  },
  {
    src: "/assets/slider/slide-12.jpg",
    alt: "Innovation Hub",
    title: "Innovation Center",
    subtitle: "Fostering creativity and entrepreneurship",
    dataAiHint: "innovation hub"
  },
]

export default function LandingPage() { // Renamed from DashboardPage
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const router = useRouter() // Added for login
  const { toast } = useToast() // Added for login feedback
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, sliderImages.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    // Mock login
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (studentId && password) { // Simple validation
      toast({ title: "Login Successful", description: "Redirecting to dashboard..." })
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
      }
      router.push("/dashboard")
    } else {
      toast({ variant: "destructive", title: "Login Failed", description: "Please enter Student ID and Password." })
    }
    setIsLoggingIn(false)
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Slider */}
      <Card className="shadow-lg border-primary/10 overflow-hidden mb-8">
        <div className="relative">
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden"> {/* Increased height */}
            {/* Image Container */}
            <div
              className="flex transition-transform duration-700 ease-in-out h-full" /* Smoother transition */
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sliderImages.map((slide, index) => (
                <div key={index} className="min-w-full relative h-full">
                  <Image
                    src={slide.src || "/assets/slider/slide-1.jpg"} // Fallback image
                    alt={slide.alt}
                    fill // Use fill for responsive covering
                    style={{ objectFit: 'cover' }} // Ensure image covers the area
                    className="brightness-75" // Adjusted brightness
                    priority={index === 0}
                    data-ai-hint={slide.dataAiHint}
                    onError={(e) => console.error("Image failed to load:", slide.src, e)}
                  />
                  <div className="absolute inset-0 bg-black/50"></div> {/* Darker overlay */}
                  <div className="absolute inset-0 flex items-center justify-start p-6 md:p-12"> {/* Increased padding */}
                    <div className="text-white max-w-xl"> {/* Increased max-width */}
                      <h1 className="text-3xl md:text-5xl font-bold mb-3">{slide.title}</h1>
                      <p className="text-md md:text-xl text-gray-200 mb-6">{slide.subtitle}</p>
                      <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-6 py-3">
                        <Link href="#learn-more">
                          <GraduationCap className="mr-2 h-5 w-5" />
                          Learn More
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Slide Indicator */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
              {currentSlide + 1} / {sliderImages.length}
            </div>

            {/* Auto-play indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? "bg-green-400" : "bg-gray-400"}`}></div>
              <span className="text-white text-xs">{isAutoPlaying ? "Auto" : "Manual"}</span>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/30 px-4 py-2 rounded-full z-10">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? "bg-white scale-110" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30 z-10">
            <div
              className="h-full bg-accent transition-all duration-100"
              style={{
                width: `${((currentSlide + 1) / sliderImages.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </Card>
      
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Student Portal Login */}
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-primary">Student Portal Login</CardTitle>
              <CardDescription>Welcome back! Access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="studentId" className="text-sm font-medium text-foreground">
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    placeholder="e.g., SIAT/001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="passwordLogin" className="text-sm font-medium text-foreground"> {/* Changed id for password */}
                    Password
                  </label>
                  <input
                    id="passwordLogin" // Changed id for password
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoggingIn}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoggingIn ? "Logging in..." : "Login to Portal"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Forgot your password?{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    Contact support
                  </Link>
                  .
                </p>
              </form>
               <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">New to SIAT?</p>
                <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
                  <Link href="/registration/new-intake">
                    Apply for Admission
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Why Choose SIAT */}
          <Card className="lg:col-span-2 shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary">Why Choose SIAT?</CardTitle>
              <CardDescription>Discover the advantages of studying with us.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 p-4 rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-7 w-7 text-accent flex-shrink-0" />
                    <h3 className="font-semibold text-lg text-primary">Quality Education</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We offer a curriculum designed for excellence and practical knowledge.
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-7 w-7 text-accent flex-shrink-0" />
                    <h3 className="font-semibold text-lg text-primary">Experienced Lecturers</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Learn from seasoned professionals and academics in their fields.
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-7 w-7 text-accent flex-shrink-0" />
                    <h3 className="font-semibold text-lg text-primary">Conducive Environment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">A serene and well-equipped campus for optimal learning.</p>
                </div>
                <div className="space-y-2 p-4 rounded-lg hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="h-7 w-7 text-accent flex-shrink-0" />
                    <h3 className="font-semibold text-lg text-primary">Skill Acquisition</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Focus on hands-on skills and entrepreneurial development.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest News & Events */}
        <Card className="shadow-lg border-primary/10 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Latest News & Events</CardTitle>
            <CardDescription>Stay updated with happenings at SIAT.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {id: "news1", date: "July 15, 2024", title: "Admission for 2024/2025 Session Now Open!", excerpt: "Prospective students can now apply for various programs for the upcoming academic session...", image: "https://placehold.co/600x400.png", dataAiHint: "students admission"},
                {id: "news2", date: "July 10, 2024", title: "SIAT Hosts Tech Innovation Summit", excerpt: "The institute successfully hosted a summit bringing together tech leaders and innovators...", image: "https://placehold.co/600x400.png", dataAiHint: "tech summit"},
                {id: "news3", date: "June 28, 2024", title: "New Library Wing Inaugurated", excerpt: "Our library has been expanded with a new wing, offering more resources and study spaces...", image: "https://placehold.co/600x400.png", dataAiHint: "library interior"},
              ].map(newsItem => (
                <Card key={newsItem.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <Image src="/assets/slider/slide-1.jpg" alt={newsItem.title} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={newsItem.dataAiHint} />
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs text-muted-foreground">{newsItem.date}</div>
                    <CardTitle className="text-lg leading-tight text-primary hover:text-accent transition-colors">
                      <Link href={`/news/${newsItem.id}`}>{newsItem.title}</Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {newsItem.excerpt}
                    </p>
                    <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80">
                      <Link href={`/news/${newsItem.id}`}>
                        Read More <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-primary">Scholars Institute of Arts & Technology, Zaria</h3>
            <p className="text-muted-foreground">Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</p>
            <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
              <a href="mailto:info@siat.edu.ng" className="hover:text-primary transition-colors">
                info@siat.edu.ng
              </a>
              <span>|</span>
              <a href="tel:+2348012345678" className="hover:text-primary transition-colors">
                +234 801 234 5678
              </a>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SIAT. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

    