"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, UploadCloud, User as UserIcon, Loader2, ArrowRight, ArrowLeft, CheckCircle, XCircle, Hourglass, FileClock, UserCheck, Printer, RefreshCw, Check, UserCog, BookCopy, GraduationCap, HeartHandshake } from "lucide-react";
import type { NewIntakeApplicationData, FileUploadInfo } from "@/types";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Dialog as PrintDialog, DialogContent as PrintDialogContent, DialogHeader as PrintDialogHeader, DialogTitle as PrintDialogTitle, DialogDescription as PrintDialogDescription, DialogFooter as PrintDialogFooter } from "@/components/ui/dialog";
import ArewaLogo from "@/components/arewa-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mapRawApplicantData } from "@/lib/mapRawApplicantData";

const MAX_QUALIFICATIONS = 5; 
const MAX_O_LEVEL_SITTINGS = 2;
const MAX_O_LEVEL_SUBJECTS_PER_SITTING = 9;
const MIN_O_LEVEL_SUBJECTS_PER_SITTING = 5;
const MAX_EXPERIENCES = 3;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const fileSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
}).optional().nullable();

const photographFileSchema = z.custom<FileList | null | undefined>()
  .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE_BYTES, `Max photo size is ${MAX_FILE_SIZE_MB}MB.`)
  .refine(
    (files) => !files || files.length === 0 || ALLOWED_IMAGE_TYPES.includes(files[0].type),
    "Only .jpg, .jpeg, and .png formats are supported for photograph."
  ).optional().nullable();

const documentFileSchema = z.custom<FileList | null | undefined>()
  .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE_BYTES, `Max document size is ${MAX_FILE_SIZE_MB}MB.`)
  .refine(
    (files) => !files || files.length === 0 || ALLOWED_DOC_TYPES.includes(files[0].type),
    "Only .pdf, .jpg, .jpeg, and .png formats are supported for documents."
  ).optional().nullable();

const oLevelSubjectSchema = z.object({
  id: z.string(),
  subject: z.string().min(1, "Subject is required."),
  grade: z.string().min(1, "Grade is required."),
});

const oLevelQualificationSchema = z.object({
  id: z.string(),
  examType: z.string().min(1, "Exam type is required."),
  examYear: z.string().min(4, "Exam year is required.").max(4, "Invalid year."),
  examNumber: z.string().optional(),
  subjects: z.array(oLevelSubjectSchema).min(MIN_O_LEVEL_SUBJECTS_PER_SITTING, `At least ${MIN_O_LEVEL_SUBJECTS_PER_SITTING} subjects required.`).max(MAX_O_LEVEL_SUBJECTS_PER_SITTING),
  fileInput: documentFileSchema,
  file: fileSchema,
});

const aLevelQualificationSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Type is required."),
  institution: z.string().min(1, "Institution is required."),
  courseOfStudy: z.string().optional(),
  gradeOrClass: z.string().optional(),
  yearAwarded: z.string().min(4, "Year is required.").max(4, "Invalid year."),
  fileInput: documentFileSchema,
  file: fileSchema,
});

