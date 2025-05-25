import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, Percent } from "lucide-react";
import type { AcademicResult } from "@/types";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academic Results - Arewa Scholar Hub',
};

// Mock Data
const mockResults: AcademicResult[] = [
  { id: "r1", courseCode: "CSC201", courseName: "Intro to Programming", grade: "A", score: 85, credits: 3, semester: "First Semester 2022/2023", session: "2022/2023" },
  { id: "r2", courseCode: "MAT201", courseName: "Linear Algebra", grade: "B+", score: 72, credits: 3, semester: "First Semester 2022/2023", session: "2022/2023" },
  { id: "r3", courseCode: "ENG203", courseName: "Communication Skills", grade: "A-", score: 78, credits: 2, semester: "First Semester 2022/2023", session: "2022/2023" },
  { id: "r4", courseCode: "CSC202", courseName: "Discrete Mathematics", grade: "B", score: 68, credits: 3, semester: "Second Semester 2022/2023", session: "2022/2023" },
  { id: "r5", courseCode: "PHY200", courseName: "General Physics", grade: "C+", score: 58, credits: 3, semester: "Second Semester 2022/2023", session: "2022/2023" },
  { id: "r6", courseCode: "GST211", courseName: "Nigerian Peoples and Culture", grade: "A", score: 82, credits: 2, semester: "Second Semester 2022/2023", session: "2022/2023" },
];

const calculateGPA = (results: AcademicResult[]): string => {
  // Simplified GPA calculation (A=5, B=4, C=3, D=2, E=1, F=0)
  // This needs to be adapted to the specific grading system of the institution.
  const gradeToPoint = (grade: string, score?: number): number => {
    if (score) {
        if (score >= 70) return 5;
        if (score >= 60) return 4;
        if (score >= 50) return 3;
        if (score >= 45) return 2;
        if (score >= 40) return 1;
        return 0;
    }
    // Fallback for letter grades if score is not present
    if (grade.startsWith("A")) return 5;
    if (grade.startsWith("B")) return 4;
    if (grade.startsWith("C")) return 3;
    if (grade.startsWith("D")) return 2;
    if (grade.startsWith("E")) return 1;
    return 0;
  };

  let totalPoints = 0;
  let totalCredits = 0;

  results.forEach(result => {
    totalPoints += gradeToPoint(result.grade, result.score) * result.credits;
    totalCredits += result.credits;
  });

  if (totalCredits === 0) return "N/A";
  return (totalPoints / totalCredits).toFixed(2);
};

const overallGPA = calculateGPA(mockResults);
const lastSemesterResults = mockResults.filter(r => r.semester === "Second Semester 2022/2023");
const lastSemesterGPA = calculateGPA(lastSemesterResults);

export default function ResultsPage() {
  // For now, display all results. Filtering by session/semester can be added.
  const currentResults = mockResults; 
  const uniqueSemesters = Array.from(new Set(mockResults.map(r => r.semester))).sort().reverse();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Academic Results</CardTitle>
          <CardDescription>View your course scores and academic performance.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall CGPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{overallGPA}</div>
            <p className="text-xs text-muted-foreground">
              Based on all completed semesters.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Semester GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{lastSemesterGPA}</div>
            <p className="text-xs text-muted-foreground">
              For {lastSemesterResults[0]?.semester || 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Passed</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mockResults.filter(r => (r.score ? r.score >= 40 : !r.grade.includes("F"))).length} / {mockResults.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total courses taken so far.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
                <CardTitle className="text-xl text-primary">Detailed Results</CardTitle>
                <CardDescription>Filter by semester to view specific results.</CardDescription>
            </div>
            <Select defaultValue={uniqueSemesters[0]}>
                <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                    {uniqueSemesters.map(semester => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead className="text-center">Credits</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead>Semester</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.courseCode}</TableCell>
                    <TableCell>{result.courseName}</TableCell>
                    <TableCell className="text-center">{result.credits}</TableCell>
                    <TableCell className="text-center">{result.score !== undefined ? result.score : "-"}</TableCell>
                    <TableCell className="text-center font-semibold text-primary">{result.grade}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{result.semester}</TableCell>
                  </TableRow>
                ))}
                 {currentResults.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No results found for the selected semester.</TableCell>
                    </TableRow>
                 )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <CardDescription className="text-xs text-center text-muted-foreground p-4">
        Disclaimer: These results are for informational purposes only. Official transcripts should be obtained from the registry.
      </CardDescription>
    </div>
  );
}
