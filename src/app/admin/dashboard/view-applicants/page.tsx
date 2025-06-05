
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Users, FileText as FileTextIconLucide, Briefcase, CalendarDays, UserCircle, CheckCircle, XCircle, Hourglass, MessageSquare, Loader2, BookCopy, UserCog, HeartHandshake, GraduationCap } from "lucide-react";
import type { NewIntakeApplicationData, QualificationUpload, ExperienceUpload } from "@/types";
import { format } from "date-fns";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Helper component for displaying application details in the dialog
const ApplicationDetailItem: React.FC<{ label: string; value?: string | number | null | React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-muted/50">
    <dt className="text-sm font-medium text-muted-foreground col-span-1">{label}:</dt>
    <dd className="text-sm text-foreground col-span-2 break-words">{value === undefined || value === null || String(value).trim() === '' ? "N/A" : value}</dd>
  </div>
);

const generateAdmissionNumberForCourse = (program: string | undefined, campus: string | undefined, appId: string | undefined): string => {
  if (!program || !appId) return `TEMP-ADM-${Date.now().toString().slice(-5)}`; // Fallback
  const progCode = program.substring(0, Math.min(program.length, 3)).toUpperCase();
  
  let campusCode = "CAMP";
  if (campus) {
    campusCode = campus.split(' ').map(word => word.substring(0,1)).join('').toUpperCase();
    if (campusCode.length > 3) campusCode = campusCode.substring(0,3);
    if (campusCode.length < 1) campusCode = "DEF";
  }
  
  const appIdSuffix = appId.substring(appId.length - Math.min(4, appId.length));
  const randomDigits = Math.floor(100 + Math.random() * 900); 

  return `SIAT/${progCode}/${campusCode}/${randomDigits}-${appIdSuffix}`;
};


