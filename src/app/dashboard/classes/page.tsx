"use client"; // Added this
import * as React from "react"; // Added this
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, BookOpen, Play, Plus, Search, Filter, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
// import type { Metadata } from 'next'; // Metadata handled by useEffect for client components

// export const metadata: Metadata = { // Cannot be used like this
//   title: 'Classes - Arewa Scholar Hub',
// };

// Mock data for classes remains
const mockUpcomingClasses = [
  { id: "CSC101-001", title: "Introduction to Computer Science", instructor: "Dr. Amina Hassan", time: "10:00 AM - 12:00 PM", date: "Today", participants: 45, maxParticipants: 50, status: "live", type: "lecture" },
  { id: "MAT101-002", title: "Calculus I", instructor: "Prof. Ibrahim Yusuf", time: "2:00 PM - 4:00 PM", date: "Today", participants: 38, maxParticipants: 40, status: "scheduled", type: "lecture" },
  { id: "ENG102-003", title: "Technical Writing Workshop", instructor: "Dr. Khadija Mohammed", time: "9:00 AM - 11:00 AM", date: "Tomorrow", participants: 25, maxParticipants: 30, status: "scheduled", type: "workshop" },
];

const mockRecordedClasses = [
  { id: "CSC101-REC-001", title: "Introduction to Programming - Week 1", instructor: "Dr. Amina Hassan", duration: "1h 45m", date: "Yesterday", views: 156, type: "recording" },
  { id: "MAT101-REC-002", title: "Limits and Continuity", instructor: "Prof. Ibrahim Yusuf", duration: "2h 15m", date: "2 days ago", views: 203, type: "recording" },
];

export default function ClassesPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [upcomingClasses, setUpcomingClasses] = React.useState<typeof mockUpcomingClasses>([]);
  const [recordedClasses, setRecordedClasses] = React.useState<typeof mockRecordedClasses>([]);

  React.useEffect(() => {
    document.title = 'Classes - SIAT Institute';
    // Simulate fetching data
    const timer = setTimeout(() => {
      setUpcomingClasses(mockUpcomingClasses);
      setRecordedClasses(mockRecordedClasses);
      setIsLoading(false);
    }, 500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Classes</h1>
          <p className="text-muted-foreground">Manage your online classes and recordings</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline"> <Search className="w-4 h-4 mr-2" /> Search </Button>
          <Button variant="outline"> <Filter className="w-4 h-4 mr-2" /> Filter </Button>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground"> <Plus className="w-4 h-4 mr-2" /> Schedule Class </Button>
        </div>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"> <Video className="w-6 h-6 text-destructive" /> Live &amp; Upcoming Classes </CardTitle>
          <CardDescription>Join live classes or view upcoming sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingClasses.map((classItem) => (
              <Card key={classItem.id} className="border hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 mr-2">
                      <CardTitle className="text-lg">{classItem.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{classItem.instructor}</p>
                    </div>
                    <Badge variant={classItem.status === "live" ? "destructive" : "secondary"}>
                      {classItem.status === "live" ? ( <> <div className="w-2 h-2 bg-destructive-foreground rounded-full mr-2 animate-pulse"></div> Live </> ) : ( "Scheduled" )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"> <Calendar className="w-4 h-4" /> {classItem.date} </div>
                    <div className="flex items-center gap-1"> <Clock className="w-4 h-4" /> {classItem.time} </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"> <Users className="w-4 h-4" /> {classItem.participants}/{classItem.maxParticipants} participants </div>
                </CardContent>
                <CardFooter className="mt-auto pt-3">
                  <div className="flex gap-2 w-full">
                    {classItem.status === "live" ? (
                      <Button asChild variant="destructive" className="flex-1">
                        <Link href={`/dashboard/classes/live/${classItem.id}`}> <Video className="w-4 h-4 mr-2" /> Join Live </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/dashboard/classes/details/${classItem.id}`}> <Calendar className="w-4 h-4 mr-2" /> View Details </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-10 w-10"> <MoreVertical className="w-4 h-4" /> </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
             {upcomingClasses.length === 0 && <p className="col-span-full text-center text-muted-foreground py-6">No live or upcoming classes scheduled.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"> <Play className="w-6 h-6 text-primary" /> Recorded Classes </CardTitle>
          <CardDescription>Access previous class recordings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recordedClasses.map((recording) => (
              <Card key={recording.id} className="border hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{recording.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{recording.instructor}</p>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"> <Clock className="w-4 h-4" /> {recording.duration} </div>
                    <div className="flex items-center gap-1"> <Calendar className="w-4 h-4" /> {recording.date} </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"> <Users className="w-4 h-4" /> {recording.views} views </div>
                </CardContent>
                <CardFooter className="mt-auto pt-3">
                   <div className="flex gap-2 w-full">
                    <Button asChild className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href={`/dashboard/classes/recording/${recording.id}`}> <Play className="w-4 h-4 mr-2" /> Watch </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10"> <MoreVertical className="w-4 h-4" /> </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            {recordedClasses.length === 0 && <p className="col-span-full text-center text-muted-foreground py-6">No recorded classes available yet.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-primary/10">
        <CardHeader><CardTitle className="text-xl">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2"> <Plus className="w-6 h-6" /> Schedule Class </Button>
            <Button variant="outline" className="h-20 flex-col gap-2"> <Video className="w-6 h-6" /> Start Instant Meeting </Button>
            <Button variant="outline" className="h-20 flex-col gap-2"> <BookOpen className="w-6 h-6" /> Class Materials </Button>
            <Button variant="outline" className="h-20 flex-col gap-2"> <Users className="w-6 h-6" /> Manage Students </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
