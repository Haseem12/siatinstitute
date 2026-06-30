"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Users, CheckCircle, XCircle, Hourglass, Loader2, UserCog, HeartHandshake, BookCopy, GraduationCap, MessageSquare, Printer, RefreshCw } from "lucide-react";
import type { NewIntakeApplicationData } from "@/types";
import { format } from "date-fns";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mapRawApplicantData } from "@/lib/mapRawApplicantData";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Helper component for displaying application details in the dialog
const PreviewItemDisplay: React.FC<{ label: string; value?: string | number | null | React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={cn("flex flex-col sm:flex-row sm:justify-between py-1.5 text-sm border-b border-muted/50", className)}>
    <dt className="font-medium text-muted-foreground min-w-[120px]">{label}:</dt>
    <dd className="text-foreground sm:text-right break-words mt-1 sm:mt-0">{value === undefined || value === null || String(value).trim() === '' ? "N/A" : value}</dd>
  </div>
);

export default function ViewApplicantsPage() {
  const { toast } = useToast();
  const [applicants, setApplicants] = React.useState<NewIntakeApplicationData[]>([]);
  const [selectedApplicant, setSelectedApplicant] = React.useState<NewIntakeApplicationData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [isRejectionReasonDialogOpen, setIsRejectionReasonDialogOpen] = React.useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true); 
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const fetchApplicants = React.useCallback(async () => {
    setIsLoading(true);
    const apiUrl = 'https://sajfoods.com.ng/siat/get-applicant-data.php';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to reach server.");
        
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            const mappedApps = result.data.map(mapRawApplicantData);
            setApplicants(mappedApps);
        } else {
            throw new Error(result.message || "Invalid response from server.");
        }
    } catch (error: any) { 
        console.error("Fetch Error:", error);
        toast({ variant: "destructive", title: "API Fetch Error", description: error.message });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    document.title = 'View Applicants - Admin Dashboard';
    fetchApplicants();
  }, [fetchApplicants]);

  const handleSetAdmissionStatus = async (applicantId: string, status: "Admitted" | "Not Admitted" | "Pending", reason?: string) => {
    setIsUpdatingStatus(true);
    try {
        const response = await fetch('https://sajfoods.com.ng/siat/update-applicant-status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: applicantId, status, rejectionReason: reason })
        });
        const result = await response.json();

        if (result.success) {
            toast({ title: "Status Updated", description: `Applicant status set to ${status}.` });
            await fetchApplicants(); // Refresh list
            setIsDetailDialogOpen(false);
        } else {
            throw new Error(result.message || "Failed to update status.");
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Error", description: error.message });
    } finally {
        setIsUpdatingStatus(false);
        setIsRejectionReasonDialogOpen(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Admitted":
        return <Badge className="bg-primary text-primary-foreground"><CheckCircle className="mr-1 h-3 w-3"/>Admitted</Badge>;
      case "Not Admitted":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Not Admitted</Badge>;
      case "Pending":
        return <Badge variant="secondary" className="bg-yellow-500 text-yellow-900"><Hourglass className="mr-1 h-3 w-3"/>Pending</Badge>;
      default: 
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  if (isLoading && applicants.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading submitted applications...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl font-bold text-primary">Admission Approval</CardTitle>
                <CardDescription>Review and manage prospective students from the `applications` table.</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchApplicants} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh List
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>App. ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map((app) => (
                  <TableRow key={app.applicationId}>
                    <TableCell className="font-mono text-xs">{app.applicationId}</TableCell>
                    <TableCell className="font-medium">{app.fullName}</TableCell>
                    <TableCell className="text-xs">{app.preferredProgram}</TableCell>
                    <TableCell>{getStatusBadge(app.admissionStatus)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedApplicant(app); setIsDetailDialogOpen(true); }}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {applicants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      No applications found in the database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedApplicant && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-primary text-xl">{selectedApplicant.fullName}</DialogTitle>
              <DialogDescription>Reviewing Application: {selectedApplicant.applicationId}</DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                <section>
                    <h3 className="font-semibold text-primary flex items-center gap-2 border-b pb-1 mb-3"><UserCog className="h-4 w-4"/> Personal Information</h3>
                    <div className="flex gap-4 mb-4">
                        <div className="w-24 h-24 relative rounded-md overflow-hidden border">
                            <Image 
                                src={selectedApplicant.photograph?.name ? `https://placehold.co/100x100.png?text=PHOTO` : `https://placehold.co/100x100.png?text=USER`} 
                                alt="Applicant" fill className="object-cover" 
                                data-ai-hint="applicant photo"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <PreviewItemDisplay label="Email" value={selectedApplicant.email} />
                            <PreviewItemDisplay label="Phone" value={selectedApplicant.phoneNumber} />
                        </div>
                    </div>
                    <PreviewItemDisplay label="Gender" value={selectedApplicant.gender} />
                    <PreviewItemDisplay label="Origin" value={`${selectedApplicant.city}, ${selectedApplicant.stateOfOrigin}`} />
                </section>

                <section>
                    <h3 className="font-semibold text-primary flex items-center gap-2 border-b pb-1 mb-3"><GraduationCap className="h-4 w-4"/> Academic Choice</h3>
                    <PreviewItemDisplay label="Program" value={selectedApplicant.preferredProgram} />
                    <PreviewItemDisplay label="Campus" value={selectedApplicant.preferredCampus} />
                    <PreviewItemDisplay label="Entry Mode" value={selectedApplicant.entryMode} />
                </section>

                <section>
                    <h3 className="font-semibold text-primary flex items-center gap-2 border-b pb-1 mb-3"><BookCopy className="h-4 w-4"/> Qualifications</h3>
                    {(selectedApplicant.oLevels || []).length > 0 ? (
                        <div className="space-y-2">
                            {selectedApplicant.oLevels?.map((ol, i) => (
                                <div key={ol.id} className="p-2 bg-muted/50 rounded text-xs">
                                    <strong>Sitting {i+1}: {ol.examType} ({ol.examYear})</strong>
                                    <ul className="grid grid-cols-2 mt-1">
                                        {ol.subjects?.map(s => <li key={s.id}>{s.subject}: {s.grade}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-xs text-muted-foreground">No O-Level data.</p>}
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedApplicant.admissionStatus !== "Admitted" && (
                <Button 
                    className="bg-primary hover:bg-primary/90" 
                    onClick={() => handleSetAdmissionStatus(selectedApplicant.applicationId, "Admitted")}
                    disabled={isUpdatingStatus}
                >
                    {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                    Approve Admission
                </Button>
              )}
              {selectedApplicant.admissionStatus !== "Not Admitted" && (
                <Button 
                    variant="destructive" 
                    onClick={() => setIsRejectionReasonDialogOpen(true)}
                    disabled={isUpdatingStatus}
                >
                    <XCircle className="mr-2 h-4 w-4"/> Decline
                </Button>
              )}
              {selectedApplicant.admissionStatus === "Admitted" && (
                 <Button variant="outline" asChild className="text-accent border-accent">
                    <Link href="/admin/dashboard/generate-admission-letter">
                        <Printer className="mr-2 h-4 w-4" /> Letter Portal
                    </Link>
                 </Button>
              )}
              <DialogClose asChild><Button variant="ghost">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Dialog */}
      <Dialog open={isRejectionReasonDialogOpen} onOpenChange={setIsRejectionReasonDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Reason for Declining</DialogTitle>
                <DialogDescription>Provide a reason for the student.</DialogDescription>
            </DialogHeader>
            <Textarea 
                value={rejectionReasonInput} 
                onChange={(e) => setRejectionReasonInput(e.target.value)} 
                placeholder="e.g. Incomplete credits in core subjects"
                rows={4}
            />
            <DialogFooter>
                <Button variant="destructive" onClick={() => handleSetAdmissionStatus(selectedApplicant!.applicationId, "Not Admitted", rejectionReasonInput)}>
                    Confirm Decline
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}