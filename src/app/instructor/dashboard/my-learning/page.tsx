
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookUser, CalendarDays, Clock, User } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { useState, useEffect } from "react";

// This is a client component, so metadata object isn't used directly here.
// Set document title in useEffect.

// Mock data for courses the instructor is enrolled in
const mockEnrolledCourses = [
  {
    id: "PD001", // Course ID
    classIdForLink: "PD001-SESS1", // ID to link to student class detail view
    title: "Advanced Pedagogy Workshop",
    instructorName: "Dr. Evelyn Reed (Lead Facilitator)", // Instructor of *this* course
    description: "A workshop focusing on modern teaching methodologies and student engagement.",
    category: "Professional Development",
    duration: "4 Weeks",
    nextSession: "Starts Aug 5, 2024",
  },
  {
    id: "TECH101",
    classIdForLink: "TECH101-FALL24",
    title: "Introduction to AI in Education",
    instructorName: "Prof. Kenji Tanaka",
    description: "Explore the fundamentals of AI and its applications in educational settings.",
    category: "Technology Training",
    duration: "6 Weeks",
    nextSession: "Currently in Progress",
  },
  {
    id: "LDRSHP202",
    classIdForLink: "LDRSHP202-Q3",
    title: "Educational Leadership Seminar",
    instructorName: "Ms. Maria Gonzalez",
    description: "Develop leadership skills tailored for academic environments and team management.",
    category: "Leadership",
    duration: "Ongoing",
    nextSession: "Join anytime modules",
  },
];

export default function MyLearningPage() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = "My Learning - Instructor Dashboard";
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">My Learning</CardTitle>
          <CardDescription>Courses and professional development programs you are enrolled in.</CardDescription>
        </CardHeader>
      </Card>

      {mockEnrolledCourses.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <BookUser className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            You are not currently enrolled in any courses.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockEnrolledCourses.map((course) => (
          <Card key={course.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{course.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Facilitator: {course.instructorName}
              </CardDescription>
              <CardDescription className="text-xs pt-1 text-accent font-medium">{course.category}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Duration: {course.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Session: {course.nextSession}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href={`/dashboard/classes/details/${course.classIdForLink}`}>
                  View Course Details <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
