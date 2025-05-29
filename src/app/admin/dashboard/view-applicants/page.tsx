
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Users, FileText, Briefcase, CalendarDays, UserCircle } from "lucide-react";
import type { NewIntakeApplicationData } from "@/types";
import { format } from "date-fns";
import Image from "next/image";

// Helper component for displaying application details in the dialog
const ApplicationDetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-muted/50">
    <dt className="text-sm font-medium text-muted-foreground col-span-1">{label}:</dt>
    <dd className="text-sm text-foreground col-span-2">{String(value || "N/A")}</dd>
  </div>
);


export default function ViewApplicantsPage() {
  const [applicants, setApplicants] = React.useState<NewIntakeApplicationData[]>([]);
  const [selectedApplicant, setSelectedApplicant] = React.useState<NewIntakeApplicationData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
        document.title = 'View Applicants - Admin Dashboard';
    }
    if (typeof window !== 'undefined') {
      const storedApplications = localStorage.getItem("newIntakeApplications");
      if (storedApplications) {
        setApplicants(JSON.parse(storedApplications));
      }
    }
  }, []);

  const handleViewDetails = (applicant: NewIntakeApplicationData) => {
    setSelectedApplicant(applicant);
    setIsDetailDialogOpen(true);
  };
  
  const formatDateSafe = (date?: Date | string) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "PPP");
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <Users className="mr-3 h-7 w-7" /> View New Intake Applicants
          </CardTitle>
          <CardDescription>Review applications submitted by prospective students.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Submitted Applications ({applicants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {applicants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No applications submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App. ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program Choice</TableHead>
                    <TableHead>Entry Mode</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicants.map((applicant) => (
                    <TableRow key={applicant.applicationId}>
                      <TableCell className="font-mono text-xs">{applicant.applicationId}</TableCell>
                      <TableCell className="font-medium">{applicant.fullName}</TableCell>
                      <TableCell>{applicant.email}</TableCell>
                      <TableCell>{applicant.preferredProgram}</TableCell>
                      <TableCell>{applicant.entryMode}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(applicant)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedApplicant && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-primary text-xl">Applicant Details: {selectedApplicant.fullName}</DialogTitle>
              <DialogDescription>Application ID: {selectedApplicant.applicationId}</DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-grow overflow-y-auto pr-4 -mr-2">
              <div className="space-y-4 py-2">
                <h3 className="font-semibold text-primary flex items-center gap-2 mt-2"><UserCircle className="h-5 w-5"/>Bio-data</h3>
                {selectedApplicant.photograph && (
                     <div className="my-2">
                        <p className="text-sm font-medium text-muted-foreground col-span-1 mb-1">Photograph:</p>
                        <Image 
                            src={typeof selectedApplicant.photograph.name === 'string' && selectedApplicant.photograph.type?.startsWith('image/') ? URL.createObjectURL(new Blob([], {type: selectedApplicant.photograph.type})) : `https://placehold.co/150x150.png?text=${selectedApplicant.photograph.name || 'Photo'}`} 
                            alt="Applicant Photograph" 
                            width={100} height={100} 
                            className="rounded-md border object-cover shadow-sm"
                            data-ai-hint="applicant photo"
                            // Note: For actual preview from localStorage, you'd need to store image as base64 or use a more complex setup.
                            // This is a simplified representation if only metadata is stored.
                        />
                         <p className="text-xs text-muted-foreground mt-1">{selectedApplicant.photograph.name}</p>
                    </div>
                )}
                <ApplicationDetailItem label="Full Name" value={selectedApplicant.fullName} />
                <ApplicationDetailItem label="Email" value={selectedApplicant.email} />
                <ApplicationDetailItem label="Phone Number" value={selectedApplicant.phoneNumber} />
                <ApplicationDetailItem label="Date of Birth" value={formatDateSafe(selectedApplicant.dateOfBirth)} />
                <ApplicationDetailItem label="Gender" value={selectedApplicant.gender} />
                <ApplicationDetailItem label="Address" value={selectedApplicant.address} />
                <ApplicationDetailItem label="City" value={selectedApplicant.city} />
                <ApplicationDetailItem label="State of Origin" value={selectedApplicant.stateOfOrigin} />
                <ApplicationDetailItem label="Nationality" value={selectedApplicant.nationality} />

                <h3 className="font-semibold text-primary flex items-center gap-2 pt-3 border-t mt-4"><UserCircle className="h-5 w-5"/>Next of Kin</h3>
                <ApplicationDetailItem label="Name" value={selectedApplicant.nextOfKinName} />
                <ApplicationDetailItem label="Phone" value={selectedApplicant.nextOfKinPhone} />
                <ApplicationDetailItem label="Relationship" value={selectedApplicant.nextOfKinRelationship} />

                <h3 className="font-semibold text-primary flex items-center gap-2 pt-3 border-t mt-4"><FileText className="h-5 w-5"/>Qualifications</h3>
                {selectedApplicant.qualifications.map((qual, index) => (
                  <div key={qual.id} className="p-2 my-1 border rounded-md bg-muted/30">
                    <p className="font-medium text-sm">Qualification {index + 1}: {qual.type}</p>
                    <ApplicationDetailItem label="Institution" value={qual.institution} />
                    <ApplicationDetailItem label="Year Awarded" value={qual.yearAwarded} />
                    <ApplicationDetailItem label="Certificate" value={qual.file?.name || "N/A"} />
                  </div>
                ))}

                {selectedApplicant.experiences && selectedApplicant.experiences.length > 0 && (
                  <>
                    <h3 className="font-semibold text-primary flex items-center gap-2 pt-3 border-t mt-4"><Briefcase className="h-5 w-5"/>Work Experience</h3>
                    {selectedApplicant.experiences.map((exp, index) => (
                      <div key={exp.id} className="p-2 my-1 border rounded-md bg-muted/30">
                        <p className="font-medium text-sm">Experience {index + 1}: {exp.role} at {exp.organization}</p>
                        <ApplicationDetailItem label="Duration" value={`${exp.startDate} to ${exp.endDate}`} />
                        <ApplicationDetailItem label="Document" value={exp.file?.name || "N/A"} />
                      </div>
                    ))}
                  </>
                )}

                <h3 className="font-semibold text-primary flex items-center gap-2 pt-3 border-t mt-4"><CalendarDays className="h-5 w-5"/>Program Choice</h3>
                <ApplicationDetailItem label="Preferred Program" value={selectedApplicant.preferredProgram} />
                <ApplicationDetailItem label="Preferred Campus" value={selectedApplicant.preferredCampus} />
                <ApplicationDetailItem label="Entry Mode" value={selectedApplicant.entryMode} />
              </div>
            </ScrollArea>

            <DialogFooter className="mt-auto pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
              {/* Add actions like "Admit Applicant" or "Reject Applicant" here if needed */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

