
export type User = {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatarUrl?: string;
  department?: string;
  level?: string; // e.g. "100 Level", "200 Level"
};

export type Course = {
  id: string;
  code: string; // e.g. CSC101
  name: string; // e.g. Introduction to Computer Science
  credits: number; // e.g. 3
  // Optional fields if needed later
  // description?: string;
  // department?: string;
  // level?: string; // e.g. "100"
  // semester?: "First" | "Second";
  // prerequisites?: string[]; // Array of course codes
};

export type TimetableEntry = {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "11:00"
  courseCode: string;
  courseName: string;
  location: string;
  lecturer?: string;
};

export type Assignment = {
  id: string;
  courseCode: string;
  courseName: string;
  title: string;
  dueDate: string; // ISO date string
  description: string;
  submittedDate?: string; // ISO date string
  grade?: string; // e.g., "A", "75/100"
  feedback?: string;
  fileUrl?: string; 
  status: "Pending" | "Submitted" | "Graded" | "Overdue";
};

export type AcademicResult = {
  id: string;
  courseCode: string;
  courseName: string;
  grade: string; // e.g., "A", "B+", "75"
  score?: number; // e.g. 75
  credits: number;
  semester: string; // e.g., "First Semester 2023/2024"
  session: string; // e.g., "2023/2024"
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  date: string; // ISO date string
  author?: string;
  category?: "General" | "Academic" | "Events";
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // Date for single day event, or start date for multi-day
  endDate?: string; // Optional end date for multi-day events
  type: "Academic" | "Holiday" | "Exam" | "Event";
  description?: string;
};