const experienceSchema = z.object({
  id: z.string(),
  organization: z.string().min(1, "Organization is required."),
  role: z.string().min(1, "Role is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  fileInput: documentFileSchema,
  file: fileSchema,
});

const registrationDashboardFormSchema = z.object({
  applicationId: z.string(),
  fullName: z.string().optional(), 
  email: z.string().email("Invalid email address."), 
  phoneNumber: z.string().min(10, "Valid phone number is required."),
  dateOfBirth: z.date({ required_error: "Date of birth is required." }),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required." }),
  address: z.string().min(5, "Address is required."),
  city: z.string().min(2, "City is required."),
  stateOfOrigin: z.string().min(2, "State of origin is required."),
  nationality: z.string().min(2, "Nationality is required."),
  photographFile: photographFileSchema,
  photograph: fileSchema,
  nextOfKinName: z.string().min(3, "Next of kin name is required."),
  nextOfKinPhone: z.string().min(10, "Next of kin phone is required."),
  nextOfKinRelationship: z.string().min(2, "Relationship is required."),
  oLevels: z.array(oLevelQualificationSchema).min(1, "At least one O-Level sitting required."),
  aLevels: z.array(aLevelQualificationSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
  preferredProgram: z.string().min(1, "Please select a program."),
  preferredCampus: z.string().min(1, "Please select a campus."),
  entryMode: z.enum(["UTME", "Direct Entry", "Transfer"], { required_error: "Entry mode is required."}),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms."),
  admissionStatus: z.enum(["Pending", "Admitted", "Not Admitted", "Not Submitted"]).optional(),
  rejectionReason: z.string().optional(),
  admission_number: z.string().optional(), 
  submitted_at: z.date().optional(),
});

type FormValues = z.infer<typeof registrationDashboardFormSchema>;

const formTabs = [
  { id: "bio-data", name: "Bio-data", fields: ["phoneNumber", "dateOfBirth", "gender", "address", "city", "stateOfOrigin", "nationality", "nextOfKinName", "nextOfKinPhone", "nextOfKinRelationship"] as const },
  { id: "o-level", name: "O-Level Qualifications", fields: ["oLevels"] as const },
  { id: "a-level", name: "A-Level/Other & Exp.", fields: ["aLevels", "experiences"] as const },
  { id: "program", name: "Program Choice", fields: ["preferredProgram", "preferredCampus", "entryMode"] as const },
  { id: "preview", name: "Preview & Submit", fields: ["terms"] as const },
];

const availablePrograms = ["Computer Science", "Software Engineering", "Mass Communication", "Business Administration", "Accounting", "Electrical Engineering Technology", "Public Administration", "Science Laboratory Technology"];
const availableCampuses = ["Main Campus - Zaria", "Kaduna City Campus", "Kano Extension Center"];
const aLevelQualificationTypes = ["A-Level (IJMB/JUPEB)", "National Diploma (ND)", "Higher National Diploma (HND)", "NCE", "Bachelor's Degree", "Other"];
const experienceTypes = ["Work Experience", "Internship", "Volunteer Work"];
const genderOptions = ["Male", "Female", "Other"];
const entryModes = ["UTME", "Direct Entry", "Transfer"];
const oLevelExamTypes = ["WAEC", "NECO", "NABTEB", "GCE"];
const oLevelSubjectsList = ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Computer Studies", "Economics", "Government", "Literature in English", "CRK/IRK", "Geography", "Agricultural Science", "Further Mathematics", "Technical Drawing", "Commerce", "Financial Accounting", "Civic Education", "Data Processing"];
const oLevelGrades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const heroSliderImages = [
  { src: "/assets/slider/slide-7.jpg", alt: "Welcome", title: "Your Journey Starts Here", subtitle: "Complete your application for SIAT Institute." },
  { src: "/assets/slider/slide-8.jpg", alt: "Library", title: "World-Class Facilities", subtitle: "Explore our resources and learning environment." },
];

const PreviewItemDisplay: React.FC<{ label: string; value?: any; className?: string }> = ({ label, value, className }) => (
  <div className={cn("flex flex-col sm:flex-row sm:justify-between py-1.5 text-sm border-b border-muted/50", className)}>
    <dt className="font-medium text-muted-foreground min-w-[150px] sm:w-1/3">{label}:</dt>
    <dd className="text-foreground sm:text-right break-words mt-1 sm:mt-0">{String(value || "(Not provided)")}</dd>
  </div>
);

export default function RegistrationDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const hasFetched = useRef(false);
  const admissionLetterContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(registrationDashboardFormSchema),
    defaultValues: {
      applicationId: "", email: "", phoneNumber: "", nationality: "Nigerian",
      oLevels: [], aLevels: [], experiences: [], terms: false, admissionStatus: "Not Submitted",
    },
  });

  const [currentTab, setCurrentTab] = useState(formTabs[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [photographPreview, setPhotographPreview] = useState<string | null>(null);
  const [applicantSession, setApplicantSession] = useState<any>(null);
  const [completedApplicationData, setCompletedApplicationData] = useState<NewIntakeApplicationData | null>(null);
  const [isAdmissionLetterDialogOpen, setIsAdmissionLetterDialogOpen] = useState(false);

  const fetchAndSetInitialData = useCallback(async (email: string, appId: string, fullName?: string) => {
    setIsFetchingData(true);
    try {
      const response = await fetch(`https://sajfoods.com.ng/siat/get-applicant-details-by-email.php?email=${encodeURIComponent(email)}`);
      const result = await response.json();
      if (result.success && result.data) {
        const mapped = mapRawApplicantData(result.data);
        form.reset({
          ...mapped,
          photographFile: null,
          oLevels: mapped.oLevels?.map(ol => ({ ...ol, fileInput: null })) || [],
          aLevels: mapped.aLevels?.map(al => ({ ...al, fileInput: null })) || [],
          experiences: mapped.experiences?.map(exp => ({ ...exp, fileInput: null })) || [],
          terms: !!mapped.submitted_at,
        });
        if (mapped.admissionStatus !== "Not Submitted") {
          setCompletedApplicationData(mapped);
          setCurrentTab("preview");
        }
        if (mapped.photograph?.name) setPhotographPreview(`https://placehold.co/150x150.png?text=PHOTO`);
        const session = { appId: mapped.applicationId, email: mapped.email, fullName: mapped.fullName, admissionStatus: mapped.admissionStatus };
        localStorage.setItem("currentApplicantSession", JSON.stringify(session));
        setApplicantSession(session);
      } else {
        form.setValue("applicationId", appId);
        form.setValue("email", email);
        if (fullName) form.setValue("fullName", fullName);
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch details." });
    } finally {
      setIsFetchingData(false);
    }
  }, [form, toast]);

  useEffect(() => {
    const sessionString = localStorage.getItem("currentApplicantSession");
    if (sessionString) {
      try {
        const parsed = JSON.parse(sessionString);
        setApplicantSession(parsed);
        if (!hasFetched.current) {
          hasFetched.current = true;
          fetchAndSetInitialData(parsed.email, parsed.appId, parsed.fullName);
        }
      } catch { router.push("/registration/login"); }
    } else { router.push("/registration/login"); }
  }, [router, fetchAndSetInitialData]);

  const { fields: oLevelFields, append: appendOLevel, remove: removeOLevel } = useFieldArray({ control: form.control, name: "oLevels" });
  const { fields: aLevelFields, append: appendALevel, remove: removeALevel } = useFieldArray({ control: form.control, name: "aLevels" });
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control: form.control, name: "experiences" });

  const nextTab = async () => {
    const currentTabIndex = formTabs.findIndex(t => t.id === currentTab);
    const fieldsToValidate = formTabs[currentTabIndex].fields as any[];
    
    // Explicitly check for photo if first time
    if (currentTab === "bio-data" && !photographPreview && !form.getValues("photographFile")) {
        toast({ variant: "destructive", title: "Photograph Required", description: "Please upload a passport photograph." });
        return;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentTabIndex < formTabs.length - 1) {
        setCurrentTab(formTabs[currentTabIndex + 1].id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
        toast({ variant: "destructive", title: "Validation Error", description: "Please correct the highlighted fields." });
    }
  };

  const prevTab = () => {
    const currentTabIndex = formTabs.findIndex(t => t.id === currentTab);
    if (currentTabIndex > 0) setCurrentTab(formTabs[currentTabIndex - 1].id);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const payload: NewIntakeApplicationData = {
      ...data,
      fullName: data.fullName || "",
      photograph: data.photographFile?.[0] ? { name: data.photographFile[0].name, type: data.photographFile[0].type, size: data.photographFile[0].size } : data.photograph,
      oLevels: data.oLevels.map(ol => ({ ...ol, file: ol.fileInput?.[0] ? { name: ol.fileInput[0].name, type: ol.fileInput[0].type, size: ol.fileInput[0].size } : ol.file })),
      admissionStatus: "Pending", submitted_at: new Date(),
    };
    try {
      const response = await fetch('https://sajfoods.com.ng/siat/submit-application.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: "Submitted!", description: "Application under review." });
        fetchAndSetInitialData(data.email, data.applicationId);
      } else toast({ variant: "destructive", title: "Error", description: result.message });
    } catch { toast({ variant: "destructive", title: "Network Error" }); }
    setIsLoading(false);
  };

  if (isFetchingData) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]} className="w-full shadow-lg rounded-lg overflow-hidden">
        <CarouselContent className="h-48 md:h-64">
          {heroSliderImages.map((img, i) => (
            <CarouselItem key={i} className="relative">
              <Image src={img.src} alt={img.alt} fill style={{ objectFit: "cover" }} className="brightness-75" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                <h2 className="text-xl md:text-3xl font-bold text-white">{img.title}</h2>
                <p className="text-gray-200">{img.subtitle}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Application Status: {completedApplicationData?.admissionStatus || "Not Submitted"}</CardTitle>
          <CardDescription>ID: {applicantSession?.appId}</CardDescription>
        </CardHeader>
        <CardContent>
            {completedApplicationData?.admissionStatus === "Admitted" && (
                <div className="p-4 bg-primary/10 rounded-md flex justify-between items-center">
                    <span>Congratulations! You are admitted.</span>
                    <Button size="sm" onClick={() => setIsAdmissionLetterDialogOpen(true)}><Printer className="mr-2 h-4" /> Letter</Button>
                </div>
            )}
        </CardContent>
      </Card>

      {(!completedApplicationData || completedApplicationData.admissionStatus === "Not Submitted") ? (
        <div className="grid md:grid-cols-12 gap-8">
          <aside className="md:col-span-3 space-y-2">
            {formTabs.map((t, i) => (
              <div key={t.id} className={cn("p-3 rounded-md border text-sm font-medium", currentTab === t.id ? "bg-accent text-accent-foreground" : "bg-muted/50")}>
                {i + 1}. {t.name}
              </div>
            ))}
          </aside>
          <div className="md:col-span-9">
            <Card>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {currentTab === "bio-data" && (
                      <div className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                          {photographPreview ? <Image src={photographPreview} alt="P" width={120} height={120} className="rounded-full border-4 border-accent object-cover h-[120px] w-[120px]" /> : <div className="w-120 h-120 bg-muted rounded-full flex items-center justify-center"><UserIcon className="w-12 h-12" /></div>}
                          <Input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const r = new FileReader(); r.onloadend = () => setPhotographPreview(r.result as string); r.readAsDataURL(file);
                              form.setValue("photographFile", e.target.files);
                            }
                          }} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="fullName" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><Input {...field} disabled /></FormItem>} />
                          <FormField control={form.control} name="phoneNumber" render={({ field }) => <FormItem><FormLabel>Phone</FormLabel><Input {...field} /></FormItem>} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></FormItem>} />
                          <FormField control={form.control} name="dateOfBirth" render={({ field }) => <FormItem className="flex flex-col"><FormLabel>DOB</FormLabel><Popover><PopoverTrigger asChild><Button variant="outline">{field.value ? format(field.value, "PPP") : "Pick Date"}<CalendarIcon className="ml-auto h-4 w-4" /></Button></PopoverTrigger><PopoverContent className="p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} fromYear={1950} toYear={2010} captionLayout="dropdown" /></PopoverContent></Popover></FormItem>} />
                        </div>
                        <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Address</FormLabel><Textarea {...field} /></FormItem>} />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => <FormItem><FormLabel>City</FormLabel><Input {...field} /></FormItem>} />
                            <FormField control={form.control} name="stateOfOrigin" render={({ field }) => <FormItem><FormLabel>State</FormLabel><Input {...field} /></FormItem>} />
                        </div>
                        <Separator />
                        <CardTitle className="text-lg">Next of Kin</CardTitle>
                        <FormField control={form.control} name="nextOfKinName" render={({ field }) => <FormItem><FormLabel>NOK Name</FormLabel><Input {...field} /></FormItem>} />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="nextOfKinPhone" render={({ field }) => <FormItem><FormLabel>NOK Phone</FormLabel><Input {...field} /></FormItem>} />
                            <FormField control={form.control} name="nextOfKinRelationship" render={({ field }) => <FormItem><FormLabel>Relationship</FormLabel><Input {...field} /></FormItem>} />
                        </div>
                      </div>
                    )}

                    {currentTab === "o-level" && (
                      <div className="space-y-4">
                        {oLevelFields.map((field, i) => (
                          <Card key={field.id} className="p-4 bg-muted/30 relative">
                            <Button variant="ghost" className="absolute top-2 right-2" onClick={() => removeOLevel(i)}><Trash2 className="h-4" /></Button>
                            <FormField control={form.control} name={`oLevels.${i}.examType`} render={({ field }) => <FormItem><FormLabel>Exam</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{oLevelExamTypes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></FormItem>} />
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <FormField control={form.control} name={`oLevels.${i}.examYear`} render={({ field }) => <FormItem><FormLabel>Year</FormLabel><Input {...field} /></FormItem>} />
                                <FormField control={form.control} name={`oLevels.${i}.examNumber`} render={({ field }) => <FormItem><FormLabel>Number</FormLabel><Input {...field} /></FormItem>} />
                            </div>
                            <div className="mt-4 space-y-2">
                                <FormLabel>Subjects (Min 5)</FormLabel>
                                {form.watch(`oLevels.${i}.subjects`)?.map((sub, si) => (
                                    <div key={si} className="flex gap-2">
                                        <Select onValueChange={(val) => form.setValue(`oLevels.${i}.subjects.${si}.subject`, val)} value={form.watch(`oLevels.${i}.subjects.${si}.subject`)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{oLevelSubjectsList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                                        <Select onValueChange={(val) => form.setValue(`oLevels.${i}.subjects.${si}.grade`, val)} value={form.watch(`oLevels.${i}.subjects.${si}.grade`)}><SelectTrigger className="w-24"><SelectValue /></SelectTrigger><SelectContent>{oLevelGrades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => {
                                    const subs = form.getValues(`oLevels.${i}.subjects`) || [];
                                    if(subs.length < 9) form.setValue(`oLevels.${i}.subjects`, [...subs, { id: crypto.randomUUID(), subject: "", grade: "" }]);
                                }}><PlusCircle className="mr-2 h-4" /> Add Subject</Button>
                            </div>
                          </Card>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendOLevel({ id: crypto.randomUUID(), examType: "", examYear: "", subjects: Array(5).fill(null).map(() => ({ id: crypto.randomUUID(), subject: "", grade: "" })) })}>Add Sitting</Button>
                      </div>
                    )}

                    {currentTab === "program" && (
                        <div className="space-y-4">
                            <FormField control={form.control} name="preferredProgram" render={({ field }) => <FormItem><FormLabel>Program</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{availablePrograms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></FormItem>} />
                            <FormField control={form.control} name="preferredCampus" render={({ field }) => <FormItem><FormLabel>Campus</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{availableCampuses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></FormItem>} />
                            <FormField control={form.control} name="entryMode" render={({ field }) => <FormItem><FormLabel>Mode</FormLabel><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{entryModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></FormItem>} />
                        </div>
                    )}

                    {currentTab === "preview" && (
                        <div className="space-y-4">
                            <CardTitle>Review Your Application</CardTitle>
                            <PreviewItemDisplay label="Name" value={form.watch("fullName")} />
                            <PreviewItemDisplay label="Email" value={form.watch("email")} />
                            <PreviewItemDisplay label="Program" value={form.watch("preferredProgram")} />
                            <FormField control={form.control} name="terms" render={({ field }) => <FormItem className="flex items-center gap-2"><Input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4" /><FormLabel>I confirm accurate info.</FormLabel></FormItem>} />
                        </div>
                    )}

                    <div className="flex justify-between mt-8">
                      <Button type="button" variant="ghost" onClick={prevTab} disabled={currentTab === "bio-data"}>Back</Button>
                      {currentTab !== "preview" ? <Button type="button" onClick={nextTab}>Next <ArrowRight className="ml-2 h-4" /></Button> : <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : "Submit Application"}</Button>}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center"><CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" /><CardTitle>Application Submitted</CardTitle><p className="text-muted-foreground mt-2">Your application ID is {applicantSession.appId}. We will contact you soon.</p></Card>
      )}

      {completedApplicationData?.admissionStatus === "Admitted" && (
        <PrintDialog open={isAdmissionLetterDialogOpen} onOpenChange={setIsAdmissionLetterDialogOpen}>
          <PrintDialogContent className="max-w-3xl">
            <ScrollArea className="max-h-[80vh] p-4">
              <div ref={admissionLetterContentRef} className="text-black bg-white p-8 border">
                <div className="text-center border-b-2 border-primary pb-4 mb-6">
                    <ArewaLogo className="h-16 w-16 mx-auto mb-2 text-primary" />
                    <h1 className="text-xl font-bold">SCHOLARS INSTITUTE OF ARTS & TECHNOLOGY, ZARIA</h1>
                    <p className="text-sm">Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</p>
                </div>
                <h2 className="text-center font-bold underline mb-6">PROVISIONAL ADMISSION LETTER</h2>
                <div className="space-y-2 mb-6">
                    <p><strong>Name:</strong> {completedApplicationData.fullName}</p>
                    <p><strong>App ID:</strong> {completedApplicationData.applicationId}</p>
                    <p><strong>Date:</strong> {format(new Date(), "PPP")}</p>
                </div>
                <p>Dear {completedApplicationData.fullName.split(' ')[0]},</p>
                <p className="mt-4">We are pleased to offer you provisional admission to study <strong>{completedApplicationData.preferredProgram}</strong> at SIAT Zaria.</p>
                <p className="mt-4">Please present your original credentials for screening at the Registrar's office.</p>
                <div className="mt-12 pt-4 border-t w-48 text-center">Registrar</div>
              </div>
            </ScrollArea>
            <PrintDialogFooter><Button onClick={() => window.print()}>Print</Button></PrintDialogFooter>
          </PrintDialogContent>
        </PrintDialog>
      )}
    </div>
  );
}
