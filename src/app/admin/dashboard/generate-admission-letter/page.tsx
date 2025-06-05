
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { NewIntakeApplicationData } from "@/types";
import { Loader2, Search, Printer, UserCircle, FileText as FileTextIconLucide, Briefcase, CalendarDays, UserCog, HeartHandshake, BookCopy, GraduationCap } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import ArewaLogo from "@/components/arewa-logo";
import { ScrollArea } from "@/components/ui/scroll-area";

// Helper function to map raw API data (copied from view-applicants/page.tsx)
const mapRawApplicantData = (app: any): NewIntakeApplicationData => {
    let fullNameConstructed = app.full_name || "";
    if (!fullNameConstructed && app.surname && app.firstname) {
        fullNameConstructed = `${app.surname} ${app.firstname}${app.othername ? ' ' + app.othername : ''}`.trim();
    }
    return {
        applicationId: String(app.application_id || app.applicationId),
        fullName: fullNameConstructed,
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
    };
};

// Helper function to generate admission number (copied from view-applicants/page.tsx)
const generateAdmissionNumberForCourse = (program: string | undefined, campus: string | undefined, appId: string | undefined): string => {
  if (!program || !appId) return `TEMP-ADM-${Date.now().toString().slice(-5)}`;
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


export default function GenerateAdmissionLetterPage() {
  const { toast } = useToast();
  const [applicationIdInput, setApplicationIdInput] = useState("");
  const [applicantData, setApplicantData] = useState<NewIntakeApplicationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAdmissionNo, setGeneratedAdmissionNo] = useState<string | null>(null);
  const admissionLetterContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Generate Admission Letter - Admin";
  }, []);

  const handleFetchApplicant = async () => {
    if (!applicationIdInput.trim()) {
      setError("Please enter an Application ID.");
      setApplicantData(null);
      setGeneratedAdmissionNo(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setApplicantData(null);
    setGeneratedAdmissionNo(null);

    try {
      // Using the plural endpoint as established for admin views
      const response = await fetch('https://sajfoods.net/api/siat/get-applicants.php');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(JSON.parse(errorText)?.message || `API Error: ${response.status}`);
      }
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const foundApplicantRaw = result.data.find((app: any) => String(app.application_id || app.applicationId) === applicationIdInput.trim());
        
        if (foundApplicantRaw) {
          const mappedData = mapRawApplicantData(foundApplicantRaw);
          
          let finalAdmissionNo = mappedData.admission_number;
          let statusToUpdate = mappedData.admissionStatus;

          if (mappedData.admissionStatus !== "Admitted") {
            statusToUpdate = "Admitted"; // Conceptually mark as admitted
            toast({ title: "Status Update", description: `Applicant ${mappedData.fullName} status conceptually set to 'Admitted'.`});
          }
          
          if (!finalAdmissionNo) {
            finalAdmissionNo = generateAdmissionNumberForCourse(mappedData.preferredProgram, mappedData.preferredCampus, mappedData.applicationId);
            // Simulate backend update for admission number and status
            console.log(`SIMULATING BACKEND UPDATE for ${mappedData.applicationId}: Status to 'Admitted', Admission Number to '${finalAdmissionNo}'`);
            toast({ title: "Admission Number Generated", description: `Generated ${finalAdmissionNo} for ${mappedData.fullName}. (This would be saved to backend).`});
          }
          
          setApplicantData({...mappedData, admissionStatus: statusToUpdate, admission_number: finalAdmissionNo });
          setGeneratedAdmissionNo(finalAdmissionNo); // Also store it separately for clarity in letter
          setError(null);
        } else {
          setError(`Applicant with ID "${applicationIdInput}" not found.`);
          setApplicantData(null);
        }
      } else {
        setError(result.message || "Failed to fetch applicants or invalid data format.");
        setApplicantData(null);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching applicant data.");
      setApplicantData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateSafe = (date?: Date | string | null, includeTime: boolean = false) => {
    if (!date) return "(Data not provided)";
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return new Date(date).toLocaleDateString('en-GB', options);
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return "Invalid Date";
    }
  };
  
  const handlePrintAdmissionLetter = () => {
    const content = admissionLetterContentRef.current;
    if (content && applicantData && applicantData.admissionStatus === "Admitted") {
      const printWindow = window.open('', '', 'height=800,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Provisional Admission Letter</title>');
        printWindow.document.write(
          `<style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
            .letter-container { max-width: 700px; margin: auto; padding: 20px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid hsl(var(--primary)); padding-bottom: 15px; }
            .header img { max-height: 70px; margin-bottom: 10px; }
            .header h1 { margin: 0; font-size: 22px; color: hsl(var(--primary)); }
            .header h2 { margin: 5px 0; font-size: 18px; font-weight: normal; color: hsl(var(--foreground));}
            .applicant-details { margin-bottom: 20px; }
            .details-grid { display: grid; grid-template-columns: auto 1fr; gap: 0 15px; margin-bottom: 15px; font-size: 13px; }
            .details-grid p { margin: 4px 0; }
            .details-grid strong { color: hsl(var(--primary)); font-weight: 600; }
            .admission-details p { margin: 6px 0; font-size: 14px; }
            .content-section { margin-top: 20px; }
            .content-section h3 { font-size: 16px; color: hsl(var(--primary)); border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
            .content-section ul { list-style: decimal; padding-left: 20px; font-size: 14px; }
            .content-section ul ul { list-style: circle; margin-top: 5px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; }
            .signature-area { margin-top: 50px; }
            .signature-line { border-top: 1px solid #555; width: 250px; margin: 0 auto; padding-top: 5px; }
            .no-print { display: none !important; }
          </style>`
        );
        printWindow.document.write('</head><body>');
        const rootStyles = getComputedStyle(document.documentElement);
        const cssVars = `--primary: ${rootStyles.getPropertyValue('--primary')}; --foreground: ${rootStyles.getPropertyValue('--foreground')}; --accent: ${rootStyles.getPropertyValue('--accent')};`;
        printWindow.document.write(`<div style="${cssVars}">`); 
        
        let contentHtml = content.innerHTML;
        const logoPlaceholder = content.querySelector('[data-arewa-logo-print]');
        if (logoPlaceholder) {
            const logoImgHtml = `<img src="/assets/arewa-logo.svg" alt="Institute Logo" style="max-height: 70px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" />`;
            contentHtml = contentHtml.replace(logoPlaceholder.outerHTML, logoImgHtml);
        }
        printWindow.document.write(contentHtml);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        toast({ variant: "destructive", title: "Print Error", description: "Could not open print window." });
      }
    } else {
      toast({ variant: "destructive", title: "Print Error", description: "Applicant data not available or status not 'Admitted'." });
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Generate Admission Letter</CardTitle>
          <CardDescription>Enter Applicant ID to fetch details, generate admission number (if needed), and preview the letter.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <Label htmlFor="applicationIdInput">Applicant ID</Label>
              <Input
                id="applicationIdInput"
                value={applicationIdInput}
                onChange={(e) => setApplicationIdInput(e.target.value)}
                placeholder="Enter Application ID (e.g., SIAT-APP-XXXXXXXX)"
              />
            </div>
            <Button onClick={handleFetchApplicant} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Fetch & Generate
            </Button>
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {applicantData && applicantData.admissionStatus === "Admitted" && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Admission Letter Preview for {applicantData.fullName}</CardTitle>
            <CardDescription>Application ID: {applicantData.applicationId} | Admission Number: {generatedAdmissionNo || applicantData.admission_number || "To be generated"}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[70vh] border rounded-md p-1">
              <div ref={admissionLetterContentRef} className="printable-admission-letter p-6 bg-white text-black">
                <div className="header text-center mb-6">
                  <div data-arewa-logo-print>
                     <ArewaLogo className="h-16 w-16 mx-auto mb-2 text-[hsl(var(--primary))]" />
                  </div>
                  <h1 className="text-xl font-bold">SCHOLARS INSTITUTE OF ARTS & TECHNOLOGY, ZARIA</h1>
                  <h2 className="text-sm">Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</h2>
                  <p className="text-lg font-semibold mt-4">PROVISIONAL ADMISSION LETTER</p>
                </div>

                <div className="applicant-details mb-4">
                  <p><strong>Date:</strong> {format(new Date(), "PPP")}</p>
                   <div className="details-grid">
                      <p><strong>Applicant Name:</strong> {applicantData.fullName || "(Data not provided)"}</p>
                      <p><strong>Application ID:</strong> {applicantData.applicationId || "(Data not provided)"}</p>
                      <p><strong>Date of Birth:</strong> {formatDateSafe(applicantData.dateOfBirth)}</p>
                      <p><strong>Gender:</strong> {applicantData.gender || "(Data not provided)"}</p>
                      <p><strong>Phone Number:</strong> {applicantData.phoneNumber || "(Data not provided)"}</p>
                      <p><strong>Email:</strong> {applicantData.email || "(Data not provided)"}</p>
                      <p style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {applicantData.address || "(Data not provided)"}</p>
                   </div>
                </div>

                <div className="admission-details mb-4">
                  <p>Dear {applicantData.fullName || "Applicant"},</p>
                  <p className="mt-2">
                    We are pleased to inform you that you have been offered provisional admission into the <strong>Scholars Institute of Arts & Technology, Zaria</strong>
                    to study <strong>{applicantData.preferredProgram || "(Program not specified)"}</strong> for the {new Date().getFullYear()}/{new Date().getFullYear()+1} academic session.
                  </p>
                  <p>
                    Your Admission Number for this program is: <strong style={{ color: 'hsl(var(--accent))' }}>{generatedAdmissionNo || applicantData.admission_number || "(Not yet assigned)"}</strong>.
                  </p>
                  <p className="mt-2">
                    This admission is for the <strong>{applicantData.preferredCampus || "(Campus not specified)"}</strong> via <strong>{applicantData.entryMode || "(Entry mode not specified)"}</strong> entry mode.
                  </p>
                </div>

                <div className="content-section">
                  <h3>Next Steps & Requirements:</h3>
                  <ul>
                    <li>Accept this offer within two (2) weeks from the date of this letter by paying the non-refundable acceptance fee of <strong>6,000 Naira</strong>. Details for payment will be communicated via email and the institute's portal.</li>
                    <li>Proceed with online course registration upon payment of school fees (details to be announced).</li>
                    <li>Undergo medical screening at the institute's designated clinic.</li>
                    <li>Present original copies of your credentials for verification during departmental screening. This includes:
                      <ul style={{ listStyleType: 'circle', paddingLeft: '20px', marginTop: '5px' }}>
                        <li>O-Level Certificate(s)/Statement(s) of Result</li>
                        {applicantData.aLevels && applicantData.aLevels.length > 0 && <li>A-Level/Diploma/NCE Certificate(s) (as applicable)</li>}
                        <li>Birth Certificate / Sworn Declaration of Age</li>
                        <li>State of Origin / Indigene Certificate</li>
                        <li>Four (4) recent passport-sized photographs</li>
                        <li>This Provisional Admission Letter (printed copy)</li>
                      </ul>
                    </li>
                    <li>Detailed schedule for screening and resumption will be communicated via email and on the institute's official website/notice boards.</li>
                  </ul>
                </div>

                <div className="content-section">
                  <p className="mt-3">
                    Congratulations once again. We look forward to welcoming you to SIAT-Institute, Zaria.
                  </p>
                </div>

                <div className="footer mt-10">
                  <div className="signature-area">
                    <p className="signature-line">Registrar's Signature</p>
                    <p>For: Scholars Institute of Arts & Technology, Zaria</p>
                  </div>
                  <p className="mt-4 text-xs">Note: This is a provisional admission and is subject to successful verification of your credentials and meeting all entry requirements.</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePrintAdmissionLetter} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Printer className="mr-2 h-4 w-4" /> Print Admission Letter
            </Button>
          </CardFooter>
        </Card>
      )}
      {applicantData && applicantData.admissionStatus !== "Admitted" && (
        <Card className="shadow-md mt-4">
            <CardHeader>
                <CardTitle className="text-lg text-destructive">Applicant Not Yet Admitted</CardTitle>
            </CardHeader>
            <CardContent>
                <p>The applicant <span className="font-semibold">{applicantData.fullName}</span> (ID: {applicantData.applicationId}) currently has a status of <span className="font-semibold">{applicantData.admissionStatus}</span>.</p>
                <p>An admission letter can typically only be generated for applicants with an "Admitted" status. You can change their status on the "View Applicants" page. If you proceed from this page, the status will be conceptually changed to "Admitted" for letter generation, and you would need to ensure this change is saved on the backend.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
