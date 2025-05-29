
"use client";

import React, { useState, useEffect } from "react"; // Ensure useEffect is imported
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  FormDescription,
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
import { CalendarIcon, PlusCircle, Trash2, UploadCloud, FileText, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import type { NewIntakeApplicationData, QualificationUpload, ExperienceUpload, FileUploadInfo, PreRegisteredUser } from "@/types";
// The server action is no longer used directly from this page, data is saved to localStorage for now.
// import { submitNewIntakeApplicationAction } from "./actions"; // Removed as we save to localStorage for now
import Image from "next/image";


const MAX_QUALIFICATIONS = 5;
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

const photographFileSchema = z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Photograph is required.")
  .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE_BYTES, `Max photo size is ${MAX_FILE_SIZE_MB}MB.`)
  .refine(
    (files) => ALLOWED_IMAGE_TYPES.includes(files?.[0]?.type),
    "Only .jpg, .jpeg, and .png formats are supported for photograph."
  ).nullable().optional();

const documentFileSchema = z.custom<FileList>((val) => val === null || (val instanceof FileList && val.length <= 1), "Please select one file or clear selection.")
  .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE_BYTES, `Max document size is ${MAX_FILE_SIZE_MB}MB.`)
  .refine(
    (files) => !files || files.length === 0 || ALLOWED_DOC_TYPES.includes(files?.[0]?.type),
    "Only .pdf, .jpg, .jpeg, and .png formats are supported for documents."
  ).nullable().optional();


const oLevelSubjectSchema = z.object({
  id: z.string(),
  subject: z.string().min(1, "Subject is required."),
  grade: z.string().min(1, "Grade is required."),
});

const oLevelQualificationSchema = z.object({
  id: z.string(),
  examType: z.string().min(1, "Exam type (e.g., WAEC, NECO) is required."),
  examYear: z.string().min(4, "Exam year is required.").max(4, "Invalid year."),
  examNumber: z.string().optional(),
  subjects: z.array(oLevelSubjectSchema).min(5, "At least 5 O-Level subjects are required.").max(9, "Maximum 9 O-Level subjects."),
  fileInput: documentFileSchema,
  file: fileSchema, 
});

const aLevelQualificationSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Qualification type is required."), // e.g., A-Level, Diploma, NCE, Degree
  institution: z.string().min(1, "Institution name is required."),
  courseOfStudy: z.string().optional(), // Relevant for Diploma/Degree
  gradeOrClass: z.string().optional(), // e.g., Distinction, Upper Credit, Second Class Upper
  yearAwarded: z.string().min(4, "Year is required.").max(4, "Invalid year."),
  fileInput: documentFileSchema,
  file: fileSchema,
});


const registrationDashboardFormSchema = z.object({
  applicationId: z.string(), // Will be pre-filled
  // Bio-data
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
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
  nextOfKinRelationship: z.string().min(2, "Relationship to next of kin is required."),
  
  // Qualifications
  oLevels: z.array(oLevelQualificationSchema).min(1, "At least one O-Level result is required.").max(2, "Maximum 2 O-Level sittings."),
  aLevels: z.array(aLevelQualificationSchema).max(MAX_QUALIFICATIONS, `Maximum ${MAX_QUALIFICATIONS} A-Level/Other qualifications.`).optional(),
  
  // Program Choice
  preferredProgram: z.string().min(1, "Please select a program."),
  preferredCampus: z.string().min(1, "Please select a campus."),
  entryMode: z.enum(["UTME", "Direct Entry", "Transfer"], { required_error: "Entry mode is required."}),
  
  terms: z.boolean().refine(val => val === true, "You must agree to the terms.")
});

type FormValues = z.infer<typeof registrationDashboardFormSchema>;

