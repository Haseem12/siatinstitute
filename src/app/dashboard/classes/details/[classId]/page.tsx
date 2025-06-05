"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Removed CardFooter as it's not used
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Info, ArrowLeft, Edit, Trash2, MessageSquare, Video, Loader2 } from "lucide-react"; // Added Loader2
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
// import type { Metadata } from 'next'; // Metadata not used this way in client components

const mockClassDetailsData = { // Renamed to avoid conflict with state
  id: "MAT101-002",
  title: "Calculus I",
  instructor: { name: "Prof. Ibrahim Yusuf", avatarUrl: "https://placehold.co/100x100.png", bio: "Experienced mathematics professor...", department: "Mathematics" },
  courseCode: "MAT101",
  description: "An introductory course to differential and integral calculus...",
  time: "2:00 PM - 4:00 PM", date: "2024-07-30", dayOfWeek: "Tuesday", duration: "2 hours", location: "Lecture Hall C",
  participants: 38, maxParticipants: 40, status: "scheduled" as "scheduled" | "live" | "completed" | "cancelled", type: "lecture" as "lecture" | "lab" | "workshop" | "seminar",
  syllabus: [ { week: 1, topic: "Introduction to Limits", completed: true }, { week: 2, topic: "Continuity and Differentiability", completed: true }, { week: 3, topic: "Rules of Differentiation", completed: false }, { week: 4, topic: "Applications of Derivatives", completed: false }, { week: 5, topic: "Introduction to Integration", completed: false } ],
  resources: [ { id: "res1", name: "Calculus Textbook Ch1-3.pdf", type: "pdf", url: "#" }, { id: "res2", name: "Practice Problems Set 1", type: "link", url: "#" } ],
  announcements: [ { id: "an1", content: "Quiz 1 will be held next week.", date: "2024-07-25" } ]
};

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [classDetails, setClassDetails] = useState<typeof mockClassDetailsData | null>(null); 

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      // In a real app, fetch classDetails based on classId
      // For now, use mock data, potentially adapting it if classId implies different content
      const foundClass = mockClassDetailsData.id === classId ? mockClassDetailsData : {...mockClassDetailsData, id: classId, title: `Details for ${classId}`}; // Simple mock adaptation
      setClassDetails(foundClass);
      if (foundClass) {
        document.title = `${foundClass.title} - Class Details - SIAT Institute`;
      } else {
        document.title = 'Class Not Found - SIAT Institute';
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [classId]);


  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) { case "live": return "destructive"; case "scheduled": return "secondary"; case "completed": return "default"; case "cancelled": return "outline"; default: return "secondary"; }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading class details...</p>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <Info className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Class Not Found</h2>
        <p className="text-muted-foreground">The class details for ID "{classId}" could not be loaded.</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg overflow-hidden">
        <div className="bg-primary/10 p-6 md:p-8">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4"> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes </Button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Badge variant={getStatusBadgeVariant(classDetails.status)} className="mb-2 capitalize">{classDetails.status}</Badge>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-primary">{classDetails.title}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">{classDetails.courseCode} - {classDetails.type}</CardDescription>
                </div>
                {classDetails.status === "live" && (
                    <Button asChild size="lg" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        <Link href={`/dashboard/classes/live/${classDetails.id}`}> <Video className="mr-2 h-5 w-5" /> Join Live Class </Link>
                    </Button>
                )}
            </div>
        </div>
        
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <section> <h2 className="text-xl font-semibold text-primary mb-3">Class Information</h2> <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"> <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-accent"/><div><strong>Date:</strong> {formatDate(classDetails.date)} ({classDetails.dayOfWeek})</div></div> <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-accent"/><div><strong>Time:</strong> {classDetails.time} ({classDetails.duration})</div></div> <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-accent"/><div><strong>Location:</strong> {classDetails.location}</div></div> <div className="flex items-center gap-2"><Users className="h-5 w-5 text-accent"/><div><strong>Participants:</strong> {classDetails.participants}/{classDetails.maxParticipants}</div></div> </div> </section>
                <Separator />
                <section> <h2 className="text-xl font-semibold text-primary mb-3">Description</h2> <p className="text-muted-foreground leading-relaxed">{classDetails.description}</p> </section>
                <Separator />
                <section> <h2 className="text-xl font-semibold text-primary mb-3">Syllabus Overview</h2> <ul className="space-y-2"> {classDetails.syllabus.map(item => ( <li key={item.week} className={`text-sm p-2 rounded-md flex justify-between items-center ${item.completed ? 'bg-primary/10 text-primary' : 'bg-muted/50'}`}> <span>Week {item.week}: {item.topic}</span> <Badge variant={item.completed ? "default" : "outline"}>{item.completed ? "Completed" : "Pending"}</Badge> </li> ))} </ul> </section>
                <Separator />
                <section> <h2 className="text-xl font-semibold text-primary mb-3">Resources</h2> {classDetails.resources.length > 0 ? ( <ul className="space-y-2"> {classDetails.resources.map(res => ( <li key={res.id} className="text-sm"> <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent hover:underline hover:text-accent/80 p-2 bg-accent/10 rounded-md"> <FileText className="h-4 w-4"/> {res.name} ({res.type.toUpperCase()}) </a> </li> ))} </ul> ) : <p className="text-sm text-muted-foreground">No resources uploaded.</p>} </section>
                <Separator />
                <section> <h2 className="text-xl font-semibold text-primary mb-3">Announcements</h2> {classDetails.announcements.length > 0 ? ( <ul className="space-y-3"> {classDetails.announcements.map(ann => ( <li key={ann.id} className="text-sm p-3 border border-border rounded-md bg-card"> <p className="text-muted-foreground">{ann.content}</p> <p className="text-xs text-muted-foreground/70 mt-1">Posted: {formatDate(ann.date)}</p> </li> ))} </ul> ) : <p className="text-sm text-muted-foreground">No announcements.</p>} </section>
            </div>
            <aside className="space-y-6">
                <Card className="shadow-md"> <CardHeader><CardTitle className="text-lg text-primary">Instructor</CardTitle></CardHeader> <CardContent className="text-center"> <Avatar className="w-24 h-24 mx-auto mb-3 border-2 border-accent"><AvatarImage src={classDetails.instructor.avatarUrl} alt={classDetails.instructor.name} data-ai-hint="instructor photo" /><AvatarFallback>{classDetails.instructor.name.substring(0,2).toUpperCase()}</AvatarFallback></Avatar> <h3 className="font-semibold text-primary">{classDetails.instructor.name}</h3> <p className="text-xs text-muted-foreground">{classDetails.instructor.department}</p> <p className="text-xs text-muted-foreground mt-2 text-left">{classDetails.instructor.bio}</p> <Button variant="outline" size="sm" className="mt-3 w-full"> <MessageSquare className="mr-2 h-4 w-4"/> Contact </Button> </CardContent> </Card>
                <Card className="shadow-md"> <CardHeader><CardTitle className="text-lg text-primary">Actions</CardTitle></CardHeader> <CardContent className="space-y-2"> <Button variant="outline" className="w-full"> <Edit className="mr-2 h-4 w-4" /> Edit Class </Button> <Button variant="destructive" className="w-full"> <Trash2 className="mr-2 h-4 w-4" /> Cancel Class </Button> <Button variant="secondary" className="w-full"> <Info className="mr-2 h-4 w-4" /> Report Issue </Button> </CardContent> </Card>
            </aside>
        </CardContent>
      </Card>
    </div>
  );
}

// SVG Icons (MapPin, FileText) are local to this file if only used here
const MapPin = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}> <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /> <circle cx="12" cy="10" r="3" /> </svg> );
const FileText = (props: React.SVGProps<SVGSVGElement>) => ( <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  {...props} > <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path> <polyline points="14 2 14 8 20 8"></polyline> <line x1="16" y1="13" x2="8" y2="13"></line> <line x1="16" y1="17" x2="8" y2="17"></line> <line x1="10" y1="9" x2="8" y2="9"></line> </svg> );