export default function ViewApplicantsPage() {
  const { toast } = useToast();
  const [applicants, setApplicants] = React.useState<NewIntakeApplicationData[]>([]);
  const [selectedApplicant, setSelectedApplicant] = React.useState<NewIntakeApplicationData | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [isRejectionReasonDialogOpen, setIsRejectionReasonDialogOpen] = React.useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true); 
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);


  const mapRawApplicantData = (app: any): NewIntakeApplicationData => ({
    applicationId: String(app.application_id || app.applicationId),
    fullName: app.full_name || app.fullName || `${app.surname || ''} ${app.firstname || ''} ${app.othername || ''}`.trim(),
    email: app.email,
    phoneNumber: app.phone_number || app.phoneNumber,
    dateOfBirth: app.date_of_birth ? new Date(app.date_of_birth) : undefined,
    gender: app.gender,
    address: app.address,
    city: app.city,
    stateOfOrigin: app.state_of_origin || app.stateOfOrigin,
    nationality: app.nationality,
    photograph: app.photograph_name ? { name: app.photograph_name, type: app.photograph_type, size: parseInt(String(app.photograph_size || 0), 10) } : (app.photograph || null),
    nextOfKinName: app.next_of_kin_name || app.nextOfKinName,
    nextOfKinPhone: app.next_of_kin_phone || app.nextOfKinPhone,
    nextOfKinRelationship: app.next_of_kin_relationship || app.nextOfKinRelationship,
    preferredProgram: app.preferred_program || app.preferredProgram,
    preferredCampus: app.preferred_campus || app.preferredCampus,
    entryMode: app.entry_mode || app.entryMode,
    admissionStatus: app.admission_status || app.admissionStatus || "Not Submitted",
    rejectionReason: app.rejection_reason || app.rejectionReason,
    admission_number: app.admission_number || undefined, 
    submitted_at: app.submitted_at ? new Date(app.submitted_at) : undefined,
    
    oLevels: (app.oLevels || []).map((ol: any) => ({
        id: String(ol.id || crypto.randomUUID()),
        examType: ol.exam_type || ol.examType, 
        examYear: ol.exam_year || ol.examYear, 
        examNumber: ol.exam_number || ol.examNumber,
        subjects: (ol.subjects || []).map((s: any) => ({ ...s, id: String(s.id || crypto.randomUUID()) })),
        file: ol.certificate_file_name ? { name: ol.certificate_file_name, type: ol.certificate_file_type, size: parseInt(String(ol.certificate_file_size || 0), 10) } : (ol.file || null),
    })),
    
    aLevels: (app.aLevels || []).map((al: any) => ({
        id: String(al.id || crypto.randomUUID()),
        type: al.qualification_type || al.type, 
        institution: al.institution,
        courseOfStudy: al.course_of_study || al.courseOfStudy, 
        gradeOrClass: al.grade_or_class || al.gradeOrClass,   
        yearAwarded: al.year_awarded || al.yearAwarded,     
        file: al.certificate_file_name ? { name: al.certificate_file_name, type: al.certificate_file_type, size: parseInt(String(al.certificate_file_size || 0), 10) } : (al.file || null),
    })),
    
    experiences: (app.experiences || []).map((exp: any) => ({
        id: String(exp.id || crypto.randomUUID()),
        organization: exp.organization,
        role: exp.role,
        startDate: exp.start_date || exp.startDate,
        endDate: exp.end_date || exp.endDate,
        file: exp.document_file_name ? { name: exp.document_file_name, type: exp.document_file_type, size: parseInt(String(exp.document_file_size || 0), 10) } : (exp.file || null),
    })),
  });


  const fetchApplicants = React.useCallback(async () => {
    setIsLoading(true);
    const apiUrl = 'https://sajfoods.net/api/siat/get-applicant-data.php'; // PLURAL - for all applicants
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            let errorDetailMessage = `Server responded with status: ${response.status} from ${apiUrl}`;
            try {
                const errorData = await response.json();
                errorDetailMessage = errorData.message || errorDetailMessage;
            } catch (jsonError) {
                const responseText = await response.text().catch(() => `Could not read error response body from ${apiUrl}.`);
                errorDetailMessage = `Server Error: ${response.status}. Response from ${apiUrl}: ${responseText.substring(0, 150)}`;
                console.error(`Non-JSON error response from ${apiUrl}:`, responseText);
            }
            console.error("API error when fetching applicants from " + apiUrl + ":", errorDetailMessage);
            toast({ variant: "destructive", title: "Failed to Fetch Applicants", description: errorDetailMessage, duration: 7000 });
            
            const storedApplications = localStorage.getItem("completedApplications"); // This is likely for individual applications, not all.
            if (storedApplications) {
                try {
                    const parsedApps = JSON.parse(storedApplications);
                    const mappedApps = parsedApps.map(mapRawApplicantData);
                    const uniqueApps = mappedApps.filter((applicant, index, self) =>
                      index === self.findIndex((a) => a.applicationId === applicant.applicationId)
                    );
                    if (uniqueApps.length < mappedApps.length) {
                        console.warn("Duplicate application IDs found in localStorage and filtered out. (Admin View All)");
                    }
                    setApplicants(uniqueApps);
                    toast({ variant: "default", title: "Using Local Data", description: `API error (${apiUrl}), loaded applicants from local storage.`, duration: 6000});
                } catch (parseError) {
                    console.error("Failed to parse local applications after API error:", parseError);
                    setApplicants([]);
                    toast({variant: "destructive", title: "Local Data Error", description: "Could not parse local applicant data after API error."});
                }
            } else {
                setApplicants([]); 
            }
        } else { 
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                const mappedApps = result.data.map(mapRawApplicantData);
                const uniqueApps = mappedApps.filter((applicant, index, self) =>
                  index === self.findIndex((a) => a.applicationId === applicant.applicationId)
                );
                if (uniqueApps.length < mappedApps.length) {
                    console.warn("Duplicate application IDs received from API and filtered out. Original:", mappedApps.length, "Unique:", uniqueApps.length, "(Admin View All)");
                }
                setApplicants(uniqueApps);
                toast({ title: "Applicants Loaded", description: `Fetched ${uniqueApps.length} applicants from the server: ${apiUrl}` });
            } else {
                console.error("API did not return a successful list of applicants from " + apiUrl + ":", result.message);
                setApplicants([]);
                toast({ variant: "destructive", title: "Fetch Error", description: result.message || `Could not fetch applicants from ${apiUrl}.` });
            }
        }
    } catch (error: any) { 
        console.error(`Failed to fetch applications from API ${apiUrl} (network/processing error):`, error);
        toast({ variant: "destructive", title: "API Fetch Error", description: `${error.message || `Could not fetch applicants from ${apiUrl}. Check console.`}` });
        
        const storedApplications = localStorage.getItem("completedApplications"); // Fallback to local storage
        if (storedApplications) {
            try {
                const parsedApps = JSON.parse(storedApplications);
                const mappedApps = parsedApps.map(mapRawApplicantData);
                const uniqueUpdatedApps = mappedApps.filter((applicant, index, self) =>
                    index === self.findIndex((a) => a.applicationId === applicant.applicationId)
                );
                if (uniqueUpdatedApps.length < mappedApps.length) {
                    console.warn("Duplicate application IDs found in localStorage and filtered out during API error fallback. (Admin View All)");
                }
                setApplicants(uniqueUpdatedApps);
                toast({ variant: "default", title: "Using Local Data", description: `Fetched applicants from local storage as API (${apiUrl}) was unavailable.`, duration: 6000});
            } catch (parseError) {
                console.error("Failed to parse local applications:", parseError);
                setApplicants([]);
                toast({variant: "destructive", title: "Local Data Error", description: "Could not parse local applicant data."});
            }
        } else {
            setApplicants([]);
        }
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
        document.title = 'View Applicants - Admin Dashboard';
    }
    fetchApplicants();
  }, [fetchApplicants]);

  const handleViewDetails = (applicant: NewIntakeApplicationData) => {
    setSelectedApplicant(applicant);
    setIsDetailDialogOpen(true);
  };
  
  const formatDateSafe = (date?: Date | string) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "PPP");
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return "Invalid Date";
    }
  };

  const handleSetAdmissionStatus = async (applicantId: string, status: "Admitted" | "Not Admitted" | "Pending", reason?: string) => {
    setIsUpdatingStatus(true);
    let admissionNumberPayload: string | undefined = undefined;

    const applicantToUpdate = applicants.find(app => app.applicationId === applicantId);

    if (status === "Admitted" && applicantToUpdate) {
        admissionNumberPayload = generateAdmissionNumberForCourse(applicantToUpdate.preferredProgram, applicantToUpdate.preferredCampus, applicantToUpdate.applicationId);
        console.log(`Generated Admission Number for ${applicantId}: ${admissionNumberPayload}. This would be sent to the backend to be stored.`);
    }

    try {
        const response = await fetch('https://sajfoods.net/api/siat/update-applicant-status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                applicationId: applicantId, 
                status, 
                rejectionReason: reason,
                admissionNumber: admissionNumberPayload 
            })
        });
        const result = await response.json();

        if (result.success) {
            toast({ title: "Status Updated (API)", description: `Applicant ${applicantId} status set to ${status}. ${admissionNumberPayload ? 'Admission number generated.' : ''}` });
            
            // Refetch all applicants to get updated list including admission number.
            // This is simpler than trying to update the specific applicant in the list with potentially new data from the server.
            await fetchApplicants(); 
            
            // If the dialog was open for this applicant, we need to update its selectedApplicant state
            // after refetching, or close it. For simplicity, let's update if it's the same.
            if (selectedApplicant && selectedApplicant.applicationId === applicantId) {
                const refreshedApplicantInList = applicants.find(app => app.applicationId === applicantId);
                if(refreshedApplicantInList) {
                     setSelectedApplicant(refreshedApplicantInList);
                } else {
                    // If somehow not found after refetch (unlikely if API was successful), close dialog.
                    setIsDetailDialogOpen(false);
                    setSelectedApplicant(null);
                }
            }
        } else {
            throw new Error(result.message || "Failed to update status via API.");
        }
    } catch (error: any) {
        console.error("Error updating status via API:", error);
        toast({ variant: "destructive", title: "API Update Error", description: error.message || "Could not update status via API." });
        
        // Fallback to local storage update for prototype if API fails (less ideal as admin list might get out of sync with DB)
        // Consider removing this local fallback if API is the single source of truth.
        const currentApplicants = [...applicants];
        const appIndex = currentApplicants.findIndex(app => String(app.applicationId) === String(applicantId));

        if (appIndex > -1) {
            currentApplicants[appIndex].admissionStatus = status;
            if (status === "Not Admitted") {
                currentApplicants[appIndex].rejectionReason = reason || "No specific reason provided.";
            } else if (status === "Admitted" && admissionNumberPayload) {
                currentApplicants[appIndex].admission_number = admissionNumberPayload;
                delete currentApplicants[appIndex].rejectionReason;
            }
            setApplicants(currentApplicants); // Update main list state

            if (selectedApplicant && String(selectedApplicant.applicationId) === String(applicantId)) {
                setSelectedApplicant(currentApplicants[appIndex]); // Update dialog state
            }
            toast({ title: "Local Status Updated (Fallback)", description: "Status updated in local view due to API error." });
        } else {
             toast({ variant: "destructive", title: "Local Update Failed", description: "Applicant not found in local list for update." });
        }
    } finally {
        setIsUpdatingStatus(false);
        if (isRejectionReasonDialogOpen) setIsRejectionReasonDialogOpen(false);
    }
  };

  const openRejectionReasonDialog = (applicant: NewIntakeApplicationData) => {
    setSelectedApplicant(applicant); 
    setRejectionReasonInput(applicant.rejectionReason || "");
    setIsRejectionReasonDialogOpen(true);
  };

  const handleConfirmRejection = () => {
    if (selectedApplicant) {
      handleSetAdmissionStatus(selectedApplicant.applicationId, "Not Admitted", rejectionReasonInput);
    }
  };


  const getStatusBadge = (status?: NewIntakeApplicationData["admissionStatus"]) => {
    switch (status) {
      case "Admitted":
        return <Badge variant="default" className="bg-primary text-primary-foreground"><CheckCircle className="mr-1 h-3 w-3"/>Admitted</Badge>;
      case "Not Admitted":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Not Admitted</Badge>;
      case "Pending":
        return <Badge variant="secondary" className="bg-yellow-500 text-yellow-900"><Hourglass className="mr-1 h-3 w-3"/>Pending Review</Badge>;
      default: 
        return <Badge variant="outline"><FileClock className="mr-1 h-3 w-3"/>Not Submitted</Badge>;
    }
  };


  if (isLoading && applicants.length === 0) { // Show loader only on initial load
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Loading applicants...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <Users className="mr-3 h-7 w-7" /> View New Intake Applicants
          </CardTitle>
          <CardDescription>Review applications submitted by prospective students and manage their admission status.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Submitted Applications ({applicants.length})</CardTitle>
           {isLoading && applicants.length > 0 && ( // Show subtle loading indicator for refetches
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Refreshing applicant list...
                </div>
            )}
        </CardHeader>
        <CardContent>
          {applicants.length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-center py-8">No applications submitted yet or none found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App. ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program Choice</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell>{getStatusBadge(applicant.admissionStatus)}</TableCell>
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
        <Dialog open={isDetailDialogOpen} onOpenChange={(isOpen) => {
            setIsDetailDialogOpen(isOpen);
            if(!isOpen) {
                setSelectedApplicant(null); 
                setRejectionReasonInput(""); 
            }
        }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-primary text-xl">Applicant Details: {selectedApplicant.fullName}</DialogTitle>
              <div className="flex justify-between items-center">
                <DialogDescription>Application ID: {selectedApplicant.applicationId}</DialogDescription>
                {getStatusBadge(selectedApplicant.admissionStatus)}
              </div>
                 <DialogDescription className="text-xs">Submitted: {formatDateSafe(selectedApplicant.submitted_at)}</DialogDescription>
                 {selectedApplicant.admissionStatus === "Admitted" && selectedApplicant.admission_number && (
                    <DialogDescription className="text-sm font-semibold text-primary">Admission No: {selectedApplicant.admission_number}</DialogDescription>
                 )}
            </DialogHeader>
            
            <ScrollArea className="flex-grow overflow-y-auto pr-4 -mr-2">
              <div className="space-y-4 py-2">

                <h3 className="font-semibold text-primary flex items-center gap-2 mt-2 text-lg border-b pb-2"><UserCog className="h-5 w-5"/>Personal Information</h3>
                {selectedApplicant.photograph && selectedApplicant.photograph.name && (
                     <div className="my-2">
                        <p className="text-sm font-medium text-muted-foreground col-span-1 mb-1">Photograph:</p>
                        <Image 
                            src={`https://placehold.co/100x100.png?text=${selectedApplicant.photograph.name.substring(0,10)}`} 
                            alt="Applicant Photograph" 
                            width={100} height={100} 
                            className="rounded-md border object-cover shadow-sm"
                            data-ai-hint="applicant photo"
                        />
                         <p className="text-xs text-muted-foreground mt-1">{selectedApplicant.photograph.name} ({selectedApplicant.photograph.size ? (selectedApplicant.photograph.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})</p>
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
                
                <h4 className="font-medium text-primary/90 flex items-center gap-2 pt-3 mt-3 text-md"><HeartHandshake className="h-5 w-5"/>Next of Kin</h4>
                <ApplicationDetailItem label="Name" value={selectedApplicant.nextOfKinName} />
                <ApplicationDetailItem label="Phone" value={selectedApplicant.nextOfKinPhone} />
                <ApplicationDetailItem label="Relationship" value={selectedApplicant.nextOfKinRelationship} />


                <h3 className="font-semibold text-primary flex items-center gap-2 pt-3 border-t mt-4 text-lg"><BookCopy className="h-5 w-5"/>Academic Qualifications</h3>
                <h4 className="font-medium text-primary/90 mt-1 text-md">O-Level Qualifications</h4>
                {(selectedApplicant.oLevels || []).map((ol, index) => (
                  <div key={ol.id || `ol-qual-${index}`} className="p-3 my-1 border rounded-md bg-muted/30 space-y-1">
                    <p className="font-medium text-sm text-foreground">O-Level Sitting {index + 1}</p>
                     <ApplicationDetailItem label="Exam Type" value={ol.examType} />
                     <ApplicationDetailItem label="Exam Year" value={ol.examYear} />
                     <ApplicationDetailItem label="Exam No" value={ol.examNumber || "N/A"}/>
                     <p className="text-sm font-medium text-muted-foreground pt-1">Subjects & Grades:</p>
                     {(ol.subjects || []).length === 0 && <p className="text-xs text-muted-foreground pl-4">No subjects listed for this sitting.</p>}
                     <ul className="list-disc list-inside pl-4 text-sm space-y-0.5">
                        {(ol.subjects || []).map(sub => <li key={sub.id || sub.subject}>{sub.subject}: <span className="font-semibold">{sub.grade}</span></li>)}
                    </ul>
                    <ApplicationDetailItem label="Certificate" value={ol.file?.name ? `${ol.file.name} (${ol.file.size ? (ol.file.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})` : "N/A"} />
                  </div>
                ))}
                 {(!selectedApplicant.oLevels || selectedApplicant.oLevels.length === 0) && <p className="text-sm text-muted-foreground">No O-Level qualifications provided.</p>}


                {selectedApplicant.aLevels && selectedApplicant.aLevels.length > 0 && (
                  <>
                    <h4 className="font-medium text-primary/90 mt-3 text-md">A-Level/Other Qualifications</h4>
                    {(selectedApplicant.aLevels || []).map((qual, index) => (
                      <div key={qual.id || `al-qual-${index}`} className="p-3 my-1 border rounded-md bg-muted/30 space-y-1">
                        <p className="font-medium text-sm text-foreground">Qualification {index + 1}</p>
                        <ApplicationDetailItem label="Type" value={qual.type} />
                        <ApplicationDetailItem label="Institution" value={qual.institution} />
                        <ApplicationDetailItem label="Course" value={qual.courseOfStudy || "N/A"} />
                        <ApplicationDetailItem label="Grade/Class" value={qual.gradeOrClass || "N/A"} />
                        <ApplicationDetailItem label="Year Awarded" value={qual.yearAwarded} />
                        <ApplicationDetailItem label="Certificate" value={qual.file?.name ? `${qual.file.name} (${qual.file.size ? (qual.file.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})` : "N/A"} />
                      </div>
                    ))}
                  </>
                )}

                {selectedApplicant.experiences && selectedApplicant.experiences.length > 0 && (
                  <>
                    <h4 className="font-medium text-primary/90 mt-3 text-md">Work Experience</h4>
                    {(selectedApplicant.experiences || []).map((exp, index) => (
                      <div key={exp.id || `exp-${index}`} className="p-3 my-1 border rounded-md bg-muted/30 space-y-1">
                         <p className="font-medium text-sm text-foreground">Experience {index + 1}</p>
                        <ApplicationDetailItem label="Organization" value={exp.organization} />
                        <ApplicationDetailItem label="Role" value={exp.role} />
                        <ApplicationDetailItem label="Start Date" value={exp.startDate ? formatDateSafe(exp.startDate) : "N/A"} />
                        <ApplicationDetailItem label="End Date" value={exp.endDate ? formatDateSafe(exp.endDate) : "N/A"} />
                        <ApplicationDetailItem label="Document" value={exp.file?.name ? `${exp.file.name} (${exp.file.size ? (exp.file.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})` : "N/A"} />
                      </div>
                    ))}
                  </>
                )}

                <h3 className="font-semibold text-primary flex items-center gap-2 pt-3 border-t mt-4 text-lg"><GraduationCap className="h-5 w-5"/>Program Choice</h3>
                <ApplicationDetailItem label="Preferred Program" value={selectedApplicant.preferredProgram} />
                <ApplicationDetailItem label="Preferred Campus" value={selectedApplicant.preferredCampus} />
                <ApplicationDetailItem label="Entry Mode" value={selectedApplicant.entryMode} />
                
                {selectedApplicant.admissionStatus === "Not Admitted" && selectedApplicant.rejectionReason && (
                  <>
                    <h3 className="font-semibold text-destructive flex items-center gap-2 pt-3 border-t mt-4 text-lg"><MessageSquare className="h-5 w-5"/>Rejection Reason</h3>
                    <ApplicationDetailItem label="Reason" value={selectedApplicant.rejectionReason}/>
                  </>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="mt-auto pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-2">
              <div className="flex gap-2">
                 <Button 
                    onClick={() => handleSetAdmissionStatus(selectedApplicant.applicationId, "Admitted")} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={selectedApplicant.admissionStatus === "Admitted" || isUpdatingStatus}
                  >
                    {isUpdatingStatus && selectedApplicant.admissionStatus !== "Admitted" && selectedApplicant.admissionStatus !== "Not Admitted" ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
                     Admit Applicant
                  </Button>
                  <Button 
                    onClick={() => openRejectionReasonDialog(selectedApplicant)} 
                    variant="destructive"
                    disabled={selectedApplicant.admissionStatus === "Not Admitted" || isUpdatingStatus}
                  >
                     {isUpdatingStatus && selectedApplicant.admissionStatus !== "Not Admitted" && selectedApplicant.admissionStatus !== "Admitted" ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4"/>}
                     Decline Admission
                  </Button>
              </div>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isUpdatingStatus}>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedApplicant && (
        <Dialog open={isRejectionReasonDialogOpen} onOpenChange={(isOpen) => {
            setIsRejectionReasonDialogOpen(isOpen);
            if (!isOpen && !isUpdatingStatus) { 
                setRejectionReasonInput(""); 
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-destructive">Reason for Declining Admission</DialogTitle>
                    <DialogDescription>
                        Provide a reason for declining admission for {selectedApplicant.fullName} (Application ID: {selectedApplicant.applicationId}). This will be recorded.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="rejectionReasonInput">Rejection Reason</Label>
                    <Textarea 
                        id="rejectionReasonInput"
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        placeholder="Enter reason here..."
                        rows={4}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isUpdatingStatus}>Cancel</Button></DialogClose>
                    <Button onClick={handleConfirmRejection} variant="destructive" disabled={isUpdatingStatus || !rejectionReasonInput.trim()}>
                       {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                       Confirm Decline
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );

    