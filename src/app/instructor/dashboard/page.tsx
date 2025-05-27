
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import { BookOpen, ClipboardPlus, Users } from "lucide-react";
import type { Metadata } from 'next';
import Link from "next/link";
import { cn } from "@/lib/utils"; // Import cn

export const metadata: Metadata = {
  title: 'Instructor Dashboard - SIAT Institute',
};

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Instructor Dashboard</CardTitle>
          <CardDescription>Manage your courses, assignments, and student interactions.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">My Courses</CardTitle>
            <BookOpen className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div> {/* Mock Data */}
            <p className="text-xs text-muted-foreground">Currently teaching</p>
            <Link
              href="/instructor/dashboard/my-courses/CSC101"
              className={cn(buttonVariants({ variant: "link" }), "px-0 mt-2")}
            >
              View Courses
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Assignments Due</CardTitle>
            <ClipboardPlus className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div> {/* Mock Data */}
            <p className="text-xs text-muted-foreground">Across all courses</p>
             <Button variant="link" asChild className="px-0 mt-2">
                <Link href="/instructor/dashboard/create-assignment">Create New</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Total Students</CardTitle>
            <Users className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">120</div> {/* Mock Data */}
            <p className="text-xs text-muted-foreground">Enrolled in your courses</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="text-xl text-primary">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">No recent activity to display (mock).</p>
        </CardContent>
      </Card>
    </div>
  );
}
