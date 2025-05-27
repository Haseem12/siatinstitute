
"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Announcement } from "@/types";

// Mock data for existing announcements
const mockAdminAnnouncements: Announcement[] = [
  { id: "admin_an1", title: "System Maintenance Scheduled", content: "The student portal will be down for maintenance on Sunday from 2 AM to 4 AM.", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), author: "Admin Team", category: "General", targetAudience: "all" },
  { id: "admin_an2", title: "New Scholarship Opportunities", content: "Several new scholarship programs are available for eligible students. Check the notice board for details.", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), author: "Admin Team", category: "Academic", targetAudience: "students" },
];

export default function AdminAnnouncementsPage() {
  useState(() => { if (typeof document !== 'undefined') document.title = 'Post Announcement - Admin'; }, []);
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAdminAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Announcement['category']>("General");
  const [targetAudience, setTargetAudience] = useState<Announcement['targetAudience']>("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
        toast({variant: "destructive", title: "Error", description: "Title and content are required."});
        return;
    }
    const newAnnouncement: Announcement = {
        id: `admin_an${announcements.length + 1}`,
        title,
        content,
        date: new Date().toISOString(),
        author: "Admin Team", // Or get current admin user
        category,
        targetAudience,
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    toast({title: "Announcement Posted", description: "Your announcement has been posted successfully."});
    setTitle("");
    setContent("");
    setCategory("General");
    setTargetAudience("all");
  };

  return (
    <div className="p-4 space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">Post New Announcement</CardTitle>
                <CardDescription>Create and broadcast important information to the institute community.</CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="announcementTitle">Title</Label>
                        <Input id="announcementTitle" value={title} onChange={(e) => setTitle(e.target.value)} required 
                               placeholder="Enter announcement title"/>
                    </div>
                    <div>
                        <Label htmlFor="announcementContent">Content</Label>
                        <Textarea id="announcementContent" value={content} onChange={(e) => setContent(e.target.value)} rows={6} required 
                                  placeholder="Enter the full content of the announcement..."/>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="announcementCategory">Category</Label>
                            <Select value={category} onValueChange={(value) => setCategory(value as Announcement['category'])}>
                                <SelectTrigger id="announcementCategory">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="Academic">Academic</SelectItem>
                                    <SelectItem value="Events">Events</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="targetAudience">Target Audience</Label>
                             <Select value={targetAudience} onValueChange={(value) => setTargetAudience(value as Announcement['targetAudience'])}>
                                <SelectTrigger id="targetAudience">
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="students">Students Only</SelectItem>
                                    <SelectItem value="instructors">Instructors Only</SelectItem>
                                    {/* Add more specific targets if needed, e.g., by department */}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full md:w-auto">Post Announcement</Button>
               </form>
            </CardContent>
        </Card>
         <Card className="shadow-md">
            <CardHeader><CardTitle className="text-xl text-primary">Previously Posted Announcements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                {announcements.length === 0 && <p className="text-muted-foreground">No announcements posted yet.</p>}
                {announcements.map(ann => (
                    <div key={ann.id} className="p-3 border rounded-md bg-muted/30">
                        <h4 className="font-semibold">{ann.title}</h4>
                        <p className="text-xs text-muted-foreground">
                            Category: {ann.category} | Audience: {ann.targetAudience} | Posted: {new Date(ann.date).toLocaleDateString()} by {ann.author}
                        </p>
                        <p className="text-sm mt-1 line-clamp-2">{ann.content}</p>
                    </div>
                ))}
            </CardContent>
         </Card>
    </div>
  );
}
