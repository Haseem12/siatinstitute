import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BellRing, CalendarDays, Info } from "lucide-react";
import type { Announcement } from "@/types";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Announcements - Arewa Scholar Hub',
};

// Mock Data
const mockAnnouncements: Announcement[] = [
  { id: "an1", title: "Mid-Semester Break Schedule", content: "The mid-semester break will commence on Monday, 15th July and end on Friday, 19th July. Classes resume Monday, 22nd July.", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), category: "Academic", author: "Academic Office" },
  { id: "an2", title: "Library System Upgrade", content: "Please note that the library's online portal will be down for maintenance on Saturday, 6th July from 9 AM to 5 PM for a system upgrade.", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), category: "General", author: "University Librarian" },
  { id: "an3", title: "Call for Volunteers: Annual Tech Fair", content: "We are looking for student volunteers for the upcoming Annual Tech Fair. Sign up at the Student Affairs office by 10th July.", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), category: "Events", author: "Tech Fair Committee" },
  { id: "an4", title: "Important Notice: Course Registration Deadline Extended", content: "The deadline for course registration for the upcoming semester has been extended to Friday, 12th July. Please ensure all registrations are completed by then.", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), category: "Academic", author: "Registrar" },
];

const getCategoryIcon = (category?: Announcement["category"]) => {
  switch (category) {
    case "Academic": return <Info className="h-4 w-4 text-primary" />;
    case "Events": return <CalendarDays className="h-4 w-4 text-accent" />;
    default: return <BellRing className="h-4 w-4 text-muted-foreground" />;
  }
};

const getCategoryBadgeVariant = (category?: Announcement["category"]): "default" | "secondary" | "outline" => {
    switch (category) {
      case "Academic": return "default"; // Primary color
      case "Events": return "secondary"; // Accent color based on theme
      default: return "outline";
    }
  };


export default function AnnouncementsPage() {
  const sortedAnnouncements = [...mockAnnouncements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Notifications & Announcements</CardTitle>
          <CardDescription>Stay updated with the latest news, events, and important information from the institute.</CardDescription>
        </CardHeader>
      </Card>

      {sortedAnnouncements.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {sortedAnnouncements.map((announcement, index) => (
            <AccordionItem value={`item-${index}`} key={announcement.id} className="bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-shrink-0 p-2 bg-accent/10 rounded-full">
                    {getCategoryIcon(announcement.category)}
                  </div>
                  <div className="flex-grow text-left">
                    <h3 className="font-semibold text-base text-foreground">{announcement.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Posted on: {new Date(announcement.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {announcement.author && ` by ${announcement.author}`}
                    </p>
                  </div>
                  {announcement.category && (
                    <Badge variant={getCategoryBadgeVariant(announcement.category)} className="ml-auto hidden sm:inline-flex">{announcement.category}</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <div className="prose prose-sm max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: announcement.content.replace(/\n/g, '<br />') }} />
                 {announcement.category && (
                    <Badge variant={getCategoryBadgeVariant(announcement.category)} className="mt-2 sm:hidden">{announcement.category}</Badge>
                  )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-10 text-center">
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No announcements at the moment.</p>
            <p className="text-sm text-muted-foreground">Please check back later for updates.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
