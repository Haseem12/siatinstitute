
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, UploadCloud } from "lucide-react";
import type { Assignment, Course } from "@/types";
// import type { Metadata } from 'next'; // Cannot be used in client components


// Mock courses for the instructor
const mockInstructorCourses: Course[] = [
  { id: "csc101", code: "CSC101", name: "Intro to Computer Science", credits: 3 },
  { id: "mat102", code: "MAT102", name: "Calculus for Engineers", credits: 4 },
];

export default function CreateAssignmentPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [totalMarks, setTotalMarks] = useState<number | undefined>(100);

  useState(() => {
    if (typeof document !== 'undefined') {
        document.title = 'Create Assignment - Instructor Dashboard';
    }
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseId || !description || !dueDate) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }
    // Mock submission
    const selectedCourse = mockInstructorCourses.find(c => c.id === courseId);
    console.log("New Assignment:", {
      title,
      courseCode: selectedCourse?.code,
      courseName: selectedCourse?.name,
      description,
      dueDate,
      file: file?.name,
      totalMarks
    });
    toast({ title: "Assignment Created", description: `${title} has been successfully created for ${selectedCourse?.name}.`});
    // Reset form
    setTitle(""); setCourseId(""); setDescription(""); setDueDate(""); setFile(null); setTotalMarks(100);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Create New Assignment</CardTitle>
          <CardDescription>Set up a new assignment for your students.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="assignmentTitle">Assignment Title</Label>
              <Input id="assignmentTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Mid-term Essay" required />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="courseSelect">Select Course</Label>
                    <Select value={courseId} onValueChange={setCourseId} required>
                        <SelectTrigger id="courseSelect">
                        <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                        {mockInstructorCourses.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                </div>
            </div>

            <div>
              <Label htmlFor="description">Description / Instructions</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed instructions for the assignment..." rows={5} required />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="totalMarks">Total Marks (Optional)</Label>
                    <Input id="totalMarks" type="number" value={totalMarks === undefined ? '' : totalMarks} onChange={(e) => setTotalMarks(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="e.g., 100" />
                </div>
                <div>
                    <Label htmlFor="assignmentFile">Attach File (Optional)</Label>
                    <Input id="assignmentFile" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="file:text-accent file:font-semibold"/>
                    {file && <p className="text-xs text-muted-foreground mt-1">Selected: {file.name}</p>}
                </div>
            </div>

            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Assignment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
