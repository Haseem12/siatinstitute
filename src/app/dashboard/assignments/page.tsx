"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, FileText, CheckCircle, Clock, Download, Loader2 } from "lucide-react";
import type { Assignment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { submitAssignmentAction, type SubmitAssignmentPayload } from "./actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

// Mock Data remains
const mockAssignments: Assignment[] = [
  { id: "as1", courseCode: "CSC301", courseName: "Data Structures", title: "Implement Binary Search Tree", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: "Implement BST operations: insert, delete, search. Submit source code and a report.", status: "Pending" },
  { id: "as2", courseCode: "MAT305", courseName: "Calculus II", title: "Solve Integration Problems", dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: "Solve the attached set of integration problems.", status: "Overdue" },
  { id: "as3", courseCode: "ENG302", courseName: "Technical Writing", title: "Research Paper Draft 1", dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: "Submit the first draft of your research paper.", status: "Pending" },
  { id: "as4", courseCode: "PHY300", courseName: "Modern Physics", title: "Lab Report 3: Quantum Entanglement", dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), submittedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), grade: "A (85/100)", feedback: "Excellent work, well-detailed report.", status: "Graded", fileUrl: "/mock-report.pdf" },
  { id: "as5", courseCode: "GST311", courseName: "Entrepreneurship", title: "Business Plan Proposal", dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: "Submitted", fileUrl: "/mock-proposal.pdf" },
];

const submissionFormSchema = z.object({
  file: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Please select a file."),
  submissionNotes: z.string().optional(),
});
type SubmissionFormValues = z.infer<typeof submissionFormSchema>;


export default function AssignmentsPage() {
  const { toast } = useToast();
  const [assignmentsData, setAssignmentsData] = React.useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAssignment, setSelectedAssignment] = React.useState<Assignment | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    document.title = 'Assignments - SIAT Institute';
    // Simulate fetching data
    const timer = setTimeout(() => {
      setAssignmentsData(mockAssignments);
      setIsLoading(false);
    }, 500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
  });

  const onSubmit = async (data: SubmissionFormValues) => {
    if (!selectedAssignment) return;
    setIsSubmitting(true);

    const file = data.file[0];
    const payload: SubmitAssignmentPayload = {
      assignmentId: selectedAssignment.id,
      studentId: "mockStudent123", 
      file: { name: file.name, size: file.size, type: file.type },
      submissionNotes: data.submissionNotes,
    };

    const result = await submitAssignmentAction(payload);

    if (result.success && result.assignment) {
      toast({ title: "Success", description: result.message });
      setAssignmentsData(prev => prev.map(a => a.id === result.assignment!.id ? result.assignment! : a));
      setIsDialogOpen(false); 
      form.reset();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsSubmitting(false);
  };

  const getStatusBadgeColor = (status: Assignment["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Pending": return "secondary";
      case "Submitted": return "default";
      case "Graded": return "outline";
      case "Overdue": return "destructive";
      default: return "secondary";
    }
  };

  const filterAssignments = (status: Assignment["status"] | "All") => {
    if (status === "All") return assignmentsData;
    return assignmentsData.filter(a => a.status === status);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const daysLeft = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - Date.now();
    if (diff < 0) return "Overdue";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''} left`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Assignments</CardTitle>
          <CardDescription>Manage your coursework, submit assignments, and view your grades.</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="all">All ({assignmentsData.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({filterAssignments("Pending").length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({filterAssignments("Submitted").length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({filterAssignments("Graded").length})</TabsTrigger>
        </TabsList>

        {["all", "pending", "submitted", "graded"].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterAssignments(tabValue === "all" ? "All" : tabValue as Assignment["status"]).map((assignment) => (
                <Card key={assignment.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-primary">{assignment.title}</CardTitle>
                      <Badge variant={getStatusBadgeColor(assignment.status)}>{assignment.status}</Badge>
                    </div>
                    <CardDescription className="text-sm">{assignment.courseName} ({assignment.courseCode})</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{assignment.description}</p>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        Due: {formatDate(assignment.dueDate)} 
                        {assignment.status === "Pending" && <span className="text-destructive ml-1">({daysLeft(assignment.dueDate)})</span>}
                      </div>
                      {assignment.submittedDate && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          Submitted: {formatDate(assignment.submittedDate)}
                        </div>
                      )}
                    </div>
                     {assignment.grade && (
                        <p className="text-sm font-semibold mt-2 text-primary">Grade: {assignment.grade}</p>
                      )}
                      {assignment.feedback && (
                        <p className="text-xs italic text-muted-foreground mt-1">Feedback: {assignment.feedback}</p>
                      )}
                  </CardContent>
                  <CardFooter className="mt-auto">
                    {assignment.status === "Pending" || assignment.status === "Overdue" ? (
                       <Dialog open={isDialogOpen && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                          if (open) setSelectedAssignment(assignment); else {setSelectedAssignment(null); form.reset();}
                          setIsDialogOpen(open);
                       }}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-accent hover:bg-accent/80 text-accent-foreground" onClick={() => setSelectedAssignment(assignment)}>
                            <UploadCloud className="mr-2 h-4 w-4" /> Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px]">
                          <DialogHeader>
                            <DialogTitle className="text-primary">Submit: {selectedAssignment?.title}</DialogTitle>
                            <DialogDescription> Upload your file for {selectedAssignment?.courseName}. Ensure it meets guidelines.</DialogDescription>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                              <FormField control={form.control} name="file" render={({ field: { onChange, value, ...rest } }) => (
                                  <FormItem><FormLabel>Assignment File</FormLabel><FormControl><Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} className="file:text-accent file:font-semibold" /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="submissionNotes" render={({ field }) => (
                                  <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Notes for your lecturer..." {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                                <Button type="submit" className="bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isSubmitting}>
                                  {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : null}{isSubmitting ? "Submitting..." : "Confirm Submission"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    ) : assignment.fileUrl ? (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" /> View Submission
                        </a>
                      </Button>
                    ) : ( <Button variant="outline" className="w-full" disabled> <FileText className="mr-2 h-4 w-4" /> View Details </Button> )}
                  </CardFooter>
                </Card>
              ))}
              {filterAssignments(tabValue === "all" ? "All" : tabValue as Assignment["status"]).length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">No assignments in this category.</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
