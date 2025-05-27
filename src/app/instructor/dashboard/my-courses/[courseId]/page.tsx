
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, UploadCloud, FileText, Video, Edit, Trash2 } from "lucide-react";
import type { Course, CourseContent } from "@/types";
import { useToast } from "@/hooks/use-toast";

const mockCourseDetails: Course = {
  id: "CSC101",
  code: "CSC101",
  name: "Introduction to Computer Science",
  credits: 3,
  description: "An introductory course to the fundamental concepts of computer science, including algorithms, data structures, and programming basics.",
  department: "Computer Science",
};

const mockCourseContents: CourseContent[] = [
  { id: "cc1", courseId: "CSC101", title: "Week 1: Introduction", type: "lecture_note", description: "Overview of CS, history, basic terminology.", uploadedDate: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
  { id: "cc2", courseId: "CSC101", title: "Video: Understanding Algorithms", type: "video", contentUrl: "#", uploadedDate: new Date(Date.now() - 4*24*60*60*1000).toISOString() },
  { id: "cc3", courseId: "CSC101", title: "Practice Quiz 1", type: "quiz_link", contentUrl: "#", uploadedDate: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
];


export default function ManageCourseContentPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [newContentTitle, setNewContentTitle] = useState("");
  const [newContentType, setNewContentType] = useState<CourseContent['type']>("lecture_note");
  const [newContentDescription, setNewContentDescription] = useState("");
  const [newContentFile, setNewContentFile] = useState<File | null>(null);

  useEffect(() => {
    // Simulate fetching course details and content
    if (courseId) {
      setCourse(mockCourseDetails); // In real app, fetch based on courseId
      setContents(mockCourseContents.filter(c => c.courseId === courseId));
      document.title = `Manage ${mockCourseDetails.name} - Instructor`;
    }
  }, [courseId]);

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContentTitle || (!newContentDescription && !newContentFile && newContentType !== 'quiz_link')) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide a title and either description or a file." });
      return;
    }
    const newId = `cc${contents.length + 1}`;
    const newCourseContent: CourseContent = {
      id: newId,
      courseId: courseId,
      title: newContentTitle,
      type: newContentType,
      description: newContentType === "lecture_note" ? newContentDescription : undefined,
      contentUrl: newContentType !== "lecture_note" && !newContentFile ? "#" : (newContentFile ? `/uploads/mock_${newContentFile.name}` : undefined),
      uploadedDate: new Date().toISOString(),
    };
    setContents(prev => [...prev, newCourseContent]);
    toast({ title: "Content Added", description: `${newContentTitle} has been added.` });
    // Reset form
    setNewContentTitle("");
    setNewContentType("lecture_note");
    setNewContentDescription("");
    setNewContentFile(null);
  };

  if (!course) {
    return <div className="flex justify-center items-center h-full"><p>Loading course details...</p></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Manage Course: {course.name} ({course.code})</CardTitle>
          <CardDescription>{course.description}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="view-content">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="view-content">View Content</TabsTrigger>
          <TabsTrigger value="add-content">Add New Content</TabsTrigger>
        </TabsList>

        <TabsContent value="view-content">
          <Card>
            <CardHeader><CardTitle className="text-xl text-primary">Existing Course Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {contents.length === 0 && <p className="text-muted-foreground">No content added yet for this course.</p>}
              {contents.map(content => (
                <Card key={content.id} className="bg-muted/50">
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div>
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <CardDescription className="text-xs">Type: {content.type.replace("_", " ")} | Added: {new Date(content.uploadedDate).toLocaleDateString()}</CardDescription>
                    </div>
                     <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary"><Edit className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {content.description && <p className="text-sm mb-2">{content.description}</p>}
                    {content.contentUrl && (
                      <Button variant="link" asChild className="px-0">
                        <a href={content.contentUrl} target="_blank" rel="noopener noreferrer">
                          {content.type === "video" ? <Video className="mr-2 h-4 w-4"/> : <FileText className="mr-2 h-4 w-4"/>}
                          Access Resource
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-content">
          <Card>
            <CardHeader><CardTitle className="text-xl text-primary">Add New Course Content</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddContent} className="space-y-6">
                <div>
                  <label htmlFor="contentTitle" className="block text-sm font-medium mb-1">Content Title</label>
                  <Input id="contentTitle" value={newContentTitle} onChange={(e) => setNewContentTitle(e.target.value)} placeholder="e.g., Week 2 Lecture Notes" required />
                </div>
                <div>
                  <label htmlFor="contentType" className="block text-sm font-medium mb-1">Content Type</label>
                  <select id="contentType" value={newContentType} onChange={(e) => setNewContentType(e.target.value as CourseContent['type'])} className="w-full p-2 border rounded-md bg-background">
                    <option value="lecture_note">Lecture Note (Text)</option>
                    <option value="video">Video Link</option>
                    <option value="quiz_link">Quiz Link</option>
                    <option value="resource">File/Resource (PDF, Docx)</option>
                  </select>
                </div>
                
                {newContentType === "lecture_note" && (
                  <div>
                    <label htmlFor="contentDescription" className="block text-sm font-medium mb-1">Description / Notes</label>
                    <Textarea id="contentDescription" value={newContentDescription} onChange={(e) => setNewContentDescription(e.target.value)} placeholder="Enter notes here..." rows={5}/>
                  </div>
                )}

                {(newContentType === "video" || newContentType === "quiz_link") && (
                  <div>
                    <label htmlFor="contentUrl" className="block text-sm font-medium mb-1">Content URL</label>
                    <Input id="contentUrl" type="url" placeholder="https://example.com/resource" />
                  </div>
                )}

                {newContentType === "resource" && (
                   <div>
                    <label htmlFor="contentFile" className="block text-sm font-medium mb-1">Upload File</label>
                    <Input id="contentFile" type="file" onChange={(e) => setNewContentFile(e.target.files ? e.target.files[0] : null)} className="file:text-accent file:font-semibold"/>
                  </div>
                )}
                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <PlusCircle className="mr-2 h-4 w-4"/> Add Content
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
