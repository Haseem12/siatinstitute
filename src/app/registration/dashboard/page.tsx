
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { CalendarIcon, PlusCircle, Trash2, UploadCloud, User as UserIcon, Loader2, ArrowRight, ArrowLeft, CheckCircle, XCircle, Hourglass, FileClock, UserCheck, Printer, RefreshCw, Check, MailWarning, UserCog, BookCopy, GraduationCap, HeartHandshake, Briefcase } from "lucide-react";
import type { NewIntakeApplicationData, QualificationUpload, FileUploadInfo, OLevelSubject as OLevelSubjectType } from "@/types";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Dialog as PrintDialog, DialogContent as PrintDialogContent, DialogHeader as PrintDialogHeader, DialogTitle as PrintDialogTitle, DialogDescription as PrintDialogDescription, DialogFooter as PrintDialogFooter, DialogClose as PrintDialogClose } from "@/components/ui/dialog";
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
  subjects: z.array(oLevelSubjectSchema).min(MIN_O_LEVEL_SUBJECTS_PER_SITTING, `At least ${MIN_O_LEVEL_SUBJECTS_PER_SITTING} O-Level subjects are required.`).max(MAX_O_LEVEL_SUBJECTS_PER_SITTING, `Maximum ${MAX_O_LEVEL_SUBJECTS_PER_SITTING} O-Level subjects.`),
  fileInput: documentFileSchema,
  file: fileSchema,
});

const aLevelQualificationSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Qualification type is required."),
  institution: z.string().min(1, "Institution name is required."),
  courseOfStudy: z.string().optional(),
  gradeOrClass: z.string().optional(),
  yearAwarded: z.string().min(4, "Year is required.").max(4, "Invalid year."),
  fileInput: documentFileSchema,
  file: fileSchema,
});