const tabs = [
  { id: "bio-data", name: "Bio-data", fields: ["photographFile", "fullName", "email", "phoneNumber", "dateOfBirth", "gender", "address", "city", "stateOfOrigin", "nationality", "nextOfKinName", "nextOfKinPhone", "nextOfKinRelationship"] as const },
  { id: "o-level", name: "O-Level Qualifications", fields: ["oLevels"] as const },
  { id: "a-level", name: "A-Level/Other Qualifications", fields: ["aLevels"] as const },
  { id: "program", name: "Program Choice", fields: ["preferredProgram", "preferredCampus", "entryMode"] as const },
  { id: "preview", name: "Preview & Submit", fields: ["terms"] as const },
];

const availablePrograms = [
    "Computer Science", "Software Engineering", "Mass Communication", "Business Administration",
    "Accounting", "Electrical Engineering Technology", "Public Administration", "Science Laboratory Technology"
];
const availableCampuses = ["Main Campus - Zaria", "Kaduna City Campus", "Kano Extension Center"];
const aLevelQualificationTypes = ["A-Level (IJMB/JUPEB)", "National Diploma (ND)", "NCE", "Bachelor's Degree", "Other"];
const genderOptions = ["Male", "Female", "Other"];
const entryModes = ["UTME", "Direct Entry", "Transfer"];
const oLevelExamTypes = ["WAEC", "NECO", "NABTEB", "GCE"];
const oLevelSubjectsList = ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature in English", "CRK/IRK", "Geography", "Agricultural Science", "Further Mathematics", "Technical Drawing", "Commerce", "Financial Accounting"];
const oLevelGrades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];


