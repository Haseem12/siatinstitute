import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CalendarCheck, CheckSquare, Megaphone, UserCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Arewa Scholar Hub',
};

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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="relative p-0 overflow-hidden rounded-t-lg">
            <Image 
                src="https://placehold.co/1200x300.png"
                alt="Zaria Landscape"
                width={1200}
                height={300}
                className="object-cover w-full h-48"
                data-ai-hint="zaria landscape savannah"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-3xl font-bold text-white">Welcome, Student!</h1>
                <p className="text-lg text-gray-200">Your academic journey at a glance.</p>
            </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Here's a quick overview of your academic activities. Stay organized and informed.
          </p>
        </CardContent>
      </Card>

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
                    <p className="text-xs text-muted-foreground">{item.time} - {item.location}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming classes today or tomorrow.</p>
            )}
            <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80 mt-2">
              <Link href="/dashboard/timetable">View Full Timetable <ArrowRight className="ml-1 h-4 w-4" /></Link>
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
                    <p className="text-xs text-red-500">{item.dueDate}</p>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-sm text-muted-foreground">No pending assignments. Great job!</p>
            )}
            <Button variant="link" asChild className="px-0 text-accent hover:text-accent/80 mt-2">
              <Link href="/dashboard/assignments">Manage Assignments <ArrowRight className="ml-1 h-4 w-4" /></Link>
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
              <Link href="/dashboard/announcements">View All Announcements <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" asChild className="text-center py-6 h-auto flex-col gap-1 border-accent/50 hover:bg-accent/10">
                <Link href="/dashboard/results">
                    <CheckSquare className="h-6 w-6 mb-1 text-accent"/>
                    View Results
                </Link>
            </Button>
            <Button variant="outline" asChild className="text-center py-6 h-auto flex-col gap-1 border-accent/50 hover:bg-accent/10">
                <Link href="/dashboard/profile">
                    <UserCircle className="h-6 w-6 mb-1 text-accent"/>
                    My Profile
                </Link>
            </Button>
             <Button variant="outline" asChild className="text-center py-6 h-auto flex-col gap-1 border-accent/50 hover:bg-accent/10">
                <Link href="/dashboard/timetable#calendar">
                    <CalendarCheck className="h-6 w-6 mb-1 text-accent"/>
                    Academic Calendar
                </Link>
            </Button>
             <Button variant="outline" asChild className="text-center py-6 h-auto flex-col gap-1 border-accent/50 hover:bg-accent/10">
                <Link href="/dashboard/assignments?upload=new">
                    <BookOpen className="h-6 w-6 mb-1 text-accent"/>
                    Submit Assignment
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