const experienceSchema = z.object({
  id: z.string(),
  organization: z.string().min(1, "Organization name is required."),
  role: z.string().min(1, "Role/Position is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required. Enter 'Present' if ongoing."),
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
  nextOfKinRelationship: z.string().min(2, "Relationship to next of kin is required."),

  oLevels: z.array(oLevelQualificationSchema).min(1, "At least one O-Level result is required.").max(MAX_O_LEVEL_SITTINGS, `Maximum ${MAX_O_LEVEL_SITTINGS} O-Level sittings.`),
  aLevels: z.array(aLevelQualificationSchema).max(MAX_QUALIFICATIONS, `Maximum ${MAX_QUALIFICATIONS} A-Level/Other qualifications.`).optional(),
  
  experiences: z.array(experienceSchema).max(MAX_EXPERIENCES, `Maximum ${MAX_EXPERIENCES} experiences.`).optional(),


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
  { id: "bio-data", name: "Bio-data", fields: ["photographFile", "phoneNumber", "dateOfBirth", "gender", "address", "city", "stateOfOrigin", "nationality", "nextOfKinName", "nextOfKinPhone", "nextOfKinRelationship"] as const },
  { id: "o-level", name: "O-Level Qualifications", fields: ["oLevels"] as const },
  { id: "a-level", name: "A-Level/Other & Exp.", fields: ["aLevels", "experiences"] as const },
  { id: "program", name: "Program Choice", fields: ["preferredProgram", "preferredCampus", "entryMode"] as const },
  { id: "preview", name: "Preview & Submit", fields: ["terms"] as const },
];

const applicationCompletionSteps = [
  { id: "bio-data", title: "Bio-data Information" },
  { id: "o-level", title: "O-Level Qualifications" },
  { id: "a-level", title: "A-Level/Other & Experience" },
  { id: "program", title: "Program Choice" },
  { id: "preview", title: "Preview & Submit" },
];


const availablePrograms = [
    "Computer Science", "Software Engineering", "Mass Communication", "Business Administration",
    "Accounting", "Electrical Engineering Technology", "Public Administration", "Science Laboratory Technology"
];
const availableCampuses = ["Main Campus - Zaria", "Kaduna City Campus", "Kano Extension Center"];
const aLevelQualificationTypes = ["A-Level (IJMB/JUPEB)", "National Diploma (ND)", "Higher National Diploma (HND)", "NCE", "Bachelor's Degree", "Other"];
const experienceTypes = ["Work Experience", "Internship", "Volunteer Work"];
const genderOptions = ["Male", "Female", "Other"];
const entryModes = ["UTME", "Direct Entry", "Transfer"];
const oLevelExamTypes = ["WAEC", "NECO", "NABTEB", "GCE"];
const oLevelSubjectsList = ["Mathematics", "English Language", "Physics", "Chemistry", "Biology", "Computer Studies", "Economics", "Government", "Literature in English", "CRK/IRK", "Geography", "Agricultural Science", "Further Mathematics", "Technical Drawing", "Commerce", "Financial Accounting", "Civic Education", "Data Processing"];
const oLevelGrades = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const heroSliderImages = [
  { src: "/assets/slider/slide-7.jpg", alt: "Welcome to SIAT Applicant Portal", title: "Your Journey Starts Here", subtitle: "Complete your application for SIAT Institute.", dataAiHint: "campus students" },
  { src: "/assets/slider/slide-8.jpg", alt: "SIAT Library", title: "World-Class Facilities", subtitle: "Explore our resources and learning environment.", dataAiHint: "library study" },
  { src: "/assets/slider/slide-9.jpg", alt: "SIAT Students Collaborating", title: "Achieve Your Dreams", subtitle: "We are here to support your academic success.", dataAiHint: "students collaboration" },
];

interface PreviewItemProps {
  label: string;
  value?: string | number | null | React.ReactNode;
  className?: string;
}
const PreviewItemDisplay: React.FC<PreviewItemProps> = ({ label, value, className }) => (
  <div className={cn("flex flex-col sm:flex-row sm:justify-between py-1.5 text-sm border-b border-muted/50", className)}>
    <dt className="font-medium text-muted-foreground min-w-[150px] sm:w-1/3">{label}:</dt>
    <dd className="text-foreground sm:text-right break-words mt-1 sm:mt-0">{String(value === undefined || value === null || String(value).trim() === '' ? "(Data not provided)" : value)}</dd>
  </div>
);


interface OLevelSittingItemProps {
  control: any;
  oLevelIndex: number;
  removeOLevelSitting: (index: number) => void;
  form: ReturnType<typeof useForm<FormValues>>;
}

const OLevelSittingItem: React.FC<OLevelSittingItemProps> = ({ control, oLevelIndex, removeOLevelSitting, form }) => {
  const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({
    control,
    name: `oLevels.${oLevelIndex}.subjects`,
  });

  return (
    <Card className="p-4 space-y-4 relative bg-muted/50">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-primary">O-Level Sitting {oLevelIndex + 1}</h4>
        {oLevelIndex >= 0 && ( 
          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeOLevelSitting(oLevelIndex)}>
            <Trash2 className="h-4 w-4" /><span className="sr-only">Remove O-Level Sitting</span>
          </Button>
        )}
      </div>
      <FormField control={control} name={`oLevels.${oLevelIndex}.examType`} render={({ field }) => (
        <FormItem><FormLabel>Exam Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="e.g. WAEC, NECO" /></SelectTrigger></FormControl>
            <SelectContent>{oLevelExamTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
          </Select><FormMessage /></FormItem>
      )} />
      <div className="grid md:grid-cols-2 gap-4">
        <FormField control={control} name={`oLevels.${oLevelIndex}.examYear`} render={({ field }) => (
          <FormItem><FormLabel>Exam Year</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={control} name={`oLevels.${oLevelIndex}.examNumber`} render={({ field }) => (
          <FormItem><FormLabel>Exam Number (Optional)</FormLabel><FormControl><Input placeholder="Your exam number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>

      <h5 className="font-medium pt-2">Subjects & Grades (Min {MIN_O_LEVEL_SUBJECTS_PER_SITTING}, Max {MAX_O_LEVEL_SUBJECTS_PER_SITTING})</h5>
      {subjectFields.map((subjectItem, subjectIndex) => (
        <div key={subjectItem.id} className="grid grid-cols-10 gap-2 items-end">
          <FormField control={control} name={`oLevels.${oLevelIndex}.subjects.${subjectIndex}.subject`} render={({ field }) => (
            <FormItem className="col-span-5"><FormLabel className="text-xs">Subject {subjectIndex + 1}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                <SelectContent>{oLevelSubjectsList.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={control} name={`oLevels.${oLevelIndex}.subjects.${subjectIndex}.grade`} render={({ field }) => (
            <FormItem className="col-span-4"><FormLabel className="text-xs">Grade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger></FormControl>
                <SelectContent>{oLevelGrades.map(grd => <SelectItem key={grd} value={grd}>{grd}</SelectItem>)}</SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          {subjectFields.length > MIN_O_LEVEL_SUBJECTS_PER_SITTING && ( 
            <Button type="button" variant="ghost" size="icon" className="col-span-1 text-destructive hover:bg-destructive/10 h-9 w-9 self-end" onClick={() => removeSubject(subjectIndex)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      {subjectFields.length < MAX_O_LEVEL_SUBJECTS_PER_SITTING && (
        <Button type="button" size="sm" variant="outline" className="mt-2 text-accent border-accent" onClick={() => appendSubject({ id: crypto.randomUUID(), subject: "", grade: "" })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
        </Button>
      )}
      {(form.formState.errors.oLevels?.[oLevelIndex]?.subjects as any)?.root && (
        <FormMessage>{(form.formState.errors.oLevels?.[oLevelIndex]?.subjects as any)?.root?.message}</FormMessage>
      )}
       {form.formState.errors.oLevels?.[oLevelIndex]?.subjects && !(form.formState.errors.oLevels?.[oLevelIndex]?.subjects as any)?.root && subjectFields.length < MIN_O_LEVEL_SUBJECTS_PER_SITTING && (
        <FormMessage>Minimum of {MIN_O_LEVEL_SUBJECTS_PER_SITTING} subjects required.</FormMessage>
      )}

      <FormField control={control} name={`oLevels.${oLevelIndex}.fileInput`} render={({ field: { onChange, value, ...rest } }) => (
        <FormItem><FormLabel>Upload O-Level Certificate/Statement</FormLabel>
          <FormControl><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files)} {...rest} className="file:text-accent file:font-semibold" /></FormControl>
          <FormMessage />
          {value && value.length > 0 && <p className="text-xs text-muted-foreground">Selected: {value[0].name}</p>}
           {form.getValues(`oLevels.${oLevelIndex}.file`) && (!value || value.length === 0) && (
            <p className="text-xs text-muted-foreground">Previously uploaded: {form.getValues(`oLevels.${oLevelIndex}.file`)?.name}</p>
          )}
        </FormItem>
      )} />
    </Card>
  );
};

interface ALevelSittingItemProps {
  control: any;
  itemIndex: number; 
  removeItem: (index: number) => void;
  form: ReturnType<typeof useForm<FormValues>>;
  itemType: 'aLevel' | 'experience';
}

const ALevelSittingItem: React.FC<ALevelSittingItemProps> = ({ control, itemIndex, removeItem, form, itemType }) => {
  const fieldNamePrefix = itemType === 'aLevel' ? 'aLevels' : 'experiences';
  const title = itemType === 'aLevel' ? 'A-Level/Other Qualification' : 'Work Experience';
  const typeOptions = itemType === 'aLevel' ? aLevelQualificationTypes : experienceTypes;

  return (
    <Card className="p-4 space-y-4 relative bg-muted/50">
      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeItem(itemIndex)}>
        <Trash2 className="h-4 w-4" /><span className="sr-only">Remove {title}</span>
      </Button>
      <h4 className="font-medium text-primary">{title} {itemIndex + 1}</h4>
      
      { itemType === 'aLevel' && <FormField control={control} name={`${fieldNamePrefix}.${itemIndex}.type`} render={({ field }) => ( 
        <FormItem><FormLabel>Qualification Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
            <SelectContent>{typeOptions.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
          </Select><FormMessage /></FormItem>
      )} />}
      
      <FormField control={control} name={`${fieldNamePrefix}.${itemIndex}.${itemType === 'aLevel' ? 'institution' : 'organization'}`} render={({ field }) => (
        <FormItem><FormLabel>{itemType === 'aLevel' ? 'Institution Name' : 'Organization Name'}</FormLabel><FormControl><Input placeholder={itemType === 'aLevel' ? 'Name of school/body' : 'Company Name'} {...field} /></FormControl><FormMessage /></FormItem>
      )} />

      {itemType === 'aLevel' && (
        <FormField control={control} name={`aLevels.${itemIndex}.courseOfStudy`} render={({ field }) => (
            <FormItem><FormLabel>Course of Study (if applicable)</FormLabel><FormControl><Input placeholder="e.g. Computer Engineering" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      )}
       {itemType === 'experience' && (
        <FormField control={control} name={`experiences.${itemIndex}.role`} render={({ field }) => ( 
            <FormItem><FormLabel>Role/Position</FormLabel><FormControl><Input placeholder="e.g. Software Developer Intern" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {itemType === 'aLevel' && (
            <>
            <FormField control={control} name={`aLevels.${itemIndex}.gradeOrClass`} render={({ field }) => (
            <FormItem><FormLabel>Grade/Class of Pass</FormLabel><FormControl><Input placeholder="e.g. Distinction, 10 points" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name={`aLevels.${itemIndex}.yearAwarded`} render={({ field }) => ( 
            <FormItem><FormLabel>Year Awarded</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            </>
        )}
         {itemType === 'experience' && (
            <>
            <FormField control={control} name={`experiences.${itemIndex}.startDate`} render={({ field }) => ( 
                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={control} name={`experiences.${itemIndex}.endDate`} render={({ field }) => ( 
                <FormItem><FormLabel>End Date (or 'Present')</FormLabel><FormControl><Input type="text" placeholder="YYYY-MM or Present" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            </>
        )}
      </div>
      <FormField control={control} name={`${fieldNamePrefix}.${itemIndex}.fileInput`} render={({ field: { onChange, value, ...rest } }) => (
        <FormItem><FormLabel>Upload Certificate/Document (PDF, JPG, PNG - Max 2MB)</FormLabel>
          <FormControl><Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files)} {...rest} className="file:text-accent file:font-semibold" /></FormControl>
          <FormMessage />
          {value && value.length > 0 && <p className="text-xs text-muted-foreground">Selected: {value[0].name}</p>}
           {form.getValues(`${fieldNamePrefix}.${itemIndex}.file`) && (!value || value.length === 0) && (
            <p className="text-xs text-muted-foreground">Previously uploaded: {form.getValues(`${fieldNamePrefix}.${itemIndex}.file`)?.name}</p>
          )}
        </FormItem>
      )} />
    </Card>
  );
};

interface ApplicantSessionData {
    appId: string;
    email: string;
    fullName?: string; 
    admissionStatus?: string;
    admission_number?: string;
    submitted_at?: Date; 
}


export default function RegistrationDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
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
      experiences: [],
      preferredProgram: "",
      preferredCampus: "",
      entryMode: undefined,
      terms: false,
      admissionStatus: "Not Submitted",
      rejectionReason: undefined,
      admission_number: undefined,
      submitted_at: undefined,
    },
  });

  const [currentTab, setCurrentTab] = useState(formTabs[0].id);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetchingData, setIsFetchingData] = React.useState(true);
  const [photographPreview, setPhotographPreview] = React.useState<string | null>(null);
  
  const [applicantSession, setApplicantSession] = useState<ApplicantSessionData | null>(null);
  
  const [completedApplicationData, setCompletedApplicationData] = useState<NewIntakeApplicationData | null>(null);
  const [isAdmissionLetterDialogOpen, setIsAdmissionLetterDialogOpen] = useState(false);
  const admissionLetterContentRef = useRef<HTMLDivElement>(null);

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


  const fetchAndSetInitialData = useCallback(async (session: ApplicantSessionData) => {
    setIsFetchingData(true);
    
    try {
        const response = await fetch(`https://sajfoods.com.ng/siat/get-applicant-details-by-email.php?email=${encodeURIComponent(session.email)}`); 
        if (!response.ok) {
            throw new Error(`Failed to fetch application details (${response.status}).`);
        }

        const result = await response.json();
        if (result.success && result.data) {
            const mappedFetchedData = mapRawApplicantData(result.data);
            
            form.reset({
                ...form.formState.defaultValues, 
                ...mappedFetchedData,                   
                photographFile: null, 
                oLevels: mappedFetchedData.oLevels?.map(ol => ({ ...ol, fileInput: null, subjects: ol.subjects || [] })) || [],
                aLevels: mappedFetchedData.aLevels?.map(al => ({ ...al, fileInput: null })) || [],
                experiences: mappedFetchedData.experiences?.map(exp => ({ ...exp, fileInput: null })) || [],
                terms: !!mappedFetchedData.submitted_at, 
            });

            if (mappedFetchedData.admissionStatus !== "Not Submitted") {
                setCompletedApplicationData(mappedFetchedData);
                setCurrentTab("preview"); 
            } else {
                setCompletedApplicationData(null);
                setCurrentTab(formTabs[0].id);
            }

            if (mappedFetchedData.photograph?.name) { 
                 setPhotographPreview(`https://placehold.co/150x150.png?text=PHOTO`); 
            }

            localStorage.setItem("currentApplicantSession", JSON.stringify({
                ...applicantSession,
                appId: mappedFetchedData.applicationId,
                email: mappedFetchedData.email,
                fullName: mappedFetchedData.fullName,
                admissionStatus: mappedFetchedData.admissionStatus,
                admission_number: mappedFetchedData.admission_number,
                submitted_at: mappedFetchedData.submitted_at,
            }));
            setApplicantSession(JSON.parse(localStorage.getItem("currentApplicantSession")!));

        } else { 
            toast({ title: "Welcome!", description: "Please complete the application form below to begin.", duration: 7000 });
            form.setValue("applicationId", session.appId);
            form.setValue("email", session.email);
            if (session.fullName) form.setValue("fullName", session.fullName);
            setCurrentTab(formTabs[0].id);
        }
    } catch (error: any) {
        console.error("Error fetching applicant data:", error);
        toast({ variant: "destructive", title: "Network Error", description: "Could not fetch your application details. Please check your connection." });
    } finally {
        setIsFetchingData(false);
    }
  }, [form, toast, applicantSession]);


  useEffect(() => {
    document.title = "Applicant Dashboard - SIAT Institute";
    const sessionString = localStorage.getItem("currentApplicantSession");
    if (sessionString) {
      try {
        const parsedSession = JSON.parse(sessionString) as ApplicantSessionData;
        if (parsedSession.appId && parsedSession.email) {
          setApplicantSession(parsedSession);
          fetchAndSetInitialData(parsedSession); 
        } else {
          throw new Error("Incomplete session data.");
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Session Error", description: "Invalid session. Please log in again." });
        router.push("/registration/login");
      }
    } else {
      router.push("/registration/login");
    }
  }, [router, toast, fetchAndSetInitialData]);


  const { fields: oLevelFields, append: appendOLevel, remove: removeOLevel } = useFieldArray({
    control: form.control,
    name: "oLevels",
  });


  const { fields: aLevelFields, append: appendALevel, remove: removeALevel } = useFieldArray({
    control: form.control,
    name: "aLevels",
  });
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: "experiences",
  });


  const handlePhotographChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Only JPG, JPEG, and PNG images are allowed."});
        event.target.value = ""; 
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: "destructive", title: "File Too Large", description: `Photograph size cannot exceed ${MAX_FILE_SIZE_MB}MB.`});
        event.target.value = ""; 
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotographPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('photographFile', files);
    }
  };

  const handleAddOLevel = () => {
    if (oLevelFields.length < MAX_O_LEVEL_SITTINGS) {
      appendOLevel({ id: crypto.randomUUID(), examType: "", examYear: "", examNumber: "", subjects: [], fileInput: null, file: undefined });
    }
  };

  const handleAddALevel = () => {
     if ((aLevelFields?.length || 0) < MAX_QUALIFICATIONS) {
      appendALevel({ id: crypto.randomUUID(), type: "", institution: "", courseOfStudy:"", gradeOrClass:"", yearAwarded: "", fileInput: null, file: undefined });
    }
  };
  const handleAddExperience = () => {
     if ((experienceFields?.length || 0) < MAX_EXPERIENCES) {
      appendExperience({ id: crypto.randomUUID(), organization: "", role: "", startDate:"", endDate:"", fileInput: null, file: undefined }); 
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

    const currentStatus = completedApplicationData?.admissionStatus || applicantSession?.admissionStatus;
    if (currentStatus && currentStatus !== "Not Submitted" && currentStatus !== "Pending") {
        toast({ title: "Application Locked", description: `Your application is already ${currentStatus.toLowerCase()}.` });
        setIsLoading(false);
        return;
    }

    const applicationDataToSubmit: NewIntakeApplicationData = {
      ...data,
      fullName: data.fullName || "", 
      photograph: processFileUpload(data.photographFile) || data.photograph, 
      oLevels: data.oLevels.map(ol => ({
        ...ol,
        file: processFileUpload(ol.fileInput) || ol.file,
        subjects: ol.subjects || [] 
      })),
      aLevels: data.aLevels?.map(al => ({
        ...al,
        file: processFileUpload(al.fileInput) || al.file,
      })) || [],
      experiences: data.experiences?.map(exp => ({
        ...exp, 
        file: processFileUpload(exp.fileInput) || exp.file 
      })) || [],
      admissionStatus: "Pending", 
      submitted_at: new Date(), 
    };

    try {
        const response = await fetch('https://sajfoods.com.ng/siat/submit-application.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationDataToSubmit),
        });
        
        const result = await response.json();

        if (result.success) {
            toast({ title: "Application Submitted!", description: "Your details have been saved successfully and are now under review." });
            await fetchAndSetInitialData(applicantSession!); 
        } else {
            toast({ variant: "destructive", title: "Submission Failed", description: result.message });
        }
      } catch (e: any) {
        toast({ variant: "destructive", title: "Error", description: "Could not submit application. Please try again." });
      }

    setIsLoading(false);
  };

  type FieldName = keyof FormValues;

  const nextTab = async () => {
    const currentFields = formTabs[currentStep].fields as FieldName[] | undefined;
    let output = true;
    if (currentFields) {
      output = await form.trigger(currentFields, { shouldFocus: true });
    }

    if (currentStep === formTabs.length - 1) { 
        const termsOutput = await form.trigger(["terms"]);
        if (!termsOutput) output = false;
    }

    if (!output) return;

    if (currentStep < formTabs.length - 1) {
      setCurrentTab(formTabs[currentStep + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevTab = () => {
    const currentTabIndex = formTabs.findIndex(t => t.id === currentTab);
    if (currentTabIndex > 0) {
      setCurrentTab(formTabs[currentTabIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrintAdmissionLetter = () => {
    const content = admissionLetterContentRef.current;
    if (content && completedApplicationData && completedApplicationData.admissionStatus === "Admitted") {
      const printWindow = window.open('', '', 'height=800,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Provisional Admission Letter</title>');
        printWindow.document.write('<style>body { font-family: sans-serif; margin: 40px; line-height: 1.5; } .header { text-align: center; border-bottom: 2px solid #126035; padding-bottom: 20px; margin-bottom: 30px; } .details-grid { display: grid; grid-template-columns: 150px 1fr; gap: 10px; margin-bottom: 20px; } .signature { margin-top: 50px; border-top: 1px solid #333; width: 250px; text-align: center; padding-top: 5px; } </style></head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  const currentStep = formTabs.findIndex(step => step.id === currentTab);
  const appStatus = completedApplicationData?.admissionStatus || applicantSession?.admissionStatus || "Not Submitted";
  
  if (isFetchingData || !applicantSession) { 
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading your profile...</p>
          </div>
      );
  }
  
  return (
    <div className="space-y-6">
        <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]} className="w-full shadow-lg rounded-lg overflow-hidden border-primary/10">
            <CarouselContent className="h-48 md:h-64">
                {heroSliderImages.map((item, index) => (
                <CarouselItem key={index} className="relative">
                    <Image src={item.src} alt={item.alt} fill style={{objectFit:"cover"}} className="brightness-75" priority={index === 0} data-ai-hint={item.dataAiHint}/>
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-2">{item.title}</h2>
                    <p className="text-sm md:text-lg text-gray-200">{item.subtitle}</p>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>

        <Card className="shadow-xl border-primary/10">
            <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-primary">Application Status</CardTitle>
                <div className="text-sm text-muted-foreground">
                    <p>Application ID: <span className="font-semibold text-accent">{applicantSession.appId}</span></p>
                    {completedApplicationData?.submitted_at && (
                        <p>Submitted On: <span className="font-semibold">{formatDateSafe(completedApplicationData.submitted_at, true)}</span></p>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {appStatus === "Not Submitted" && (
                    <div className="flex items-center p-4 bg-muted/50 rounded-md border-l-4 border-destructive">
                        <FileClock className="h-8 w-8 text-destructive mr-4" />
                        <div>
                            <p className="font-semibold text-destructive">Application Incomplete</p>
                            <p className="text-sm text-muted-foreground">Please fill out the form sections below to submit your application for review.</p>
                        </div>
                    </div>
                )}
                {appStatus === "Pending" && (
                    <div className="flex items-center p-4 bg-yellow-500/10 rounded-md border-l-4 border-yellow-600">
                        <Hourglass className="h-8 w-8 text-yellow-600 mr-4" />
                        <div>
                            <p className="font-semibold text-yellow-700">Submitted - Under Review</p>
                            <p className="text-sm text-muted-foreground">We have received your application. It is currently being processed by the admissions office.</p>
                        </div>
                    </div>
                )}
                {completedApplicationData && completedApplicationData.admissionStatus === "Admitted" && (
                    <div className="flex flex-col sm:flex-row items-center p-4 bg-primary/10 rounded-md border-l-4 border-primary">
                        <UserCheck className="h-10 w-10 text-primary mr-4 mb-2 sm:mb-0" />
                        <div className="text-center sm:text-left flex-grow">
                            <p className="font-semibold text-xl text-primary">Congratulations, {completedApplicationData.fullName}!</p>
                            <p className="text-sm text-muted-foreground">You have been provisionally admitted to study <span className="font-semibold">{completedApplicationData.preferredProgram}</span>.</p>
                            <Button className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setIsAdmissionLetterDialogOpen(true)}>
                                <Printer className="mr-2 h-4 w-4" /> Print Admission Letter
                            </Button>
                        </div>
                    </div>
                )}
                {completedApplicationData && completedApplicationData.admissionStatus === "Not Admitted" && (
                    <div className="flex items-center p-4 bg-destructive/10 rounded-md border-l-4 border-destructive">
                        <XCircle className="h-8 w-8 text-destructive mr-4" />
                        <div>
                            <p className="font-semibold text-destructive">Admission Status Update</p>
                            <p className="text-sm text-muted-foreground">Unfortunately, your application was not successful at this time.</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => fetchAndSetInitialData(applicantSession)} disabled={isFetchingData}>
                    {isFetchingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>} 
                    Refresh Application Data
                </Button>
            </CardFooter>
        </Card>


        {appStatus === "Not Submitted" ? (
            <div className="grid md:grid-cols-12 gap-8 items-start">
                 <div className="md:col-span-3 p-4 bg-background rounded-lg shadow border border-border/50 sticky top-20">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Steps</h3>
                    <div className="space-y-4">
                    {applicationCompletionSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                                index < currentStep ? 'bg-primary border-primary text-primary-foreground' : (index === currentStep ? 'bg-accent border-accent text-accent-foreground' : 'bg-muted border-border text-muted-foreground')
                            )}>
                                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                            </div>
                            <span className={cn("text-sm font-medium", index === currentStep ? "text-accent" : "text-muted-foreground")}>{step.title}</span>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="md:col-span-9">
                    <Card className="shadow-xl">
                        <CardContent className="pt-6">
                            <Tabs value={currentTab} className="w-full">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <TabsContent value="bio-data" className="space-y-6">
                                        <div className="flex flex-col items-center gap-4 mb-6">
                                            {photographPreview ? (
                                                <Image src={photographPreview} alt="Preview" width={120} height={120} className="rounded-full border-4 border-accent object-cover h-[120px] w-[120px]" data-ai-hint="user photo"/>
                                            ) : (
                                                <div className="w-[120px] h-[120px] bg-muted rounded-full border-4 border-dashed border-muted-foreground/30 flex items-center justify-center">
                                                    <UserIcon className="w-12 h-12 text-muted-foreground" />
                                                </div>
                                            )}
                                            <FormField control={form.control} name="photographFile" render={({ field }) => (
                                                <FormItem className="text-center">
                                                    <FormLabel className="cursor-pointer text-accent font-semibold underline">Change Passport Photo</FormLabel>
                                                    <FormControl><Input type="file" accept="image/*" onChange={handlePhotographChange} className="hidden" /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="080..." {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                                <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                                                <Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>{field.value ? format(field.value, "PPP") : "Select date"}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown" fromYear={1950} toYear={new Date().getFullYear() - 15} initialFocus/></PopoverContent></Popover><FormMessage /></FormItem>
                                            )}/>
                                        </div>
                                        <FormField control={form.control} name="gender" render={({ field }) => (
                                            <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent>{genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="address" render={({ field }) => (
                                            <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Residential address" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="city" render={({ field }) => (
                                                <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. Zaria" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="stateOfOrigin" render={({ field }) => (
                                                <FormItem><FormLabel>State of Origin</FormLabel><FormControl><Input placeholder="e.g. Kaduna" {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <Separator/>
                                        <h3 className="font-semibold text-primary">Next of Kin</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="nextOfKinName" render={({ field }) => (
                                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="nextOfKinPhone" render={({ field }) => (
                                                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="nextOfKinRelationship" render={({ field }) => (
                                            <FormItem><FormLabel>Relationship</FormLabel><FormControl><Input placeholder="e.g. Father" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </TabsContent>

                                    <TabsContent value="o-level" className="space-y-6">
                                        <h3 className="text-xl font-bold text-primary">O-Level Qualifications</h3>
                                        {oLevelFields.map((item, oLevelIndex) => (
                                            <OLevelSittingItem key={item.id} control={form.control} oLevelIndex={oLevelIndex} removeOLevelSitting={removeOLevel} form={form} />
                                        ))}
                                        {oLevelFields.length < MAX_O_LEVEL_SITTINGS && (
                                            <Button type="button" variant="outline" onClick={handleAddOLevel} className="w-full border-dashed border-2">Add Another Sitting</Button>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="a-level" className="space-y-6">
                                        <h3 className="text-xl font-bold text-primary">Additional Qualifications & Experience</h3>
                                        {aLevelFields.map((item, index) => (
                                            <ALevelSittingItem key={item.id} control={form.control} itemIndex={index} removeItem={removeALevel} form={form} itemType="aLevel" />
                                        ))}
                                        {aLevelFields.length < MAX_QUALIFICATIONS && (
                                            <Button type="button" variant="outline" onClick={handleAddALevel} className="w-full border-dashed border-2">Add A-Level/Other Qualification</Button>
                                        )}
                                        <Separator/>
                                        {experienceFields.map((item, index) => (
                                            <ALevelSittingItem key={item.id} control={form.control} itemIndex={index} removeItem={removeExperience} form={form} itemType="experience" />
                                        ))}
                                        {experienceFields.length < MAX_EXPERIENCES && (
                                            <Button type="button" variant="outline" onClick={handleAddExperience} className="w-full border-dashed border-2">Add Work Experience</Button>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="program" className="space-y-6">
                                        <h3 className="text-xl font-bold text-primary">Program Choice</h3>
                                        <FormField control={form.control} name="preferredProgram" render={({ field }) => (
                                            <FormItem><FormLabel>Preferred Program</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger></FormControl><SelectContent>{availablePrograms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="preferredCampus" render={({ field }) => (
                                            <FormItem><FormLabel>Preferred Campus</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger></FormControl><SelectContent>{availableCampuses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="entryMode" render={({ field }) => (
                                            <FormItem><FormLabel>Entry Mode</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger></FormControl><SelectContent>{entryModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                        )} />
                                    </TabsContent>

                                    <TabsContent value="preview" className="space-y-6">
                                        <h3 className="text-xl font-bold text-primary">Review & Submit</h3>
                                        <div className="p-4 border rounded bg-muted/20 space-y-2 text-sm">
                                            <p><strong>Name:</strong> {form.watch('fullName')}</p>
                                            <p><strong>Email:</strong> {form.watch('email')}</p>
                                            <p><strong>Program:</strong> {form.watch('preferredProgram')}</p>
                                            <p><strong>Campus:</strong> {form.watch('preferredCampus')}</p>
                                        </div>
                                        <FormField control={form.control} name="terms" render={({ field }) => (
                                            <FormItem className="flex items-start space-x-3 p-4 border rounded shadow-sm">
                                                <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 mt-1" /></FormControl>
                                                <div className="leading-none"><FormLabel>I confirm that all information provided is accurate.</FormLabel></div>
                                            </FormItem>
                                        )} />
                                    </TabsContent>

                                    <div className="flex justify-between pt-6 border-t">
                                        <Button type="button" variant="ghost" onClick={prevTab} disabled={currentStep === 0 || isLoading}><ArrowLeft className="mr-2 h-4 w-4"/> Back</Button>
                                        {currentStep < formTabs.length - 1 ? (
                                            <Button type="button" onClick={nextTab} className="bg-accent hover:bg-accent/90 text-accent-foreground">Next Section <ArrowRight className="ml-2 h-4 w-4"/></Button>
                                        ) : (
                                            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <CheckCircle className="mr-2 h-4 w-4"/>} Submit Application</Button>
                                        )}
                                    </div>
                                    </form>
                                </Form>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        ) : (
            <Card className="shadow-xl border-primary/10">
                <CardHeader><CardTitle className="text-xl text-primary">Application Summary</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h4 className="font-bold flex items-center gap-2"><UserCog className="h-4 w-4"/> Personal Details</h4>
                            <PreviewItemDisplay label="Full Name" value={completedApplicationData?.fullName} />
                            <PreviewItemDisplay label="Email" value={completedApplicationData?.email} />
                            <PreviewItemDisplay label="Phone" value={completedApplicationData?.phoneNumber} />
                            <PreviewItemDisplay label="Program" value={completedApplicationData?.preferredProgram} />
                            <PreviewItemDisplay label="Campus" value={completedApplicationData?.preferredCampus} />
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold flex items-center gap-2"><GraduationCap className="h-4 w-4"/> Academic Record</h4>
                            <p className="text-sm">{completedApplicationData?.oLevels?.length} O-Level Sitting(s) uploaded.</p>
                            <p className="text-sm">{completedApplicationData?.aLevels?.length || 0} Additional qualification(s).</p>
                        </div>
                    </section>
                </CardContent>
            </Card>
        )}

        {completedApplicationData && completedApplicationData.admissionStatus === "Admitted" && (
          <PrintDialog open={isAdmissionLetterDialogOpen} onOpenChange={setIsAdmissionLetterDialogOpen}>
            <PrintDialogContent className="max-w-3xl max-h-[90vh]">
              <ScrollArea className="max-h-[70vh] p-4">
                  <div ref={admissionLetterContentRef}>
                      <div className="header">
                          <h1>SCHOLARS INSTITUTE OF ARTS & TECHNOLOGY, ZARIA</h1>
                          <p>Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</p>
                          <h2 style={{marginTop: '20px'}}>PROVISIONAL ADMISSION LETTER</h2>
                      </div>
                      <p><strong>Date:</strong> {format(new Date(), "PPP")}</p>
                      <div className="details-grid">
                          <strong>Name:</strong> <span>{completedApplicationData.fullName}</span>
                          <strong>App ID:</strong> <span>{completedApplicationData.applicationId}</span>
                          <strong>Admission No:</strong> <span>{completedApplicationData.admission_number || "(Processing)"}</span>
                      </div>
                      <p>Dear {completedApplicationData.fullName},</p>
                      <p>We are pleased to offer you provisional admission into the study of <strong>{completedApplicationData.preferredProgram}</strong> at our <strong>{completedApplicationData.preferredCampus}</strong>.</p>
                      <p>Please present this letter and your original credentials for physical screening at the Registrar's office upon resumption.</p>
                      <div className="signature">Registrar</div>
                  </div>
              </ScrollArea>
              <PrintDialogFooter>
                  <Button onClick={handlePrintAdmissionLetter} className="bg-accent text-accent-foreground"><Printer className="mr-2 h-4 w-4"/> Print Letter</Button>
              </PrintDialogFooter>
            </PrintDialogContent>
          </PrintDialog>
        )}
    </div>
  );
}
