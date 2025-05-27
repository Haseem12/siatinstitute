
"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Placeholder page

export default function InstructorAnnouncementsPage() {
  useState(() => { if (typeof document !== 'undefined') document.title = 'Post Announcement - Instructor'; }, []);
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetCourse, setTargetCourse] = useState("all"); // 'all' or a course ID

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
        toast({variant: "destructive", title: "Error", description: "Title and content are required."});
        return;
    }
    // Mock submission
    console.log("New Announcement by instructor:", { title, content, targetCourse });
    toast({title: "Announcement Posted", description: "Your announcement has been posted."});
    setTitle("");
    setContent("");
    setTargetCourse("all");
  };

  return (
    <div className="p-4 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">Post New Announcement</CardTitle>
                <CardDescription>Share important information with your students.</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="announcementTitle">Title</Label>
                        <Input id="announcementTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="announcementContent">Content</Label>
                        <Textarea id="announcementContent" value={content} onChange={(e) => setContent(e.target.value)} rows={5} required />
                    </div>
                    <div>
                        <Label htmlFor="targetCourse">Target Course (Optional)</Label>
                        <Select value={targetCourse} onValueChange={setTargetCourse}>
                            <SelectTrigger id="targetCourse">
                                <SelectValue placeholder="Select a course or all" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All My Students</SelectItem>
                                <SelectItem value="CSC101">CSC101 - Intro to CS</SelectItem> {/* Mock Course */}
                                <SelectItem value="MAT102">MAT102 - Calculus</SelectItem> {/* Mock Course */}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Post Announcement</Button>
               </form>
            </CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Previously Posted Announcements</CardTitle></CardHeader>
            <CardContent>
                <p className="text-muted-foreground">(Mock section - list of past announcements would go here)</p>
            </CardContent>
         </Card>
    </div>
  );
}
