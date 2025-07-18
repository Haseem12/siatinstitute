
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Circle, BookOpen, Loader2, PlayCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { NewIntakeApplicationData } from '@/types';
import { mapRawApplicantData } from '@/lib/mapRawApplicantData';

// Mock content for the self-paced learning modules
const courseModules = [
  {
    id: 'module1',
    title: 'Module 1: Introduction to the Field',
    description: 'Get an overview of the fundamental concepts, history, and importance of this field of study.',
    content: 'This introductory module covers the core principles that will form the foundation of your learning journey. We will explore the historical context and the key figures who have shaped the discipline. By the end of this module, you will be able to define the scope of the field and understand its relevance in today\'s world.',
    resources: [
      { type: 'video', name: 'Introductory Lecture (25 mins)', link: '#' },
      { type: 'reading', name: 'Chapter 1: The Basics.pdf', link: '#' },
    ],
  },
  {
    id: 'module2',
    title: 'Module 2: Core Concepts and Theories',
    description: 'Dive deep into the essential theories and frameworks that govern this subject.',
    content: 'Building on the introduction, this module examines the primary theories and conceptual models. You will learn to analyze and apply these theories to practical scenarios. Key topics include [Theory A], [Framework B], and their applications.',
    resources: [
      { type: 'video', name: 'Lecture on Core Theories (45 mins)', link: '#' },
      { type: 'reading', name: 'Essential Readings Pack.pdf', link: '#' },
    ],
  },
  {
    id: 'module3',
    title: 'Module 3: Practical Application & Case Studies',
    description: 'Apply your knowledge to real-world scenarios and case studies.',
    content: 'This module is all about practical application. We will analyze several key case studies to see how the theories and concepts you\'ve learned are applied in practice. This hands-on approach will help solidify your understanding and develop critical thinking skills.',
    resources: [
      { type: 'video', name: 'Case Study Analysis Workshop (60 mins)', link: '#' },
      { type: 'reading', name: 'Case Study Files.zip', link: '#' },
    ],
  },
  {
    id: 'module4',
    title: 'Module 4: Advanced Topics',
    description: 'Explore advanced concepts and emerging trends in the field.',
    content: 'In this final module, we push the boundaries of your knowledge by exploring advanced topics and looking at the future of the field. Topics include cutting-edge research, new technologies, and contemporary debates shaping the industry.',
    resources: [
      { type: 'video', name: 'Guest Lecture on Future Trends (50 mins)', link: '#' },
      { type: 'reading', name: 'Advanced Research Papers.pdf', link: '#' },
    ],
  },
];


export default function MyLearningPage() {
  const { toast } = useToast();
  const [applicantData, setApplicantData] = useState<NewIntakeApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const fetchProfileData = useCallback(async (email: string) => {
    try {
      const response = await fetch(`https://sajfoods.net/api/siat/get-applicant-details-by-email.php?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error("Failed to fetch profile data.");
      const result = await response.json();
      if (result.success && result.data) {
        setApplicantData(mapRawApplicantData(result.data));
      } else {
        throw new Error(result.message || "Could not retrieve valid profile data.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Profile Load Error", description: error.message });
      setApplicantData(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    document.title = "My Learning - SIAT Institute";
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      fetchProfileData(userEmail);
    } else {
      setIsLoading(false);
      toast({ variant: "destructive", title: "Error", description: "Could not find user email. Please log in again." });
    }

    // Load progress from localStorage
    const savedProgress = localStorage.getItem('learningProgress');
    if (savedProgress) {
      setCompletedModules(new Set(JSON.parse(savedProgress)));
    }
  }, [fetchProfileData, toast]);

  const toggleModuleCompletion = (moduleId: string) => {
    setCompletedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      // Save progress to localStorage
      localStorage.setItem('learningProgress', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const progressPercentage = useMemo(() => {
    if (courseModules.length === 0) return 0;
    return (completedModules.size / courseModules.length) * 100;
  }, [completedModules]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading your learning dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <BookOpen className="h-7 w-7" /> My Learning Dashboard
          </CardTitle>
          <CardDescription>
            Self-paced learning for your chosen program: 
            <span className="font-semibold text-accent"> {applicantData?.preferredProgram || '...'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">Course Progress: {completedModules.size} of {courseModules.length} modules completed</p>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        {courseModules.map((module) => {
          const isCompleted = completedModules.has(module.id);
          return (
            <AccordionItem value={module.id} key={module.id} className="bg-card border rounded-lg shadow-md hover:shadow-lg data-[state=open]:shadow-xl transition-shadow">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center gap-4 w-full">
                    {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                    ) : (
                        <Circle className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-grow text-left">
                        <h3 className="font-semibold text-base text-foreground">{module.title}</h3>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="prose prose-sm max-w-none text-foreground/90 border-t pt-4">
                  <p>{module.content}</p>
                   <h4 className="font-semibold mt-4 mb-2">Resources:</h4>
                  <ul className="space-y-2">
                    {module.resources.map(res => (
                       <li key={res.name}>
                        <a href={res.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent hover:underline">
                          {res.type === 'video' ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          {res.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                 <div className="mt-6 text-right">
                    <Button onClick={() => toggleModuleCompletion(module.id)} variant={isCompleted ? "outline" : "default"} className={isCompleted ? "border-primary text-primary" : "bg-primary text-primary-foreground"}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </Button>
                 </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
