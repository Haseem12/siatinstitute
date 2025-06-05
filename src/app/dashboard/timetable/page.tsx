"use client"; // Added this
import * as React from "react"; // Added this
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimetableEntry, CalendarEvent } from "@/types";
// import type { Metadata } from 'next'; // Metadata handled by useEffect for client components
import { Clock, MapPin, User, Loader2 } from "lucide-react";

// export const metadata: Metadata = { // Cannot be used like this in client component
//   title: 'Timetable & Calendar - Arewa Scholar Hub',
// };

// Mock Data remains
const mockTimetable: TimetableEntry[] = [
  { id: "t1", day: "Monday", startTime: "08:00", endTime: "10:00", courseCode: "CSC301", courseName: "Data Structures", location: "Lab 1", lecturer: "Dr. Aminu" },
  { id: "t2", day: "Monday", startTime: "10:00", endTime: "12:00", courseCode: "MAT305", courseName: "Calculus II", location: "Hall B", lecturer: "Prof. Bala" },
  { id: "t3", day: "Tuesday", startTime: "14:00", endTime: "16:00", courseCode: "ENG302", courseName: "Technical Writing", location: "Room 201", lecturer: "Ms. Fatima" },
  { id: "t4", day: "Wednesday", startTime: "09:00", endTime: "11:00", courseCode: "CSC301", courseName: "Data Structures", location: "Lab 1", lecturer: "Dr. Aminu" },
  { id: "t5", day: "Thursday", startTime: "11:00", endTime: "13:00", courseCode: "PHY300", courseName: "Modern Physics", location: "Physics Lab", lecturer: "Dr. Sani"},
  { id: "t6", day: "Friday", startTime: "10:00", endTime: "12:00", courseCode: "GST311", courseName: "Entrepreneurship", location: "Auditorium", lecturer: "Mr. John"},
];

const mockCalendarEvents: CalendarEvent[] = [
  { id: "e1", title: "Mid-Semester Exams Start", date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(), type: "Exam" },
  { id: "e2", title: "Public Holiday: Democracy Day", date: new Date(new Date().getFullYear(), 5, 12).toISOString(), type: "Holiday" },
  { id: "e3", title: "Guest Lecture: AI in Africa", date: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString(), type: "Event", description: "Learn about AI advancements from leading experts." },
  { id: "e4", title: "Semester Ends", date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toISOString(), type: "Academic" },
];

const daysOrder: TimetableEntry['day'][] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TimetablePage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [timetableData, setTimetableData] = React.useState<TimetableEntry[]>([]);
  const [calendarEventsData, setCalendarEventsData] = React.useState<CalendarEvent[]>([]);
  
  React.useEffect(() => {
    document.title = 'Timetable & Calendar - SIAT Institute';
    // Simulate fetching data
    const timer = setTimeout(() => {
      setTimetableData(mockTimetable);
      setCalendarEventsData(mockCalendarEvents);
      setIsLoading(false);
    }, 700); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  
  const upcomingEvents = calendarEventsData
    .filter(event => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading timetable and calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">My Timetable &amp; Academic Calendar</CardTitle>
          <CardDescription>View your course schedule and important academic dates.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="timetable">Weekly Timetable</TabsTrigger>
          <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="timetable">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Weekly Class Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Lecturer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daysOrder.map(day => {
                      const dayEntries = timetableData.filter(entry => entry.day === day);
                      if (dayEntries.length === 0) {
                        return (
                          <TableRow key={day}>
                            <TableCell className="font-medium text-muted-foreground">{day}</TableCell>
                            <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-4">No classes scheduled</TableCell>
                          </TableRow>
                        );
                      }
                      return dayEntries.map((entry, index) => (
                        <TableRow key={entry.id}>
                          {index === 0 && <TableCell rowSpan={dayEntries.length} className="font-medium align-top pt-4 text-muted-foreground">{entry.day}</TableCell>}
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-accent"/> {entry.startTime} - {entry.endTime}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{entry.courseName}</div>
                            <div className="text-xs text-muted-foreground">{entry.courseCode}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3 text-accent"/> {entry.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                                <User className="h-3 w-3 text-accent"/> {entry.lecturer || "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" id="calendar">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Full Academic Calendar</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={today}
                  className="rounded-md border"
                  modifiers={{
                    eventDays: calendarEventsData.map(e => new Date(e.date))
                  }}
                  modifiersStyles={{
                    eventDays: { color: 'white', backgroundColor: 'hsl(var(--accent))' }
                  }}
                />
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingEvents.map(event => (
                      <li key={event.id} className="border-l-2 border-accent pl-3">
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} - <span className="font-medium text-accent">{event.type}</span>
                        </p>
                        {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming events in the near future.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