export default function RegistrationDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState(tabs[0].id);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photographPreview, setPhotographPreview] = React.useState<string | null>(null);
  const [applicantAppId, setApplicantAppId] = useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    console.log("RegistrationDashboardPage mounted successfully.");
    document.title = "Complete Application - SIAT Institute";
    const sessionString = localStorage.getItem("currentApplicantSession");
    if (sessionString) {
      const session = JSON.parse(sessionString) as { appId: string; email: string };
      setApplicantAppId(session.appId);

      // Fetch pre-registered user data to prefill form
      const preRegisteredUsersString = localStorage.getItem("preRegisteredUsers");
      if (preRegisteredUsersString) {
        const preRegisteredUsers: PreRegisteredUser[] = JSON.parse(preRegisteredUsersString);
        const currentUser = preRegisteredUsers.find(u => u.appId === session.appId);
        if (currentUser) {
          form.reset({
            ...form.getValues(), // keep existing form values if any
            applicationId: currentUser.appId,
            email: currentUser.email,
            fullName: `${currentUser.surname} ${currentUser.firstname} ${currentUser.othername || ''}`.trim(),
            // Initialize other fields if needed, or leave them for user to fill
          });
        }
      }
       setInitialDataLoaded(true);
    } else {
      toast({ variant: "destructive", title: "Unauthorized", description: "Please login to continue your application." });
      router.push("/registration/login");
    }
  }, [router, toast]); // form is not stable, so not including in deps

  const form = useForm<FormValues>({
    resolver: zodResolver(registrationDashboardFormSchema),
    defaultValues: {
      applicationId: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: undefined,
      gender: undefined, 
      address: "",
      city: "",
      stateOfOrigin: "",
      nationality: "Nigerian",
      photographFile: null,
      photograph: undefined,
      nextOfKinName: "",
      nextOfKinPhone: "",
      nextOfKinRelationship: "",
      oLevels: [],
      aLevels: [],
      preferredProgram: "",
      preferredCampus: "",
      entryMode: undefined, 
      terms: false,
    },
  });
  
   // Re-run prefill if applicantAppId is set after initial mount
  useEffect(() => {
    if (applicantAppId && !initialDataLoaded) { // Check initialDataLoaded to prevent re-resetting
        const preRegisteredUsersString = localStorage.getItem("preRegisteredUsers");
        if (preRegisteredUsersString) {
            const preRegisteredUsers: PreRegisteredUser[] = JSON.parse(preRegisteredUsersString);
            const currentUser = preRegisteredUsers.find(u => u.appId === applicantAppId);
            if (currentUser) {
                form.reset({
                    ...form.getValues(),
                    applicationId: currentUser.appId,
                    email: currentUser.email,
                    fullName: `${currentUser.surname} ${currentUser.firstname} ${currentUser.othername || ''}`.trim(),
                });
            }
        }
        setInitialDataLoaded(true); // Mark as loaded
    }
  }, [applicantAppId, form, initialDataLoaded]);


  const { fields: oLevelFields, append: appendOLevel, remove: removeOLevel } = useFieldArray({
    control: form.control,
    name: "oLevels",
  });
  const { fields: oLevelSubjects, append: appendOLevelSubject, remove: removeOLevelSubject } = useFieldArray({
    control: form.control,
    name: `oLevels.${0}.subjects` // Example, needs dynamic index if multiple sittings
  });


  const { fields: aLevelFields, append: appendALevel, remove: removeALevel } = useFieldArray({
    control: form.control,
    name: "aLevels",
  });

  const handlePhotographChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Only JPG, JPEG, and PNG images are allowed for photograph."});
        setPhotographPreview(null);
        form.setValue('photographFile', null);
        event.target.value = ""; // Reset file input
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: "destructive", title: "File Too Large", description: `Photograph size cannot exceed ${MAX_FILE_SIZE_MB}MB.`});
        setPhotographPreview(null);
        form.setValue('photographFile', null);
        event.target.value = ""; // Reset file input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotographPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('photographFile', files); // Store FileList
    } else {
      setPhotographPreview(null);
      form.setValue('photographFile', null);
    }
  };

  const handleAddOLevel = () => {
    if (oLevelFields.length < 2) { // Max 2 sittings
      appendOLevel({ id: crypto.randomUUID(), examType: "", examYear: "", examNumber: "", subjects: [], fileInput: null, file: undefined });
    } else {
      toast({ title: "Limit Reached", description: "You can add a maximum of 2 O-Level sittings.", variant: "destructive" });
    }
  };
  
  const handleAddOLevelSubject = (oLevelIndex: number) => {
    const currentSubjects = form.getValues(`oLevels.${oLevelIndex}.subjects`);
    if (currentSubjects.length < 9) {
       const fieldArrayMethods = useFieldArray({ control: form.control, name: `oLevels.${oLevelIndex}.subjects` });
       fieldArrayMethods.append({ id: crypto.randomUUID(), subject: "", grade: "" });
    } else {
        toast({ title: "Limit Reached", description: "Maximum 9 subjects per O-Level sitting.", variant: "destructive" });
    }
  };


  const handleAddALevel = () => {
     if ((aLevelFields?.length || 0) < MAX_QUALIFICATIONS) {
      appendALevel({ id: crypto.randomUUID(), type: "", institution: "", courseOfStudy:"", gradeOrClass:"", yearAwarded: "", fileInput: null, file: undefined });
    } else {
      toast({ title: "Limit Reached", description: `You can add a maximum of ${MAX_QUALIFICATIONS} A-Level/Other qualifications.`, variant: "destructive" });
    }
  };

  const processFileUpload = (fileList: FileList | null | undefined): FileUploadInfo | undefined => {
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      return { name: file.name, type: file.type, size: file.size };
    }
    return undefined;
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    const applicationDataToSubmit: NewIntakeApplicationData = {
      ...data, // Includes pre-filled appId, fullName, email
      dateOfBirth: data.dateOfBirth, // Already a Date object
      photograph: processFileUpload(data.photographFile),
      qualifications: [ // Combine O-Levels and A-Levels into a single qualifications array for storage/backend
        ...data.oLevels.map(ol => ({
          id: ol.id,
          type: `O-Level (${ol.examType}) - ${ol.examYear}`, // Combine for description
          institution: ol.examNumber || "N/A", // Use examNumber as institution placeholder or similar
          yearAwarded: ol.examYear,
          // Storing subjects might need a more complex structure or join table in a real DB
          // For localStorage, we can stringify or simplify
          description: `${ol.subjects.length} subjects. Certificate: ${processFileUpload(ol.fileInput)?.name || "N/A"}`, 
          file: processFileUpload(ol.fileInput),
        })),
        ...(data.aLevels?.map(al => ({
          ...al,
          file: processFileUpload(al.fileInput),
        })) || [])
      ],
      // experiences is not part of this simplified dashboard form for now
      // experiences: data.experiences?.map(e => ({
      //   ...e,
      //   file: processFileUpload(e.fileInput),
      // })) || [],
    };
    
    // Clean up temporary FileList inputs
    delete (applicationDataToSubmit as any).photographFile;
    delete (applicationDataToSubmit as any).oLevels;
    delete (applicationDataToSubmit as any).aLevels;
    // applicationDataToSubmit.qualifications.forEach(q => delete (q as any).fileInput); 
    // applicationDataToSubmit.experiences?.forEach(e => delete (e as any).fileInput);
    delete (applicationDataToSubmit as any).terms;


    try {
        const existingApplicationsString = localStorage.getItem("completedApplications");
        const existingApplications: NewIntakeApplicationData[] = existingApplicationsString ? JSON.parse(existingApplicationsString) : [];
        
        // Check if application with this ID already exists, if so, update it
        const appIndex = existingApplications.findIndex(app => app.applicationId === applicationDataToSubmit.applicationId);
        if (appIndex > -1) {
            existingApplications[appIndex] = applicationDataToSubmit;
        } else {
            existingApplications.push(applicationDataToSubmit);
        }
        localStorage.setItem("completedApplications", JSON.stringify(existingApplications));
        
        toast({ title: "Application Submitted Successfully!", description: `Your application (ID: ${applicationDataToSubmit.applicationId}) has been saved.`, duration: 7000 });
        
        // Clear session and redirect to landing page
        localStorage.removeItem("currentApplicantSession");
        router.push("/"); 
        
      } catch (e) {
        console.error("Failed to save application to localStorage", e);
        toast({ variant: "destructive", title: "Submission Failed", description: "Your application could not be saved locally." });
      }

    setIsLoading(false);
  };

  type FieldName = keyof FormValues;

  const nextTab = async () => {
    const currentTabIndex = tabs.findIndex(t => t.id === currentTab);
    const currentFields = tabs[currentTabIndex].fields as FieldName[] | undefined;
    let output = true;
    if (currentFields) {
      output = await form.trigger(currentFields, { shouldFocus: true });
    }
    
    if (currentTabIndex === tabs.length - 1) { // Preview tab
        const termsOutput = await form.trigger(["terms"]);
        if (!termsOutput) output = false;
    }

    if (!output) return;

    if (currentTabIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentTabIndex + 1].id);
    }
  };

  const prevTab = () => {
    const currentTabIndex = tabs.findIndex(t => t.id === currentTab);
    if (currentTabIndex > 0) {
      setCurrentTab(tabs[currentTabIndex - 1].id);
    }
  };
  
  if (!applicantAppId && !initialDataLoaded) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading application session...</p>
          </div>
      );
  }
  if (!applicantAppId && initialDataLoaded) { // Should have been redirected by useEffect, but as a fallback
       return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <CardTitle className="text-destructive">Session Error</CardTitle>
              <CardDescription>Could not load your application session. Please try logging in again.</CardDescription>
              <Button onClick={() => router.push("/registration/login")} className="mt-4">Go to Login</Button>
          </div>
      );
  }


  return (
    <div className="py-8 md:py-12">
        <Card className="w-full max-w-3xl mx-auto shadow-xl border-2 border-primary/10">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Complete Your Application</CardTitle>
                <CardDescription className="text-md">
                Application ID: <span className="font-semibold text-accent">{applicantAppId || form.getValues("applicationId")}</span>. Fill all required fields.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
                        {tabs.map(tab => (
                        <TabsTrigger key={tab.id} value={tab.id} onClick={async (e) => {
                            const currentTabIndex = tabs.findIndex(t => t.id === currentTab);
                            const targetTabIndex = tabs.findIndex(t => t.id === tab.id);
                            // Allow navigation to previous tabs or current tab
                            if (targetTabIndex <= currentTabIndex) {
                                setCurrentTab(tab.id);
                                return;
                            }
                            // Validate current tab before moving to next
                            const currentFields = tabs[currentTabIndex].fields as FieldName[] | undefined;
                            if (currentFields) {
                                const isValid = await form.trigger(currentFields, { shouldFocus: true });
                                if (isValid) {
                                    setCurrentTab(tab.id);
                                } else {
                                    e.preventDefault(); // Prevent tab switch if validation fails
                                    toast({variant: "destructive", title:"Incomplete Section", description: `Please complete all required fields in the "${tabs[currentTabIndex].name}" section.`})
                                }
                            } else {
                                 setCurrentTab(tab.id); // No fields to validate, allow switch
                            }
                        }}>
                            {tab.name}
                        </TabsTrigger>
                        ))}
                    </TabsList>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <TabsContent value="bio-data" className="space-y-6 animate-in fade-in-50">
                           {/* Photograph and Bio-data fields from previous implementation */}
                            <FormField control={form.control} name="photographFile" render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel>Passport Photograph (JPG, PNG - Max 2MB)</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="file" 
                                            accept="image/jpeg,image/png,image/jpg" 
                                            onChange={handlePhotographChange}
                                            className="file:text-accent file:font-semibold"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            {photographPreview && (
                                <div className="mt-2 text-center">
                                    <Image src={photographPreview} alt="Photograph Preview" width={150} height={150} className="rounded-md border object-cover mx-auto" data-ai-hint="applicant passport"/>
                                </div>
                            )}
                             {!photographPreview && (
                                <div className="mt-2 text-center">
                                    <div className="w-[150px] h-[150px] bg-muted rounded-md border flex items-center justify-center mx-auto">
                                        <UserIcon className="w-16 h-16 text-muted-foreground" data-ai-hint="photo placeholder" />
                                    </div>
                                </div>
                            )}
                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} disabled /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} disabled/></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="08012345678" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                    <FormControl>
                                    <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button></FormControl></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date(new Date().setFullYear(new Date().getFullYear() - 15)) || date < new Date("1950-01-01")}
                                        initialFocus
                                        captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()-15}
                                    />
                                    </PopoverContent></Popover><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem><FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl>
                                <SelectContent>{genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                                </Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Full Residential Address</FormLabel><FormControl><Textarea placeholder="Your current address" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                    <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Zaria" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="stateOfOrigin" render={({ field }) => (
                                    <FormItem><FormLabel>State of Origin</FormLabel><FormControl><Input placeholder="e.g. Kaduna" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="nationality" render={({ field }) => (
                            <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input placeholder="e.g. Nigerian" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <h3 className="text-lg font-semibold text-primary pt-4 border-t">Next of Kin Information</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="nextOfKinName" render={({ field }) => (
                                    <FormItem><FormLabel>Next of Kin Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="nextOfKinPhone" render={({ field }) => (
                                    <FormItem><FormLabel>Next of Kin Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="nextOfKinRelationship" render={({ field }) => (
                                <FormItem><FormLabel>Relationship to Next of Kin</FormLabel><FormControl><Input placeholder="e.g. Father, Sister" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </TabsContent>
                        
                        <TabsContent value="o-level" className="space-y-6 animate-in fade-in-50">
                            <CardTitle className="text-xl text-primary">O-Level Qualifications</CardTitle>
                            {oLevelFields.map((item, oLevelIndex) => (
                                <Card key={item.id} className="p-4 space-y-4 relative bg-muted/50">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-primary">O-Level Sitting {oLevelIndex + 1}</h4>
                                        {oLevelFields.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeOLevel(oLevelIndex)}>
                                                <Trash2 className="h-4 w-4" /><span className="sr-only">Remove O-Level Sitting</span>
                                            </Button>
                                        )}
                                    </div>
                                     <FormField control={form.control} name={`oLevels.${oLevelIndex}.examType`} render={({ field }) => (
                                        <FormItem><FormLabel>Exam Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="e.g. WAEC, NECO" /></SelectTrigger></FormControl>
                                            <SelectContent>{oLevelExamTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                            </Select><FormMessage /></FormItem>
                                        )} />
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name={`oLevels.${oLevelIndex}.examYear`} render={({ field }) => (
                                            <FormItem><FormLabel>Exam Year</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name={`oLevels.${oLevelIndex}.examNumber`} render={({ field }) => (
                                            <FormItem><FormLabel>Exam Number (Optional)</FormLabel><FormControl><Input placeholder="Your exam number" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <h5 className="font-medium pt-2">Subjects & Grades (Min 5, Max 9)</h5>
                                    {form.watch(`oLevels.${oLevelIndex}.subjects`)?.map((subjectItem, subjectIndex) => (
                                        <div key={subjectItem.id} className="grid grid-cols-10 gap-2 items-end">
                                            <FormField control={form.control} name={`oLevels.${oLevelIndex}.subjects.${subjectIndex}.subject`} render={({ field }) => (
                                                <FormItem className="col-span-5"><FormLabel className="text-xs">Subject {subjectIndex + 1}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                                                    <SelectContent>{oLevelSubjectsList.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name={`oLevels.${oLevelIndex}.subjects.${subjectIndex}.grade`} render={({ field }) => (
                                                <FormItem className="col-span-4"><FormLabel className="text-xs">Grade</FormLabel>
                                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger></FormControl>
                                                    <SelectContent>{oLevelGrades.map(grd => <SelectItem key={grd} value={grd}>{grd}</SelectItem>)}</SelectContent>
                                                    </Select><FormMessage /></FormItem>
                                            )} />
                                            {form.getValues(`oLevels.${oLevelIndex}.subjects`).length > 5 && (
                                                <Button type="button" variant="ghost" size="icon" className="col-span-1 text-destructive hover:bg-destructive/10 h-9 w-9 self-end" onClick={() => {
                                                     const fieldArrayMethods = useFieldArray({ control: form.control, name: `oLevels.${oLevelIndex}.subjects` });
                                                     fieldArrayMethods.remove(subjectIndex);
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                     { (form.watch(`oLevels.${oLevelIndex}.subjects`)?.length || 0) < 9 && (
                                        <Button type="button" size="sm" variant="outline" className="mt-2 text-accent border-accent" onClick={() => handleAddOLevelSubject(oLevelIndex)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                                        </Button>
                                    )}
                                    {form.formState.errors.oLevels?.[oLevelIndex]?.subjects?.root && (
                                        <FormMessage>{form.formState.errors.oLevels?.[oLevelIndex]?.subjects?.root?.message}</FormMessage>
                                    )}


                                    <FormField control={form.control} name={`oLevels.${oLevelIndex}.fileInput`} render={({ field: { onChange, value, ...rest } }) => ( 
                                        <FormItem><FormLabel>Upload O-Level Certificate/Statement</FormLabel>
                                            <FormControl><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files)} {...rest} className="file:text-accent file:font-semibold"/></FormControl>
                                            <FormMessage />
                                            {value && value.length > 0 && <p className="text-xs text-muted-foreground">Selected: {value[0].name}</p>}
                                        </FormItem>
                                    )} />
                                </Card>
                            ))}
                            {oLevelFields.length < 2 && (
                                <Button type="button" variant="outline" onClick={handleAddOLevel} className="text-accent border-accent hover:bg-accent/10">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add O-Level Sitting
                                </Button>
                            )}
                            {form.formState.errors.oLevels?.root && oLevelFields.length === 0 && (
                                <FormMessage>{form.formState.errors.oLevels.root.message}</FormMessage>
                            )}
                        </TabsContent>

                        <TabsContent value="a-level" className="space-y-6 animate-in fade-in-50">
                            <CardTitle className="text-xl text-primary">A-Level / Other Qualifications (Optional)</CardTitle>
                            {aLevelFields.map((item, index) => (
                            <Card key={item.id} className="p-4 space-y-4 relative bg-muted/50">
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeALevel(index)}>
                                    <Trash2 className="h-4 w-4" /><span className="sr-only">Remove Qualification</span>
                                </Button>
                                <h4 className="font-medium text-primary">Qualification {index + 1}</h4>
                                <FormField control={form.control} name={`aLevels.${index}.type`} render={({ field }) => (
                                <FormItem><FormLabel>Qualification Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="e.g. A-Level, Diploma" /></SelectTrigger></FormControl>
                                    <SelectContent>{aLevelQualificationTypes.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name={`aLevels.${index}.institution`} render={({ field }) => (
                                <FormItem><FormLabel>Institution Name</FormLabel><FormControl><Input placeholder="Name of school/body" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name={`aLevels.${index}.courseOfStudy`} render={({ field }) => (
                                <FormItem><FormLabel>Course of Study (if applicable)</FormLabel><FormControl><Input placeholder="e.g. Computer Engineering" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`aLevels.${index}.gradeOrClass`} render={({ field }) => (
                                <FormItem><FormLabel>Grade/Class of Pass</FormLabel><FormControl><Input placeholder="e.g. Distinction, 10 points" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name={`aLevels.${index}.yearAwarded`} render={({ field }) => (
                                <FormItem><FormLabel>Year Awarded</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                </div>
                                <FormField control={form.control} name={`aLevels.${index}.fileInput`} render={({ field: { onChange, value, ...rest } }) => ( 
                                    <FormItem><FormLabel>Upload Certificate (PDF, JPG, PNG - Max 2MB)</FormLabel>
                                        <FormControl><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files)} {...rest} className="file:text-accent file:font-semibold"/></FormControl>
                                        <FormMessage />
                                        {value && value.length > 0 && <p className="text-xs text-muted-foreground">Selected: {value[0].name}</p>}
                                    </FormItem>
                                )} />
                            </Card>
                            ))}
                            {(aLevelFields?.length || 0) < MAX_QUALIFICATIONS && (
                                <Button type="button" variant="outline" onClick={handleAddALevel} className="text-accent border-accent hover:bg-accent/10">
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add A-Level/Other Qualification
                                </Button>
                            )}
                        </TabsContent>

                        <TabsContent value="program" className="space-y-6 animate-in fade-in-50">
                            <CardTitle className="text-xl text-primary">Program and Campus Selection</CardTitle>
                            <FormField control={form.control} name="preferredProgram" render={({ field }) => (
                                <FormItem><FormLabel>Preferred Program of Study</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a program" /></SelectTrigger></FormControl>
                                    <SelectContent>{availablePrograms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                            <FormField control={form.control} name="preferredCampus" render={({ field }) => (
                                <FormItem><FormLabel>Preferred Campus</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a campus" /></SelectTrigger></FormControl>
                                    <SelectContent>{availableCampuses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                            <FormField control={form.control} name="entryMode" render={({ field }) => (
                                <FormItem><FormLabel>Mode of Entry</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select entry mode" /></SelectTrigger></FormControl>
                                    <SelectContent>{entryModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                    </Select><FormMessage /></FormItem>
                                )} />
                        </TabsContent>
                        
                        <TabsContent value="preview" className="space-y-6 animate-in fade-in-50">
                            <CardTitle className="text-xl text-primary">Application Preview</CardTitle>
                            <CardDescription>Please review all your information carefully before submitting.</CardDescription>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-primary border-b pb-1">Bio-data</h3>
                                <PreviewItem label="Photograph" value={processFileUpload(form.getValues("photographFile"))?.name || "Not uploaded"} />
                                {photographPreview && (
                                    <div className="text-center">
                                        <Image src={photographPreview} alt="Photograph Preview" width={100} height={100} className="rounded-md border object-cover mx-auto shadow-md" data-ai-hint="application passport photo"/>
                                    </div>
                                )}
                                <PreviewItem label="Full Name" value={form.getValues("fullName")} />
                                <PreviewItem label="Email" value={form.getValues("email")} />
                                <PreviewItem label="Phone Number" value={form.getValues("phoneNumber")} />
                                <PreviewItem label="Date of Birth" value={form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth")!, "PPP") : "N/A"} />
                                <PreviewItem label="Gender" value={form.getValues("gender")} />
                                <PreviewItem label="Address" value={form.getValues("address")} />
                                <PreviewItem label="City" value={form.getValues("city")} />
                                <PreviewItem label="State of Origin" value={form.getValues("stateOfOrigin")} />
                                <PreviewItem label="Nationality" value={form.getValues("nationality")} />


                                <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">Next of Kin</h3>
                                <PreviewItem label="Full Name" value={form.getValues("nextOfKinName")} />
                                <PreviewItem label="Phone" value={form.getValues("nextOfKinPhone")} />
                                <PreviewItem label="Relationship" value={form.getValues("nextOfKinRelationship")} />

                                <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">O-Level Qualifications</h3>
                                {form.getValues("oLevels").map((ol, i) => (
                                    <div key={ol.id} className="p-3 border rounded-md bg-muted/30">
                                        <p className="font-medium">O-Level Sitting {i + 1}: {ol.examType} ({ol.examYear})</p>
                                        <PreviewItem label="Exam No" value={ol.examNumber || "N/A"}/>
                                        <ul className="list-disc list-inside pl-4 text-sm">
                                            {ol.subjects.map(sub => <li key={sub.id}>{sub.subject}: {sub.grade}</li>)}
                                        </ul>
                                        <PreviewItem label="Certificate" value={processFileUpload(ol.fileInput)?.name || "Not uploaded"} />
                                    </div>
                                ))}

                                {form.getValues("aLevels") && form.getValues("aLevels")!.length > 0 && (
                                    <>
                                        <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">A-Level/Other Qualifications</h3>
                                        {form.getValues("aLevels")!.map((al, i) => (
                                        <div key={al.id} className="p-3 border rounded-md bg-muted/30">
                                            <p className="font-medium">Qualification {i + 1}: {al.type}</p>
                                            <PreviewItem label="Institution" value={al.institution} />
                                            <PreviewItem label="Course" value={al.courseOfStudy || "N/A"} />
                                            <PreviewItem label="Grade/Class" value={al.gradeOrClass || "N/A"} />
                                            <PreviewItem label="Year Awarded" value={al.yearAwarded} />
                                            <PreviewItem label="Certificate" value={processFileUpload(al.fileInput)?.name || "Not uploaded"} />
                                        </div>
                                        ))}
                                    </>
                                )}
                                
                                <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">Program Choice</h3>
                                <PreviewItem label="Preferred Program" value={form.getValues("preferredProgram")} />
                                <PreviewItem label="Preferred Campus" value={form.getValues("preferredCampus")} />
                                <PreviewItem label="Entry Mode" value={form.getValues("entryMode")} />
                            </div>
                            <FormField control={form.control} name="terms" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow mt-6">
                                    <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-primary text-primary focus:ring-primary" /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>I confirm that all information provided is accurate and complete to the best of my knowledge.</FormLabel>
                                        <FormMessage />
                                    </div>
                                    </FormItem>
                                )}
                            />
                        </TabsContent>

                        <CardFooter className="flex justify-between mt-8 p-0">
                            {tabs.findIndex(t => t.id === currentTab) > 0 && (
                                <Button type="button" variant="outline" onClick={prevTab} disabled={isLoading}>
                                Previous
                                </Button>
                            )}
                            {tabs.findIndex(t => t.id === currentTab) < tabs.length - 1 && (
                                <Button type="button" onClick={nextTab} className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                            {currentTab === tabs[tabs.length - 1].id && (
                                <Button type="submit" className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !form.watch("terms")}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {isLoading ? "Submitting..." : "Submit Application"}
                                </Button>
                            )}
                        </CardFooter>
                        </form>
                    </Form>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}

interface PreviewItemProps {
  label: string;
  value?: string | number | null;
}
const PreviewItem: React.FC<PreviewItemProps> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-1 text-sm">
    <dt className="font-medium text-muted-foreground">{label}:</dt>
    <dd className="text-foreground sm:text-right">{String(value || "N/A")}</dd>
  </div>
);

    