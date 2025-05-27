
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UsersRound, LibrarySquare, Settings } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - SIAT Institute',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Admin Dashboard</CardTitle>
          <CardDescription>Overview and management tools for SIAT Institute.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Total Users</CardTitle>
            <UsersRound className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,250</div> {/* Mock Data */}
            <p className="text-xs text-muted-foreground">Students, Instructors, and Staff</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Active Courses</CardTitle>
            <LibrarySquare className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78</div> {/* Mock Data */}
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">System Status</CardTitle>
            <Settings className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">Operational</div> {/* Mock Data */}
            <p className="text-xs text-muted-foreground">All systems running smoothly</p>
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50">
                <h3 className="font-semibold text-lg">Manage Students</h3>
                <p className="text-sm text-muted-foreground">View, add, or edit student records.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50">
                <h3 className="font-semibold text-lg">Manage Instructors</h3>
                <p className="text-sm text-muted-foreground">Assign courses, update profiles.</p>
            </div>
             <div className="p-4 border rounded-lg hover:bg-muted/50">
                <h3 className="font-semibold text-lg">Create Announcement</h3>
                <p className="text-sm text-muted-foreground">Publish news to students or staff.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
