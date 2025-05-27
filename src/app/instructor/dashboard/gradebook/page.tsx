
"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course, Assignment, User, Submission } from "@/types";
import { BarChart3, BookOpen, Download } from "lucide-react";

// Mock Data
const mockInstructorCourses: Course[] = [
  { id: "csc101", code: "CSC101", name: "Intro to Computer Science", credits: 3, department: "Computer Science" },
  { id: "mat102", code: "MAT102", name: "Calculus for Engineers", credits: 4, department: "Mathematics" },
  { id: "eng201", code: "ENG201", name: "Technical Communication", credits: 2, department: "General Studies" },
];

const mockStudents: User[] = [
  { id: "stu1", name: "Aisha Bello", studentId: "SIAT/CSC/001", email:"a@b.com" },
  { id: "stu2", name: "Yusuf Ahmed", studentId: "SIAT/CSC/002", email:"y@a.com" },
  { id: "stu3", name: "Fatima Ibrahim", studentId: "SIAT/MAT/001", email:"f@i.com" },
  { id: "stu4", name: "Musa Aliyu", studentId: "SIAT/ENG/001", email:"m@a.com"},
];

const mockAssignmentsForCourses: { [courseId: string]: Assignment[] } = {
  "csc101": [
    { id: "asg1_csc101", courseCode: "CSC101", courseName:"Intro to CS", title: "Algorithm Basics", dueDate: "2024-08-15T23:59:00.000Z", description: "", status: "Graded", totalMarks: 20 },
    { id: "asg2_csc101", courseCode: "CSC101", courseName:"Intro to CS", title: "Data Structures Quiz", dueDate: "2024-09-01T23:59:00.000Z", description: "", status: "Graded", totalMarks: 30 },
  ],
  "mat102": [
    { id: "asg1_mat102", courseCode: "MAT102", courseName:"Calculus", title: "Derivatives Practice", dueDate: "2024-08-20T23:59:00.000Z", description: "", status: "Graded", totalMarks: 40 },
  ],
  "eng201": [
     { id: "asg1_eng201", courseCode: "ENG201", courseName:"Tech Comm", title: "Report Writing", dueDate: "2024-08-25T23:59:00.000Z", description: "", status: "Graded", totalMarks: 100 },
  ]
};

const mockGrades: { [studentId_assignmentId: string]: string } = {
  "stu1_asg1_csc101": "18/20",
  "stu1_asg2_csc101": "25/30",
  "stu2_asg1_csc101": "15/20",
  "stu2_asg2_csc101": "22/30",
  "stu3_asg1_mat102": "35/40",
  "stu4_asg1_eng201": "88/100",
};

// This is a simplified mock. A real app would filter students by course enrollment.
const mockStudentsPerCourse: { [courseId: string]: User[] } = {
    "csc101": [mockStudents[0], mockStudents[1]],
    "mat102": [mockStudents[2]],
    "eng201": [mockStudents[3], mockStudents[0]], // Aisha also takes ENG201
}


export default function GradebookPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Gradebook - Instructor Dashboard';
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const course = mockInstructorCourses.find(c => c.id === selectedCourseId) || null;
      setCurrentCourse(course);
      setCourseAssignments(mockAssignmentsForCourses[selectedCourseId] || []);
      setEnrolledStudents(mockStudentsPerCourse[selectedCourseId] || []);
    } else {
      setCurrentCourse(null);
      setCourseAssignments([]);
      setEnrolledStudents([]);
    }
  }, [selectedCourseId]);
  
  const calculateStudentTotal = (studentId: string): string => {
    let totalScore = 0;
    let totalPossible = 0;
    courseAssignments.forEach(asg => {
        const grade = mockGrades[`${studentId}_${asg.id}`];
        if (grade && asg.totalMarks) {
            const parts = grade.split('/');
            if (parts.length === 2) {
                totalScore += parseInt(parts[0]);
                totalPossible += parseInt(parts[1]);
            }
        }
    });
    return totalPossible > 0 ? `${totalScore}/${totalPossible}` : "-";
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Gradebook</CardTitle>
          <CardDescription>Manage and view student grades for your courses.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-primary">Select Course</CardTitle>
            <CardDescription>Choose a course to view its gradebook.</CardDescription>
          </div>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select a course..." />
            </SelectTrigger>
            <SelectContent>
              {mockInstructorCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        {selectedCourseId && currentCourse && (
          <CardContent>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Grades for: {currentCourse.name}</h3>
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/> Export Grades (CSV)</Button>
            </div>
            {courseAssignments.length > 0 && enrolledStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Student Name</TableHead>
                      <TableHead className="min-w-[100px]">Student ID</TableHead>
                      {courseAssignments.map(asg => (
                        <TableHead key={asg.id} className="text-center min-w-[120px]">
                          {asg.title}<br/>
                          <span className="text-xs text-muted-foreground">(Max: {asg.totalMarks})</span>
                        </TableHead>
                      ))}
                      <TableHead className="text-center font-semibold min-w-[100px]">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrolledStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        {courseAssignments.map(asg => (
                          <TableCell key={asg.id} className="text-center">
                            {mockGrades[`${student.id}_${asg.id}`] || "-"}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">{calculateStudentTotal(student.id)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4"/>
                <p>No assignments or students found for this course yet.</p>
                <p className="text-sm">Add assignments and enroll students to see the gradebook.</p>
              </div>
            )}
          </CardContent>
        )}
        {!selectedCourseId && (
            <CardContent className="text-center py-10 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4"/>
                <p>Please select a course to view its gradebook.</p>
            </CardContent>
        )}
      </Card>
    </div>
  );
}
