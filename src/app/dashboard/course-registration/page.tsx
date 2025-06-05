"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Course, User } from "@/types";
import { ClipboardCheck, Printer, AlertTriangle, Loader2 } from "lucide-react";

const MAX_COURSES_TO_REGISTER = 8;

const mockAvailableCourses: Course[] = [
  { id: "gst101", code: "GST101", name: "Use of English I", credits: 2 }, { id: "mat101", code: "MAT101", name: "Algebra", credits: 3 }, { id: "phy101", code: "PHY101", name: "Mechanics & Properties of Matter", credits: 3 }, { id: "chm101", code: "CHM101", name: "General Chemistry I", credits: 3 }, { id: "bio101", code: "BIO101", name: "General Biology I", credits: 3 }, { id: "csc101", code: "CSC101", name: "Intro to Computer Science", credits: 3 }, { id: "gst102", code: "GST102", name: "Nigerian Peoples & Culture", credits: 2 }, { id: "mat102", code: "MAT102", name: "Trigonometry & Geometry", credits: 3 }, { id: "phy102", code: "PHY102", name: "Electricity & Magnetism", credits: 3 }, { id: "chm102", code: "CHM102", name: "General Chemistry II", credits: 3 }, { id: "bio102", code: "BIO102", name: "General Biology II", credits: 3 }, { id: "csc102", code: "CSC102", name: "Intro to Problem Solving", credits: 3 }, { id: "eco101", code: "ECO101", name: "Principles of Economics I", credits: 2 }, { id: "soc101", code: "SOC101", name: "Introduction to Sociology", credits: 2 },
];

const mockStudentDetails: Pick<User, "name" | "studentId" | "department" | "level"> &amp; { session: string } = {
  name: "Aisha Bello", studentId: "SIAT/CSC/001", department: "Computer Science", level: "100 Level", session: "2023/2024 Academic Session",
};

