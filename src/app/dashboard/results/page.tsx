"use client"; // Added this
import * as React from "react"; // Added this
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Percent, Loader2 } from "lucide-react"; // Added Loader2
import type { AcademicResult } from "@/types";
// import type { Metadata } from 'next'; // Metadata handled by useEffect

// export const metadata: Metadata = { // Cannot be used like this
//   title: 'Academic Results - Arewa Scholar Hub',
// };

// Mock Data remains
const mockResultsData: AcademicResult[] = [
  { id: "r1", courseCode: "CSC201", courseName: "Intro to Programming", grade: "A", score: 85, credits: 3, semester: "First Semester 2022/2023", session: "2022/2023" },
  { id: "r2", courseCode: "MAT201", courseName: "Linear Algebra", grade: "B+", score: 72, credits: 3, semester: "First Semester 2022/2023", session: "2022/2023" },
  { id: "r3", courseCode: "ENG203", courseName: "Communication Skills", grade: "A-", score: 78, credits: 2, semester: "First Semester 2022/2023", session: "2022/2023" },
  { id: "r4", courseCode: "CSC202", courseName: "Discrete Mathematics", grade: "B", score: 68, credits: 3, semester: "Second Semester 2022/2023", session: "2022/2023" },
  { id: "r5", courseCode: "PHY200", courseName: "General Physics", grade: "C+", score: 58, credits: 3, semester: "Second Semester 2022/2023", session: "2022/2023" },
  { id: "r6", courseCode: "GST211", courseName: "Nigerian Peoples and Culture", grade: "A", score: 82, credits: 2, semester: "Second Semester 2022/2023", session: "2022/2023" },
];

const calculateGPA = (results: AcademicResult[]): string => {
  const gradeToPoint = (grade: string, score?: number): number => {
    if (score) { if (score >= 70) return 5; if (score >= 60) return 4; if (score >= 50) return 3; if (score >= 45) return 2; if (score >= 40) return 1; return 0; }
    if (grade.startsWith("A")) return 5; if (grade.startsWith("B")) return 4; if (grade.startsWith("C")) return 3; if (grade.startsWith("D")) return 2; if (grade.startsWith("E")) return 1; return 0;
  };
  let totalPoints = 0; let totalCredits = 0;
  results.forEach(result => { totalPoints += gradeToPoint(result.grade, result.score) * result.credits; totalCredits += result.credits; });
  if (totalCredits === 0) return "N/A";
  return (totalPoints / totalCredits).toFixed(2);
};

export default function ResultsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [results, setResults] = React.useState<AcademicResult[]>([]);
  const [selectedSemester, setSelectedSemester] = React.useState<string>("");

  React.useEffect(() => {
    document.title = 'Academic Results - SIAT Institute';
    const timer = setTimeout(() => {
      setResults(mockResultsData);
      const uniqueSemestersList = Array.from(new Set(mockResultsData.map(r => r.semester))).sort().reverse();
      if (uniqueSemestersList.length > 0) {
        setSelectedSemester(uniqueSemestersList[0]);
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const overallGPA = React.useMemo(() => calculateGPA(results), [results]);
  const uniqueSemesters = React.useMemo(() => Array.from(new Set(results.map(r => r.semester))).sort().reverse(), [results]);
  
  const filteredResults = React.useMemo(() => {
    if (!selectedSemester) return results;
    return results.filter(r => r.semester === selectedSemester);
  }, [results, selectedSemester]);

  const lastSemesterGPA = React.useMemo(() => {
    if (uniqueSemesters.length > 0) {
        const lastSemResults = results.filter(r => r.semester === uniqueSemesters[0]);
        return calculateGPA(lastSemResults);
    }
    return "N/A";
  }, [results, uniqueSemesters]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Academic Results</CardTitle>
          <CardDescription>View your course scores and academic performance.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Overall CGPA</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{overallGPA}</div><p className="text-xs text-muted-foreground">Based on all completed semesters.</p></CardContent></Card>
        <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Last Semester GPA</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{lastSemesterGPA}</div><p className="text-xs text-muted-foreground">For {uniqueSemesters[0] || 'N/A'}</p></CardContent></Card>
        <Card className="shadow-md"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Courses Passed</CardTitle><Percent className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{results.filter(r => (r.score ? r.score >= 40 : !r.grade.includes("F"))).length} / {results.length}</div><p className="text-xs text-muted-foreground">Total courses taken so far.</p></CardContent></Card>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div><CardTitle className="text-xl text-primary">Detailed Results</CardTitle><CardDescription>Filter by semester to view specific results.</CardDescription></div>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full md:w-[280px]"><SelectValue placeholder="Select Semester" /></SelectTrigger>
                <SelectContent>{uniqueSemesters.map(semester => (<SelectItem key={semester} value={semester}>{semester}</SelectItem>))}</SelectContent>
            </Select>
        </CardHeader>
        <CardContent><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Course Code</TableHead><TableHead>Course Name</TableHead><TableHead className="text-center">Credits</TableHead><TableHead className="text-center">Score</TableHead><TableHead className="text-center">Grade</TableHead><TableHead>Semester</TableHead></TableRow></TableHeader><TableBody>
          {filteredResults.map((result) => (<TableRow key={result.id}><TableCell className="font-medium">{result.courseCode}</TableCell><TableCell>{result.courseName}</TableCell><TableCell className="text-center">{result.credits}</TableCell><TableCell className="text-center">{result.score !== undefined ? result.score : "-"}</TableCell><TableCell className="text-center font-semibold text-primary">{result.grade}</TableCell><TableCell className="text-sm text-muted-foreground">{result.semester}</TableCell></TableRow>))}
          {filteredResults.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No results found for the selected semester.</TableCell></TableRow>)}
        </TableBody></Table></div></CardContent>
      </Card>
      <CardDescription className="text-xs text-center text-muted-foreground p-4">Disclaimer: These results are for informational purposes only. Official transcripts should be obtained from the registry.</CardDescription>
    </div>
  );
}
