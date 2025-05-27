
"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Edit3, CheckCircle, Send, ExternalLink } from "lucide-react";
import type { Assignment, Submission, Course } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const mockInstructorCourses: Course[] = [
  { id: "csc101", code: "CSC101", name: "Intro to Computer Science", credits: 3 },
  { id: "mat102", code: "MAT102", name: "Calculus for Engineers", credits: 4 },
];

const mockAssignments: Assignment[] = [
  { id: "asg1", courseCode: "CSC101", courseName: "Intro to Computer Science", title: "Algorithm Design Challenge", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), description: "Design and document an algorithm for...", status: "Pending", totalMarks: 50 },
  { id: "asg2", courseCode: "MAT102", courseName: "Calculus for Engineers", title: "Integration Techniques Worksheet", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: "Solve the attached integration problems.", status: "Pending", totalMarks: 100 },
  { id: "asg3", courseCode: "CSC101", courseName: "Intro to Computer Science", title: "Debugging Exercise", dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: "Find and fix bugs in the provided code snippets.", status: "Overdue", totalMarks: 30 },
];

const mockSubmissions: Submission[] = [
  { id: "sub1", assignmentId: "asg1", studentId: "stu1", studentName: "Aisha Bello", submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), fileUrl: "/submissions/aisha_algo.pdf", fileName: "aisha_algo.pdf", grade: "40/50", feedback: "Good effort, some improvements needed in efficiency." },
  { id: "sub2", assignmentId: "asg1", studentId: "stu2", studentName: "Yusuf Ahmed", submittedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), fileUrl: "/submissions/yusuf_algo.docx", fileName: "yusuf_algo.docx" },
  { id: "sub3", assignmentId: "asg2", studentId: "stu3", studentName: "Fatima Ibrahim", submittedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), fileUrl: "/submissions/fatima_integration.pdf", fileName: "fatima_integration.pdf", grade: "88/100", feedback: "Excellent work!" },
  { id: "sub4", assignmentId: "asg3", studentId: "stu1", studentName: "Aisha Bello", submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), fileUrl: "/submissions/aisha_debug.zip", fileName: "aisha_debug.zip", grade: "25/30", feedback: "Well done, most bugs identified." },
];


export default function ViewSubmissionsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'View Submissions - Instructor Dashboard';
    }
  }, []);

  const getSubmissionsForAssignment = (assignmentId: string) => {
    return submissions.filter(sub => sub.assignmentId === assignmentId);
  };

  const handleOpenGradeDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade || "");
    setFeedback(submission.feedback || "");
    setIsGradingDialogOpen(true);
  };

  const handleSaveGrade = () => {
    if (!selectedSubmission) return;
    // Mock saving grade
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === selectedSubmission.id ? { ...sub, grade, feedback } : sub
      )
    );
    toast({ title: "Grade Saved", description: `Grade and feedback for ${selectedSubmission.studentName} updated.` });
    setIsGradingDialogOpen(false);
    setSelectedSubmission(null); // Clear selection
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">View Student Submissions</CardTitle>
          <CardDescription>Review and grade assignments submitted by students for your courses.</CardDescription>
        </CardHeader>
      </Card>

      {assignments.map(assignment => (
        <Card key={assignment.id} className="shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <CardTitle className="text-xl text-primary">{assignment.title}</CardTitle>
                    <CardDescription>{assignment.courseName} ({assignment.courseCode}) - Due: {new Date(assignment.dueDate).toLocaleDateString()}</CardDescription>
                </div>
                <Badge variant={assignment.status === "Overdue" ? "destructive" : "secondary"}>{assignment.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {getSubmissionsForAssignment(assignment.id).length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSubmissionsForAssignment(assignment.id).map(submission => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.studentName}</TableCell>
                        <TableCell>{new Date(submission.submittedDate).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" asChild className="px-0">
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" download={submission.fileName}>
                              <Download className="mr-1 h-3 w-3" /> {submission.fileName}
                            </a>
                          </Button>
                        </TableCell>
                        <TableCell>{submission.grade || "Not Graded"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleOpenGradeDialog(submission)}>
                            <Edit3 className="mr-1 h-3 w-3" /> {submission.grade ? "Edit Grade" : "Grade"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">No submissions yet for this assignment.</p>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Grade Submission: {selectedSubmission?.studentName}</DialogTitle>
            <DialogDescription>
              Assignment: {assignments.find(a => a.id === selectedSubmission?.assignmentId)?.title}
              <br />
              File: <a href={selectedSubmission?.fileUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{selectedSubmission?.fileName} <ExternalLink className="inline h-3 w-3"/></a>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="gradeInput">Grade (e.g., 85/100 or A)</Label>
              <Input id="gradeInput" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder={`Max ${assignments.find(a=>a.id === selectedSubmission?.assignmentId)?.totalMarks || 'N/A'}`} />
            </div>
            <div>
              <Label htmlFor="feedbackInput">Feedback</Label>
              <Textarea id="feedbackInput" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Provide constructive feedback..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveGrade} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Send className="mr-2 h-4 w-4" /> Save Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
