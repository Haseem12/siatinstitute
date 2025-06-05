
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
import type { NewIntakeApplicationData, QualificationUpload, FileUploadInfo, PreRegisteredUser, OLevelSubject as OLevelSubjectType } from "@/types";
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
    submitted_at?: Date; // Ensure this is part of the session if needed elsewhere
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
  
  const mapRawApplicantData = useCallback((app: any): NewIntakeApplicationData => {
    let fullNameConstructed = app.full_name || "";
    if (!fullNameConstructed && app.surname && app.firstname) {
        fullNameConstructed = `${app.surname} ${app.firstname}${app.othername ? ' ' + app.othername : ''}`.trim();
    }

    return {
        applicationId: String(app.application_id || app.applicationId || ""),
        fullName: fullNameConstructed,
        email: app.email || "",
        phoneNumber: app.phone_number || app.phoneNumber || "",
        dateOfBirth: app.date_of_birth ? new Date(app.date_of_birth) : undefined,
        gender: app.gender || "",
        address: app.address || "",
        city: app.city || "",
        stateOfOrigin: app.state_of_origin || app.stateOfOrigin || "",
        nationality: app.nationality || "",
        photograph: app.photograph_name ? { name: app.photograph_name, type: app.photograph_type, size: parseInt(String(app.photograph_size || 0), 10) } : (app.photograph || null),
        nextOfKinName: app.next_of_kin_name || app.nextOfKinName || "",
        nextOfKinPhone: app.next_of_kin_phone || app.nextOfKinPhone || "",
        nextOfKinRelationship: app.next_of_kin_relationship || app.nextOfKinRelationship || "",
        preferredProgram: app.preferred_program || app.preferredProgram || "",
        preferredCampus: app.preferred_campus || app.preferredCampus || "",
        entryMode: app.entry_mode || app.entryMode || "",
        admissionStatus: app.admission_status || app.admissionStatus || "Not Submitted",
        rejectionReason: app.rejection_reason || app.rejectionReason,
        admission_number: app.admission_number || undefined,
        submitted_at: app.submitted_at ? new Date(app.submitted_at) : undefined,
        
        oLevels: (app.oLevels || []).map((ol: any) => ({
            id: String(ol.id || crypto.randomUUID()),
            examType: ol.exam_type || ol.examType || "", 
            examYear: ol.exam_year || ol.examYear || "", 
            examNumber: ol.exam_number || ol.examNumber || "",
            subjects: (ol.subjects || []).map((s: any) => ({ 
                id: String(s.id || crypto.randomUUID()),
                subject: s.subject_name || s.subject || "",
                grade: s.grade || ""
            })),
            file: ol.certificate_file_name ? { name: ol.certificate_file_name, type: ol.certificate_file_type, size: parseInt(String(ol.certificate_file_size || 0), 10) } : (ol.file || null),
        })),
        
        aLevels: (app.aLevels || []).map((al: any) => ({
            id: String(al.id || crypto.randomUUID()),
            type: al.qualification_type || al.type || "", 
            institution: al.institution || "",
            courseOfStudy: al.course_of_study || al.courseOfStudy || "", 
            gradeOrClass: al.grade_or_class || al.gradeOrClass || "",   
            yearAwarded: al.year_awarded || al.yearAwarded || "",     
            file: al.certificate_file_name ? { name: al.certificate_file_name, type: al.certificate_file_type, size: parseInt(String(al.certificate_file_size || 0), 10) } : (al.file || null),
        })),
        
        experiences: (app.experiences || []).map((exp: any) => ({
            id: String(exp.id || crypto.randomUUID()),
            organization: exp.organization || "",
            role: exp.role || "",
            startDate: exp.start_date || exp.startDate || "",
            endDate: exp.end_date || exp.endDate || "",
            file: exp.document_file_name ? { name: exp.document_file_name, type: exp.document_file_type, size: parseInt(String(exp.document_file_size || 0), 10) } : (exp.file || null),
        })),
    };
  }, []);


  const fetchAndSetInitialData = useCallback(async (session: ApplicantSessionData) => {
    setIsFetchingData(true);
    // Set initially known values
    form.setValue("applicationId", session.appId);
    form.setValue("email", session.email); 
    if (session.fullName) form.setValue("fullName", session.fullName);
    
    try {
        const response = await fetch(`https://sajfoods.net/api/siat/get-applicants.php`); // Fetch all
        if (!response.ok) {
            const errorText = await response.text();
            let errorMsg = `Failed to fetch application list (${response.status}).`;
            try { const errorJson = JSON.parse(errorText); errorMsg = errorJson.message || errorMsg; } catch (e) { /* Ignore */ }
            toast({ variant: "destructive", title: "Fetch Error", description: errorMsg });
             form.reset({ // Fallback to session data for initial fields
                ...form.formState.defaultValues,
                applicationId: session.appId,
                email: session.email,
                fullName: session.fullName || "",
                admissionStatus: (session.admissionStatus as FormValues['admissionStatus']) || "Not Submitted",
                admission_number: session.admission_number || undefined,
            });
            setCompletedApplicationData(null); 
            setCurrentTab(formTabs[0].id);
            setIsFetchingData(false);
            return;
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            const foundApplicantRaw = result.data.find((app: any) => String(app.application_id || app.applicationId) === String(session.appId));
            
            if (foundApplicantRaw) {
                const mappedFetchedData = mapRawApplicantData(foundApplicantRaw);
                
                form.reset({
                    ...form.formState.defaultValues, 
                    ...mappedFetchedData,                   
                    photographFile: null, // Always reset file inputs
                    oLevels: mappedFetchedData.oLevels?.map(ol => ({ ...ol, fileInput: null, subjects: ol.subjects || [] })) || [],
                    aLevels: mappedFetchedData.aLevels?.map(al => ({ ...al, fileInput: null })) || [],
                    experiences: mappedFetchedData.experiences?.map(exp => ({ ...exp, fileInput: null })) || [],
                    terms: !!mappedFetchedData.applicationId, // Set to true if application was submitted
                });
                setCompletedApplicationData(mappedFetchedData);

                if (mappedFetchedData.photograph?.name) { 
                     setPhotographPreview(`https://placehold.co/150x150.png?text=PHOTO`); 
                }
                // Update localStorage session with potentially more complete data
                localStorage.setItem("currentApplicantSession", JSON.stringify({
                    appId: mappedFetchedData.applicationId,
                    email: mappedFetchedData.email,
                    fullName: mappedFetchedData.fullName,
                    admissionStatus: mappedFetchedData.admissionStatus,
                    admission_number: mappedFetchedData.admission_number,
                    submitted_at: mappedFetchedData.submitted_at,
                }));
                setApplicantSession(JSON.parse(localStorage.getItem("currentApplicantSession")!));


                if (mappedFetchedData.admissionStatus === "Admitted" || mappedFetchedData.admissionStatus === "Not Admitted" || mappedFetchedData.admissionStatus === "Pending") {
                    setCurrentTab("preview"); // Go to preview if already submitted
                } else {
                    setCurrentTab(formTabs[0].id);
                }

            } else { // Applicant not found in the list from get-applicants.php
                form.reset({
                    ...form.formState.defaultValues,
                    applicationId: session.appId,
                    email: session.email,
                    fullName: session.fullName || "",
                    admissionStatus: (session.admissionStatus as FormValues['admissionStatus']) || "Not Submitted",
                     admission_number: session.admission_number || undefined,
                });
                setCompletedApplicationData(null);
                toast({ title: "Application Data", description: `Your application (ID: ${session.appId}) was not found in the main list. Please fill the form if this is your first time.`, duration: 7000 });
                setCurrentTab(formTabs[0].id);
            }
        } else { // API call was successful but data format was unexpected or result.success was false
             form.reset({
                ...form.formState.defaultValues,
                applicationId: session.appId,
                email: session.email,
                fullName: session.fullName || "",
                admissionStatus: (session.admissionStatus as FormValues['admissionStatus']) || "Not Submitted",
                admission_number: session.admission_number || undefined,
            });
            setCompletedApplicationData(null);
            toast({ title: "Application Data", description: result.message || "Could not retrieve full application details. Please fill the form.", duration: 7000 });
            setCurrentTab(formTabs[0].id);
        }
    } catch (error: any) {
        console.error("Error fetching applicant data:", error);
        toast({ variant: "destructive", title: "Network Error", description: "Could not fetch your application data." });
        form.reset({ // Fallback to session data for initial fields
            ...form.formState.defaultValues,
            applicationId: session.appId,
            email: session.email,
            fullName: session.fullName || "",
            admissionStatus: (session.admissionStatus as FormValues['admissionStatus']) || "Not Submitted",
            admission_number: session.admission_number || undefined,
        });
        setCompletedApplicationData(null);
        setCurrentTab(formTabs[0].id);
    } finally {
        setIsFetchingData(false);
    }
  }, [form, toast, mapRawApplicantData]);


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
          throw new Error("Incomplete session data from localStorage (appId or email missing).");
        }
      } catch (error) {
        console.error("Failed to parse session or incomplete session:", error);
        toast({ variant: "destructive", title: "Session Error", description: "Invalid session. Please log in again." });
        router.push("/registration/login");
      }
    } else {
      toast({ variant: "destructive", title: "Unauthorized", description: "Please login to access your dashboard." });
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
        toast({ variant: "destructive", title: "Invalid File Type", description: "Only JPG, JPEG, and PNG images are allowed for photograph."});
        setPhotographPreview(null);
        form.setValue('photographFile', null);
        event.target.value = ""; 
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ variant: "destructive", title: "File Too Large", description: `Photograph size cannot exceed ${MAX_FILE_SIZE_MB}MB.`});
        setPhotographPreview(null);
        form.setValue('photographFile', null);
        event.target.value = ""; 
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotographPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('photographFile', files);
    } else {
      setPhotographPreview(null);
      form.setValue('photographFile', null);
    }
  };

  const handleAddOLevel = () => {
    if (oLevelFields.length < MAX_O_LEVEL_SITTINGS) {
      appendOLevel({ id: crypto.randomUUID(), examType: "", examYear: "", examNumber: "", subjects: [], fileInput: null, file: undefined });
    } else {
      toast({ title: "Limit Reached", description: `You can add a maximum of ${MAX_O_LEVEL_SITTINGS} O-Level sittings.`, variant: "destructive" });
    }
  };

  const handleAddALevel = () => {
     if ((aLevelFields?.length || 0) < MAX_QUALIFICATIONS) {
      appendALevel({ id: crypto.randomUUID(), type: "", institution: "", courseOfStudy:"", gradeOrClass:"", yearAwarded: "", fileInput: null, file: undefined });
    } else {
      toast({ title: "Limit Reached", description: `Maximum ${MAX_QUALIFICATIONS} A-Level/Other qualifications.`, variant: "destructive" });
    }
  };
  const handleAddExperience = () => {
     if ((experienceFields?.length || 0) < MAX_EXPERIENCES) {
      appendExperience({ id: crypto.randomUUID(), organization: "", role: "", startDate:"", endDate:"", fileInput: null, file: undefined }); 
    } else {
      toast({ title: "Limit Reached", description: `Maximum ${MAX_EXPERIENCES} work experiences.`, variant: "destructive" });
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
        toast({ title: "Application Status", description: `Your application is already ${currentStatus.toLowerCase()}. No further submissions allowed.`, duration: 5000 });
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
      admission_number: data.admission_number,
      submitted_at: new Date(), // Set submission date on client submission
    };

    delete (applicationDataToSubmit as any).photographFile;
    applicationDataToSubmit.oLevels?.forEach(ol => delete (ol as any).fileInput);
    applicationDataToSubmit.aLevels?.forEach(al => delete (al as any).fileInput);
    applicationDataToSubmit.experiences?.forEach(exp => delete (exp as any).fileInput);
    delete (applicationDataToSubmit as any).terms;


    try {
        const response = await fetch('https://sajfoods.net/api/siat/submit-application.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationDataToSubmit),
        });
        
        const rawResponseText = await response.text();
        let result;
        try {
            result = JSON.parse(rawResponseText);
        } catch (e) {
            throw new Error(`Invalid JSON response from server: ${rawResponseText.substring(0,100)}`);
        }


        if (result.success) {
            toast({ title: "Application Submitted Successfully!", description: `API: ${result.message}. Your application (ID: ${applicationDataToSubmit.applicationId}) is now under review.`, duration: 7000 });
            // Update completedApplicationData to reflect the submitted data
            const updatedDataForState = { ...applicationDataToSubmit, submitted_at: new Date() };
            setCompletedApplicationData(updatedDataForState); 
             if (applicantSession) { 
                localStorage.setItem("currentApplicantSession", JSON.stringify({
                    ...applicantSession,
                    fullName: updatedDataForState.fullName || applicantSession.fullName,
                    admissionStatus: "Pending",
                    admission_number: updatedDataForState.admission_number || applicantSession.admission_number,
                    submitted_at: updatedDataForState.submitted_at
                }));
                setApplicantSession(JSON.parse(localStorage.getItem("currentApplicantSession")!));
             }
            setCurrentTab("preview"); 
            // No need to refetch immediately, as we've updated the state locally
            // fetchAndSetInitialData(applicantSession); // Re-enable if server might make immediate changes
        } else {
            toast({ variant: "destructive", title: "API Submission Failed", description: result.message || "The application could not be submitted to the server." });
        }

      } catch (e: any) {
        console.error("Failed to submit application to API:", e);
        toast({ variant: "destructive", title: "Submission Error", description: e.message || "Your application could not be submitted. Please check your connection or try again later." });
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

    if (!output) {
        toast({variant: "destructive", title:"Incomplete Section", description: `Please complete all required fields in the "${formTabs[currentStep].name}" section before proceeding.`});
        return;
    }

    if (currentStep < formTabs.length - 1) {
      setCurrentTab(formTabs[currentStep + 1].id);
      const formArea = document.getElementById('application-form-area');
      if (formArea) formArea.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const prevTab = () => {
    const currentTabIndex = formTabs.findIndex(t => t.id === currentTab);
    if (currentTabIndex > 0) {
      setCurrentTab(formTabs[currentTabIndex - 1].id);
       const formArea = document.getElementById('application-form-area');
      if (formArea) formArea.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrintAdmissionLetter = () => {
    const content = admissionLetterContentRef.current;
    if (content && completedApplicationData && completedApplicationData.admissionStatus === "Admitted") {
      const printWindow = window.open('', '', 'height=800,width=600');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Provisional Admission Letter</title>');
        printWindow.document.write(
`           <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
            .letter-container { max-width: 700px; margin: auto; padding: 20px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid hsl(var(--primary)); padding-bottom: 15px; }
            .header img { max-height: 70px; margin-bottom: 10px; } /* Use img for print */
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
          </style>
`
        );
        printWindow.document.write('</head><body>');
        const rootStyles = getComputedStyle(document.documentElement);
        const cssVars = `--primary: ${rootStyles.getPropertyValue('--primary')}; --foreground: ${rootStyles.getPropertyValue('--foreground')}; --accent: ${rootStyles.getPropertyValue('--accent')};`;
        printWindow.document.write(`<div style="${cssVars}">`); 
        
        let contentHtml = content.innerHTML;
        const logoPlaceholder = content.querySelector('[data-arewa-logo]');
        if (logoPlaceholder) {
            const logoImgHtml = `<img src="/assets/arewa-logo.svg" alt="Institute Logo" style="max-height: 70px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" data-ai-hint="school logo print" />`;
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
      toast({ variant: "destructive", title: "Print Error", description: "Admission data not available or status not 'Admitted'." });
    }
  };

  const currentStep = formTabs.findIndex(step => step.id === currentTab);
  const appStatus = completedApplicationData?.admissionStatus || applicantSession?.admissionStatus || "Not Submitted";
  
  if (isFetchingData || !applicantSession) { 
      return (
          <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height,4rem)-var(--footer-height,4rem))]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Loading application dashboard...</p>
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
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50" />
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
                    <div className="flex items-center p-4 bg-muted/50 rounded-md">
                        <FileClock className="h-8 w-8 text-destructive mr-4" />
                        <div>
                            <p className="font-semibold text-lg text-destructive">Status: Application Incomplete</p>
                            <p className="text-sm text-muted-foreground">Please complete all sections of the form below and submit your application.</p>
                        </div>
                    </div>
                )}
                {appStatus === "Pending" && (
                    <div className="flex items-center p-4 bg-yellow-500/10 rounded-md">
                        <Hourglass className="h-8 w-8 text-yellow-600 mr-4" />
                        <div>
                            <p className="font-semibold text-lg text-yellow-700">Status: Submitted - Under Review</p>
                            <p className="text-sm text-muted-foreground">Your application has been successfully submitted and is currently under review. You will be notified of any updates.</p>
                        </div>
                    </div>
                )}
                {completedApplicationData && completedApplicationData.admissionStatus === "Admitted" && (
                    <div className="flex flex-col sm:flex-row items-center p-4 bg-primary/10 rounded-md">
                        <UserCheck className="h-10 w-10 text-primary mr-4 mb-2 sm:mb-0" />
                        <div className="text-center sm:text-left">
                            <p className="font-semibold text-xl text-primary">Congratulations, {completedApplicationData.fullName || "Applicant"}! You have been Admitted!</p>
                            <p className="text-sm text-muted-foreground">You have been provisionally admitted to study <span className="font-semibold">{completedApplicationData.preferredProgram || "(Program not specified)"}</span>. 
                            Your Admission Number is <span className="font-semibold text-accent">{completedApplicationData.admission_number || "(Not yet assigned)"}</span>.
                            Further instructions will be communicated shortly.</p>
                            <Button className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setIsAdmissionLetterDialogOpen(true)}>
                                <Printer className="mr-2 h-4 w-4" /> Print Provisional Admission Letter
                            </Button>
                        </div>
                    </div>
                )}
                {completedApplicationData && completedApplicationData.admissionStatus === "Not Admitted" && (
                    <div className="flex items-center p-4 bg-destructive/10 rounded-md">
                        <XCircle className="h-8 w-8 text-destructive mr-4" />
                        <div>
                            <p className="font-semibold text-lg text-destructive">Admission Status Update</p>
                            <p className="text-sm text-muted-foreground">
                                We regret to inform you that your application for {completedApplicationData.preferredProgram || "(Program not specified)"} was not successful at this time.
                                {completedApplicationData.rejectionReason && completedApplicationData.rejectionReason !== "No specific reason provided." && (
                                    <span className="block mt-1">Reason: {completedApplicationData.rejectionReason}</span>
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">We wish you the best in your future endeavors.</p>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => { 
                    if(applicantSession) fetchAndSetInitialData(applicantSession);
                }}
                disabled={isFetchingData}
                >
                    {isFetchingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>} 
                    {isFetchingData ? "Refreshing..." : "Refresh Status & Data"}
                </Button>
            </CardFooter>
        </Card>


        {/* Conditional rendering of application form OR detailed view */}
        {appStatus === "Not Submitted" ? (
            <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start mt-8" id="application-form-area">
                 <div className="md:col-span-4 lg:col-span-3 p-4 md:p-6 bg-background rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-primary mb-6">Application Progress</h3>
                    <div className="relative space-y-8">
                    {applicationCompletionSteps.map((step, index) => (
                        <div key={step.id} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                            <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                                index < currentStep && 'bg-primary border-primary text-primary-foreground',
                                index === currentStep && 'bg-accent border-accent text-accent-foreground animate-pulse',
                                index > currentStep && 'bg-background border-border text-muted-foreground'
                            )}
                            >
                            {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                            </div>
                            {index < applicationCompletionSteps.length - 1 && (
                            <div className={cn(
                                "w-0.5 grow mt-2",
                                index < currentStep ? 'bg-primary' : 'bg-border',
                                (applicationCompletionSteps.length - 1 - index) === 1 && index < currentStep ? 'h-8' : '', 
                                (applicationCompletionSteps.length - 1 - index) > 1 || index >= currentStep ? 'h-10' : '' 
                            )}></div>
                            )}
                        </div>
                        <div>
                            <p className={cn(
                            "font-medium",
                            index === currentStep ? 'text-accent' : (index < currentStep ? 'text-primary' : 'text-muted-foreground')
                            )}>
                            {step.title}
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="md:col-span-8 lg:col-span-9">
                    <Card className="w-full shadow-xl border-primary/10">
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl md:text-2xl font-bold text-primary">Complete Your Application Form</CardTitle>
                            <CardDescription className="text-md">
                            Fill all required fields in each tab.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
                                    {formTabs.map(tab => (
                                    <TabsTrigger key={tab.id} value={tab.id} onClick={async (e) => {
                                        const currentTabIndex = formTabs.findIndex(t => t.id === currentTab);
                                        const targetTabIndex = formTabs.findIndex(t => t.id === tab.id);
                                        
                                        if (targetTabIndex <= currentTabIndex) {
                                            setCurrentTab(tab.id);
                                            return;
                                        }

                                        const fieldsToValidate = formTabs[currentTabIndex].fields as FieldName[] | undefined;
                                        if (fieldsToValidate) {
                                            const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });
                                            if (isValid) {
                                                setCurrentTab(tab.id);
                                            } else {
                                                e.preventDefault(); 
                                                toast({variant: "destructive", title:"Incomplete Section", description: `Please complete all required fields in the "${formTabs[currentTabIndex].name}" section before proceeding.`})
                                            }
                                        } else {
                                            setCurrentTab(tab.id);
                                        }
                                    }}>
                                        {tab.name}
                                    </TabsTrigger>
                                    ))}
                                </TabsList>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <TabsContent value="bio-data" className="space-y-6 animate-in fade-in-50">
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
                                        {!photographPreview && form.getValues("photograph")?.name && ( 
                                            <div className="mt-2 text-center">
                                                <Image src={`https://placehold.co/150x150.png?text=PHOTO`} alt="Photograph Placeholder" width={150} height={150} className="rounded-md border object-cover mx-auto" data-ai-hint="applicant passport photo"/>
                                            </div>
                                        )}
                                        {!photographPreview && !form.getValues("photograph")?.name && ( 
                                            <div className="mt-2 text-center">
                                                <div className="w-[150px] h-[150px] bg-muted rounded-md border flex items-center justify-center mx-auto">
                                                    <UserIcon className="w-16 h-16 text-muted-foreground" data-ai-hint="photo placeholder" />
                                                </div>
                                            </div>
                                        )}
                                        <FormField control={form.control} name="fullName" render={({ field }) => (
                                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name (Surname Firstname Othername)" {...field} disabled={!!applicantSession.fullName} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} disabled={!!applicantSession.email} /></FormControl><FormMessage /></FormItem>
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
                                        <OLevelSittingItem
                                            key={item.id}
                                            control={form.control}
                                            oLevelIndex={oLevelIndex}
                                            removeOLevelSitting={removeOLevel}
                                            form={form}
                                        />
                                        ))}
                                        {oLevelFields.length < MAX_O_LEVEL_SITTINGS && (
                                            <Button type="button" variant="outline" onClick={handleAddOLevel} className="text-accent border-accent hover:bg-accent/10">
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add O-Level Sitting
                                            </Button>
                                        )}
                                        {(form.formState.errors.oLevels as any)?.root && oLevelFields.length === 0 && (
                                            <FormMessage>{(form.formState.errors.oLevels as any).root.message}</FormMessage>
                                        )}
                                        {form.formState.errors.oLevels && !form.formState.errors.oLevels?.root && oLevelFields.length === 0 && (
                                            <FormMessage>At least one O-Level sitting is required.</FormMessage>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="a-level" className="space-y-6 animate-in fade-in-50">
                                        <CardTitle className="text-xl text-primary">A-Level / Other Qualifications (Optional)</CardTitle>
                                        {aLevelFields.map((item, index) => (
                                        <ALevelSittingItem
                                            key={item.id}
                                            control={form.control}
                                            itemIndex={index}
                                            removeItem={removeALevel}
                                            form={form}
                                            itemType="aLevel"
                                        />
                                        ))}
                                        {(aLevelFields?.length || 0) < MAX_QUALIFICATIONS && (
                                            <Button type="button" variant="outline" onClick={handleAddALevel} className="text-accent border-accent hover:bg-accent/10">
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add A-Level/Other Qualification
                                            </Button>
                                        )}
                                        
                                        <CardTitle className="text-xl text-primary pt-4 border-t">Work Experience (Optional)</CardTitle>
                                        {experienceFields.map((item, index) => (
                                        <ALevelSittingItem 
                                            key={item.id}
                                            control={form.control}
                                            itemIndex={index} 
                                            removeItem={removeExperience} 
                                            form={form}
                                            itemType="experience"
                                        />
                                        ))}
                                        {(experienceFields?.length || 0) < MAX_EXPERIENCES && (
                                            <Button type="button" variant="outline" onClick={handleAddExperience} className="text-accent border-accent hover:bg-accent/10">
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
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
                                            <PreviewItemDisplay label="Photograph" value={processFileUpload(form.getValues("photographFile"))?.name || form.getValues("photograph")?.name || "(Not uploaded)"} />
                                            {photographPreview ? (
                                                <div className="text-center">
                                                    <Image src={photographPreview} alt="Photograph Preview" width={100} height={100} className="rounded-md border object-cover mx-auto shadow-md" data-ai-hint="application passport photo"/>
                                                </div>
                                            ) : form.getValues("photograph")?.name ? (
                                                <div className="text-center">
                                                    <Image src={`https://placehold.co/100x100.png?text=PHOTO`} alt="Photograph" width={100} height={100} className="rounded-md border object-cover mx-auto shadow-md" data-ai-hint="applicant passport photo"/>
                                                </div>
                                            ) : null}
                                            <PreviewItemDisplay label="Full Name" value={form.getValues("fullName")} />
                                            <PreviewItemDisplay label="Email" value={form.getValues("email")} />
                                            <PreviewItemDisplay label="Phone Number" value={form.getValues("phoneNumber")} />
                                            <PreviewItemDisplay label="Date of Birth" value={form.getValues("dateOfBirth") ? format(form.getValues("dateOfBirth")!, "PPP") : "(Data not provided)"} />
                                            <PreviewItemDisplay label="Gender" value={form.getValues("gender")} />
                                            <PreviewItemDisplay label="Address" value={form.getValues("address")} />
                                            <PreviewItemDisplay label="City" value={form.getValues("city")} />
                                            <PreviewItemDisplay label="State of Origin" value={form.getValues("stateOfOrigin")} />
                                            <PreviewItemDisplay label="Nationality" value={form.getValues("nationality")} />


                                            <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">Next of Kin</h3>
                                            <PreviewItemDisplay label="Full Name" value={form.getValues("nextOfKinName")} />
                                            <PreviewItemDisplay label="Phone" value={form.getValues("nextOfKinPhone")} />
                                            <PreviewItemDisplay label="Relationship" value={form.getValues("nextOfKinRelationship")} />

                                            <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">O-Level Qualifications</h3>
                                            {form.getValues("oLevels").map((ol, i) => (
                                                <div key={ol.id} className="p-3 border rounded-md bg-muted/30">
                                                    <p className="font-medium">O-Level Sitting {i + 1}: {ol.examType} ({ol.examYear})</p>
                                                    <PreviewItemDisplay label="Exam No" value={ol.examNumber || "(Not provided)"}/>
                                                    <ul className="list-disc list-inside pl-4 text-sm">
                                                        {(ol.subjects || []).map(sub => <li key={sub.id}>{sub.subject}: {sub.grade}</li>)}
                                                    </ul>
                                                    <PreviewItemDisplay label="Certificate" value={processFileUpload(ol.fileInput)?.name || ol.file?.name || "(Not uploaded)"} />
                                                </div>
                                            ))}

                                            {form.getValues("aLevels") && form.getValues("aLevels")!.length > 0 && (
                                                <>
                                                    <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">A-Level/Other Qualifications</h3>
                                                    {form.getValues("aLevels")!.map((al, i) => (
                                                    <div key={al.id} className="p-3 border rounded-md bg-muted/30">
                                                        <p className="font-medium">Qualification {i + 1}: {al.type}</p>
                                                        <PreviewItemDisplay label="Institution" value={al.institution} />
                                                        <PreviewItemDisplay label="Course" value={al.courseOfStudy || "(Not provided)"} />
                                                        <PreviewItemDisplay label="Grade/Class" value={al.gradeOrClass || "(Not provided)"} />
                                                        <PreviewItemDisplay label="Year Awarded" value={al.yearAwarded} />
                                                        <PreviewItemDisplay label="Certificate" value={processFileUpload(al.fileInput)?.name || al.file?.name || "(Not uploaded)"} />
                                                    </div>
                                                    ))}
                                                </>
                                            )}

                                            {form.getValues("experiences") && form.getValues("experiences")!.length > 0 && (
                                                <>
                                                    <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">Work Experience</h3>
                                                    {form.getValues("experiences")!.map((exp, i) => (
                                                    <div key={exp.id} className="p-3 border rounded-md bg-muted/30">
                                                        <p className="font-medium">Experience {i + 1}: {exp.role} at {exp.organization}</p>
                                                        <PreviewItemDisplay label="Duration" value={`${exp.startDate || "(Not provided)"} to ${exp.endDate || "(Not provided)"}`} />
                                                        <PreviewItemDisplay label="Document" value={processFileUpload(exp.fileInput)?.name || exp.file?.name || "(Not uploaded)"} />
                                                    </div>
                                                    ))}
                                                </>
                                            )}

                                            <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">Program Choice</h3>
                                            <PreviewItemDisplay label="Preferred Program" value={form.getValues("preferredProgram")} />
                                            <PreviewItemDisplay label="Preferred Campus" value={form.getValues("preferredCampus")} />
                                            <PreviewItemDisplay label="Entry Mode" value={form.getValues("entryMode")} />
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
                                        {formTabs.findIndex(t => t.id === currentTab) > 0 && (
                                            <Button type="button" variant="outline" onClick={prevTab} disabled={isLoading}>
                                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                            </Button>
                                        )}
                                        {formTabs.findIndex(t => t.id === currentTab) < formTabs.length - 1 && (
                                            <Button type="button" onClick={nextTab} className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                                            Next <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}
                                        {currentTab === formTabs[formTabs.length - 1].id && (
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
            </div>
        ) : completedApplicationData ? (
            // Detailed Read-Only View for Submitted Applications
            <Card className="w-full shadow-xl border-primary/10 mt-8">
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-bold text-primary">My Submitted Application</CardTitle>
                     <div className="text-sm text-muted-foreground">
                        <p>Application ID: <span className="font-semibold text-accent">{completedApplicationData.applicationId}</span></p>
                        {completedApplicationData.submitted_at && (
                            <p>Submitted On: <span className="font-semibold">{formatDateSafe(completedApplicationData.submitted_at, true)}</span></p>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Personal Information Section */}
                    <section>
                        <h3 className="font-semibold text-lg text-primary flex items-center gap-2 mb-3 border-b pb-2"><UserCog className="h-5 w-5"/>Personal Information</h3>
                        {completedApplicationData.photograph && completedApplicationData.photograph.name && (
                            <div className="my-3 flex flex-col items-center sm:items-start">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Photograph:</p>
                                <Image 
                                    src={`https://placehold.co/150x150.png?text=PHOTO`} // Placeholder as actual image not stored/retrieved this way
                                    alt="Applicant Photograph" 
                                    width={150} height={150} 
                                    className="rounded-md border object-cover shadow-sm"
                                    data-ai-hint="applicant photo"
                                />
                                <p className="text-xs text-muted-foreground mt-1">{completedApplicationData.photograph.name} ({completedApplicationData.photograph.size ? (completedApplicationData.photograph.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})</p>
                            </div>
                        )}
                         {!completedApplicationData.photograph && (
                             <div className="my-3 flex flex-col items-center sm:items-start">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Photograph:</p>
                                <div className="w-[150px] h-[150px] bg-muted rounded-md border flex items-center justify-center">
                                    <UserIcon className="w-16 h-16 text-muted-foreground" data-ai-hint="photo placeholder" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">(Photograph not provided or not loaded)</p>
                            </div>
                        )}
                        <PreviewItemDisplay label="Full Name" value={completedApplicationData.fullName} />
                        <PreviewItemDisplay label="Email" value={completedApplicationData.email} />
                        <PreviewItemDisplay label="Phone Number" value={completedApplicationData.phoneNumber} />
                        <PreviewItemDisplay label="Date of Birth" value={formatDateSafe(completedApplicationData.dateOfBirth)} />
                        <PreviewItemDisplay label="Gender" value={completedApplicationData.gender} />
                        <PreviewItemDisplay label="Address" value={completedApplicationData.address} />
                        <PreviewItemDisplay label="City" value={completedApplicationData.city} />
                        <PreviewItemDisplay label="State of Origin" value={completedApplicationData.stateOfOrigin} />
                        <PreviewItemDisplay label="Nationality" value={completedApplicationData.nationality} />
                    </section>
                    <Separator/>

                    {/* Next of Kin Section */}
                    <section>
                        <h3 className="font-semibold text-lg text-primary flex items-center gap-2 mb-3 border-b pb-2 pt-3"><HeartHandshake className="h-5 w-5"/>Next of Kin Information</h3>
                        <PreviewItemDisplay label="Full Name" value={completedApplicationData.nextOfKinName} />
                        <PreviewItemDisplay label="Phone Number" value={completedApplicationData.nextOfKinPhone} />
                        <PreviewItemDisplay label="Relationship" value={completedApplicationData.nextOfKinRelationship} />
                    </section>
                    <Separator/>
                    
                    {/* Academic Qualifications Section */}
                    <section>
                        <h3 className="font-semibold text-lg text-primary flex items-center gap-2 mb-3 border-b pb-2 pt-3"><BookCopy className="h-5 w-5"/>Academic Qualifications</h3>
                        
                        <h4 className="font-medium text-md text-primary/90 mt-2 mb-1">O-Level Qualifications</h4>
                        {(completedApplicationData.oLevels || []).length === 0 && <p className="text-sm text-muted-foreground">No O-Level qualifications provided.</p>}
                        {(completedApplicationData.oLevels || []).map((ol, index) => (
                            <Card key={ol.id || `ol-${index}`} className="p-3 my-2 bg-muted/30 border-muted-foreground/30">
                                <CardHeader className="p-0 pb-2">
                                    <CardTitle className="text-base font-medium">O-Level Sitting {index + 1}: {ol.examType}</CardTitle>
                                    <CardDescription className="text-xs">{ol.examYear} {ol.examNumber ? `- Exam No: ${ol.examNumber}` : ''}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0 space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground pt-1">Subjects & Grades:</p>
                                    {(ol.subjects || []).length === 0 ? (
                                        <p className="text-xs text-muted-foreground pl-4">No subjects listed for this sitting.</p>
                                    ) : (
                                        <ul className="list-disc list-inside pl-4 text-sm space-y-0.5">
                                        {(ol.subjects || []).map(sub => <li key={sub.id || sub.subject}>{sub.subject}: <span className="font-semibold">{sub.grade}</span></li>)}
                                        </ul>
                                    )}
                                    <PreviewItemDisplay label="Certificate Uploaded" value={ol.file?.name ? `${ol.file.name} (${ol.file.size ? (ol.file.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})` : "(Not uploaded)"} className="border-none pt-2"/>
                                </CardContent>
                            </Card>
                        ))}

                        {(completedApplicationData.aLevels || []).length > 0 && (
                            <>
                                <h4 className="font-medium text-md text-primary/90 mt-4 mb-1">A-Level / Other Qualifications</h4>
                                {(completedApplicationData.aLevels || []).map((al, index) => (
                                    <Card key={al.id || `al-${index}`} className="p-3 my-2 bg-muted/30 border-muted-foreground/30">
                                         <CardHeader className="p-0 pb-2">
                                            <CardTitle className="text-base font-medium">Qualification {index + 1}: {al.type}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 space-y-1">
                                            <PreviewItemDisplay label="Institution" value={al.institution} className="border-none"/>
                                            <PreviewItemDisplay label="Course of Study" value={al.courseOfStudy} className="border-none"/>
                                            <PreviewItemDisplay label="Grade/Class" value={al.gradeOrClass} className="border-none"/>
                                            <PreviewItemDisplay label="Year Awarded" value={al.yearAwarded} className="border-none"/>
                                            <PreviewItemDisplay label="Certificate Uploaded" value={al.file?.name ? `${al.file.name} (${al.file.size ? (al.file.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})` : "(Not uploaded)"} className="border-none pt-2"/>
                                        </CardContent>
                                    </Card>
                                ))}
                            </>
                        )}
                    </section>
                    <Separator/>

                    {/* Work Experience Section */}
                    {(completedApplicationData.experiences || []).length > 0 && (
                        <section>
                            <h3 className="font-semibold text-lg text-primary flex items-center gap-2 mb-3 border-b pb-2 pt-3"><Briefcase className="h-5 w-5"/>Work Experience</h3>
                            {(completedApplicationData.experiences || []).map((exp, index) => (
                                 <Card key={exp.id || `exp-${index}`} className="p-3 my-2 bg-muted/30 border-muted-foreground/30">
                                    <CardHeader className="p-0 pb-2">
                                        <CardTitle className="text-base font-medium">Experience {index + 1}: {exp.role}</CardTitle>
                                        <CardDescription className="text-xs">{exp.organization}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 space-y-1">
                                        <PreviewItemDisplay label="Start Date" value={exp.startDate ? formatDateSafe(exp.startDate) : "(Not provided)"} className="border-none"/>
                                        <PreviewItemDisplay label="End Date" value={exp.endDate ? formatDateSafe(exp.endDate) : "(Not provided)"} className="border-none"/>
                                         <PreviewItemDisplay label="Document Uploaded" value={exp.file?.name ? `${exp.file.name} (${exp.file.size ? (exp.file.size / 1024).toFixed(1) + 'KB' : 'Size N/A'})` : "(Not uploaded)"} className="border-none pt-2"/>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>
                    )}
                     <Separator/>

                    {/* Program Choice Section */}
                    <section>
                        <h3 className="font-semibold text-lg text-primary flex items-center gap-2 mb-3 border-b pb-2 pt-3"><GraduationCap className="h-5 w-5"/>Program Choice</h3>
                        <PreviewItemDisplay label="Preferred Program" value={completedApplicationData.preferredProgram} />
                        <PreviewItemDisplay label="Preferred Campus" value={completedApplicationData.preferredCampus} />
                        <PreviewItemDisplay label="Entry Mode" value={completedApplicationData.entryMode} />
                    </section>
                    
                    {completedApplicationData.admissionStatus === "Not Admitted" && completedApplicationData.rejectionReason && (
                      <>
                        <Separator/>
                        <section>
                          <h3 className="font-semibold text-lg text-destructive flex items-center gap-2 mb-3 border-b border-destructive/30 pb-2 pt-3">
                           Rejection Reason
                          </h3>
                          <PreviewItemDisplay label="Reason" value={completedApplicationData.rejectionReason} className="border-destructive/30"/>
                        </section>
                      </>
                    )}

                </CardContent>
            </Card>
        ) : null}


        {completedApplicationData && completedApplicationData.admissionStatus === "Admitted" && (
          <PrintDialog open={isAdmissionLetterDialogOpen} onOpenChange={setIsAdmissionLetterDialogOpen}>
            <PrintDialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
              <PrintDialogHeader>
                  <PrintDialogTitle className="text-primary text-xl">Provisional Admission Letter for {completedApplicationData.fullName || "Applicant"}</PrintDialogTitle>
                  <PrintDialogDescription>
                      Please print this letter for your records. Official letter will be provided upon physical verification.
                  </PrintDialogDescription>
              </PrintDialogHeader>

              <ScrollArea className="flex-grow overflow-y-auto p-1">
                  <div ref={admissionLetterContentRef} className="printable-admission-letter p-4 bg-white text-black">
                      <div className="header text-center mb-6">
                          <ArewaLogo data-arewa-logo className="h-16 w-16 mx-auto mb-2 text-[hsl(var(--primary))]" />
                          <h1 className="text-xl font-bold">SCHOLARS INSTITUTE OF ARTS & TECHNOLOGY, ZARIA</h1>
                          <h2 className="text-sm">Km 5, Zaria-Kano Road, Zaria, Kaduna State, Nigeria.</h2>
                          <p className="text-lg font-semibold mt-4">PROVISIONAL ADMISSION LETTER</p>
                      </div>

                      <div className="applicant-details mb-4">
                          <p><strong>Date:</strong> {format(new Date(), "PPP")}</p>
                           <div className="details-grid">
                                <p><strong>Applicant Name:</strong> {completedApplicationData.fullName || "(Data not provided)"}</p>
                                <p><strong>Application ID:</strong> {completedApplicationData.applicationId || "(Data not provided)"}</p>
                                <p><strong>Date of Birth:</strong> {completedApplicationData.dateOfBirth ? format(new Date(completedApplicationData.dateOfBirth), "PPP") : "(Data not provided)"}</p>
                                <p><strong>Gender:</strong> {completedApplicationData.gender || "(Data not provided)"}</p>
                                <p><strong>Phone Number:</strong> {completedApplicationData.phoneNumber || "(Data not provided)"}</p>
                                <p><strong>Email:</strong> {completedApplicationData.email || "(Data not provided)"}</p>
                                <p style={{ gridColumn: '1 / -1' }}><strong>Address:</strong> {completedApplicationData.address || "(Data not provided)"}</p>
                           </div>
                      </div>

                      <div className="admission-details mb-4">
                          <p>Dear {completedApplicationData.fullName || "Applicant"},</p>
                          <p className="mt-2">
                              We are pleased to inform you that you have been offered provisional admission into the <strong>Scholars Institute of Arts & Technology, Zaria</strong>
                              to study <strong>{completedApplicationData.preferredProgram || "(Program not specified)"}</strong> for the {new Date().getFullYear()}/{new Date().getFullYear()+1} academic session.
                          </p>
                          <p>
                            Your Admission Number for this program is: <strong style={{ color: 'hsl(var(--accent))' }}>{completedApplicationData.admission_number || "(Not yet assigned)"}</strong>.
                          </p>
                          <p className="mt-2">
                            This admission is for the <strong>{completedApplicationData.preferredCampus || "(Campus not specified)"}</strong> via <strong>{completedApplicationData.entryMode || "(Entry mode not specified)"}</strong> entry mode.
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
                                    {completedApplicationData.aLevels && completedApplicationData.aLevels.length > 0 && <li>A-Level/Diploma/NCE Certificate(s) (as applicable)</li>}
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

              <PrintDialogFooter className="mt-auto pt-4 border-t">
                  <PrintDialogClose asChild>
                      <Button type="button" variant="outline" disabled={!completedApplicationData}>Close</Button>
                  </PrintDialogClose>
                  <Button onClick={handlePrintAdmissionLetter} className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!completedApplicationData}>
                      <Printer className="mr-2 h-4 w-4" /> Print This Letter
                  </Button>
              </PrintDialogFooter>
            </PrintDialogContent>
          </PrintDialog>
        )}
    </div>
  );
}
    