export default function CourseRegistrationPage() {
  const { toast } = useToast();
  const [selectedCourses, setSelectedCourses] = React.useState<Course[]>([]);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = React.useState(false);
  const printContentRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [availableCourses, setAvailableCourses] = React.useState<Course[]>([]);

  React.useEffect(() => {
    document.title = 'Course Registration - SIAT Institute';
    // Simulate fetching data
    const timer = setTimeout(() => {
      setAvailableCourses(mockAvailableCourses);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleCourse = (course: Course) => {
    setSelectedCourses((prevSelected) => {
      const isAlreadySelected = prevSelected.some((c) => c.id === course.id);
      if (isAlreadySelected) {
        return prevSelected.filter((c) => c.id !== course.id);
      } else {
        if (prevSelected.length < MAX_COURSES_TO_REGISTER) {
          return [...prevSelected, course];
        } else {
          toast({ variant: "destructive", title: "Selection Limit Reached", description: `You can only select ${MAX_COURSES_TO_REGISTER} courses.` });
          return prevSelected;
        }
      }
    });
  };

  const totalSelectedCredits = React.useMemo(() => selectedCourses.reduce((sum, course) => sum + course.credits, 0), [selectedCourses]);
  const canProceedToPrint = selectedCourses.length === MAX_COURSES_TO_REGISTER;

  const handlePreviewAndPrint = () => {
    if (!canProceedToPrint) {
      toast({ variant: "destructive", title: "Incomplete Registration", description: `Please select exactly ${MAX_COURSES_TO_REGISTER} courses.` });
      return;
    }
    setIsPrintDialogOpen(true);
  };

  const handleActualPrint = () => {
    const content = printContentRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=800,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Course Registration Slip</title>');
        printWindow.document.write(`<style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background-color:#f2f2f2}.header{text-align:center;margin-bottom:20px}.header h1{margin:0;font-size:20px}.header p{margin:5px 0;font-size:14px}.details p{margin:5px 0;font-size:14px}.footer{margin-top:30px;font-size:12px}.footer .signature{margin-top:40px;border-top:1px solid #000;padding-top:5px;width:200px;text-align:center}.no-print{display:none}</style>`);
        printWindow.document.write('</head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close(); printWindow.focus(); printWindow.print();
      } else {
        toast({ variant: "destructive", title: "Print Error", description: "Could not open print window." });
      }
    } else {
      toast({ variant: "destructive", title: "Print Error", description: "Could not find content to print." });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading course registration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center"><ClipboardCheck className="mr-2 h-7 w-7" /> Course Registration</CardTitle>
          <CardDescription>Select {MAX_COURSES_TO_REGISTER} courses for the current semester. Ensure selections are final before printing.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardDescription>Selected Courses</CardDescription><CardTitle className="text-3xl">{selectedCourses.length} / {MAX_COURSES_TO_REGISTER}</CardTitle></CardHeader><CardContent><Progress value={(selectedCourses.length / MAX_COURSES_TO_REGISTER) * 100} className="h-2" /></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Total Credits Selected</CardDescription><CardTitle className="text-3xl">{totalSelectedCredits}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Credits for chosen courses.</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Status</CardDescription><CardTitle className={`text-xl ${canProceedToPrint ? 'text-primary' : 'text-destructive'}`}>{canProceedToPrint ? "Ready to Print" : `Select ${MAX_COURSES_TO_REGISTER - selectedCourses.length} more`}</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">{canProceedToPrint ? "All required courses selected." : "Complete selection to print."}</p></CardContent></Card>
      </div>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="text-xl text-primary">Available Courses</CardTitle><CardDescription>Check boxes to select courses. Max {MAX_COURSES_TO_REGISTER} courses.</CardDescription></CardHeader>
        <CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead className="w-[50px]">Select</TableHead><TableHead>Course Code</TableHead><TableHead>Course Name</TableHead><TableHead className="text-right">Credits</TableHead></TableRow></TableHeader><TableBody>
          {availableCourses.map((course) => (
            <TableRow key={course.id} data-state={selectedCourses.some(c => c.id === course.id) ? "selected" : ""}>
              <TableCell><Checkbox id={`course-${course.id}`} checked={selectedCourses.some((c) => c.id === course.id)} onCheckedChange={() => handleToggleCourse(course)} disabled={!selectedCourses.some((c) => c.id === course.id) && selectedCourses.length >= MAX_COURSES_TO_REGISTER} aria-label={`Select ${course.name}`} /></TableCell>
              <TableCell className="font-medium">{course.code}</TableCell><TableCell>{course.name}</TableCell><TableCell className="text-right">{course.credits}</TableCell>
            </TableRow>
          ))}
        </TableBody></Table></div></CardContent>
        <CardFooter><Button onClick={handlePreviewAndPrint} disabled={!canProceedToPrint} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"><Printer className="mr-2 h-4 w-4" />Preview &amp; Print Slip</Button></CardFooter>
      </Card>

      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle className="text-primary">Course Registration Slip Preview</DialogTitle><DialogDescription>Review selected courses. This is how your slip will appear.</DialogDescription></DialogHeader>
          <div className="flex-grow overflow-y-auto p-1"><div ref={printContentRef} className="printable-area p-4 border rounded-md bg-white text-black">
            <div className="header text-center mb-6"><img src="/assets/arewa-logo.svg" alt="Institute Logo" className="h-16 w-16 mx-auto mb-2 no-print" data-ai-hint="school logo" /><h1 className="text-xl font-bold">SCHOLARS INSTITUTE OF ARTS &amp; TECHNOLOGY, ZARIA</h1><p className="text-sm">{mockStudentDetails.session}</p><p className="text-lg font-semibold mt-2">COURSE REGISTRATION SLIP</p></div>
            <div className="details grid grid-cols-2 gap-x-4 gap-y-1 mb-4 text-sm"><p><strong>Student Name:</strong> {mockStudentDetails.name}</p><p><strong>Matriculation No:</strong> {mockStudentDetails.studentId}</p><p><strong>Department:</strong> {mockStudentDetails.department}</p><p><strong>Level:</strong> {mockStudentDetails.level}</p></div>
            <Table className="text-sm"><TableHeader><TableRow><TableHead className="w-[100px]">Code</TableHead><TableHead>Course Title</TableHead><TableHead className="text-right w-[80px]">Credits</TableHead></TableRow></TableHeader><TableBody>
              {selectedCourses.map((course) => (<TableRow key={course.id}><TableCell className="font-medium">{course.code}</TableCell><TableCell>{course.name}</TableCell><TableCell className="text-right">{course.credits}</TableCell></TableRow>))}
              <TableRow className="font-bold"><TableCell colSpan={2} className="text-right">Total Credits Registered:</TableCell><TableCell className="text-right">{totalSelectedCredits}</TableCell></TableRow>
            </TableBody></Table>
            <div className="footer mt-10 text-xs"><div className="grid grid-cols-2 gap-8"><div><p>Student's Signature: _________________________</p><p className="mt-1">Date: _________________________</p></div><div><p>HOD's Signature: _________________________</p><p className="mt-1">Date &amp; Stamp: _________________________</p></div></div><p className="text-center mt-6">Ensure this slip is duly signed and submitted to your department.</p></div>
          </div></div>
          <DialogFooter className="mt-auto pt-4 border-t"><DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose><Button onClick={handleActualPrint} className="bg-accent hover:bg-accent/90 text-accent-foreground"><Printer className="mr-2 h-4 w-4" /> Print This Slip</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
