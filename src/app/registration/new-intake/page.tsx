
"use client";

import * as React from "react";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, PlusCircle, Trash2, UploadCloud, FileText, User as UserIcon, Loader2 } from "lucide-react";
import type { NewIntakeApplicationData, QualificationUpload, ExperienceUpload, FileUploadInfo } from "@/types";
import { submitNewIntakeApplicationAction } from "./actions";
import ArewaLogo from "@/components/arewa-logo";
import Link from "next/link";
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
}).optional();

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


const qualificationSchema = z.object({
  id: z.string(),
  type: z.string().min(1, "Qualification type is required."),
  institution: z.string().min(1, "Institution name is required."),
  yearAwarded: z.string().min(4, "Year is required.").max(4, "Invalid year."),
  fileInput: documentFileSchema,
  file: fileSchema, 
});

const experienceSchema = z.object({
  id: z.string(),
  organization: z.string().min(1, "Organization name is required."),
  role: z.string().min(1, "Role/Position is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  fileInput: documentFileSchema,
  file: fileSchema, 
});


const newIntakeFormSchema = z.object({
  applicationId: z.string().optional(),
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
  
  qualifications: z.array(qualificationSchema).min(1, "At least one qualification is required.").max(MAX_QUALIFICATIONS, `Maximum ${MAX_QUALIFICATIONS} qualifications.`),
  experiences: z.array(experienceSchema).max(MAX_EXPERIENCES, `Maximum ${MAX_EXPERIENCES} experiences.`).optional(),
  
  preferredProgram: z.string().min(1, "Please select a program."),
  preferredCampus: z.string().min(1, "Please select a campus."),
  entryMode: z.enum(["UTME", "Direct Entry", "Transfer"], { required_error: "Entry mode is required."}),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms.")
});

type FormValues = z.infer<typeof newIntakeFormSchema>;

const steps = [
  { id: 1, name: "Bio-data", fields: ["photographFile", "fullName", "email", "phoneNumber", "dateOfBirth", "gender", "address", "city", "stateOfOrigin", "nationality", "nextOfKinName", "nextOfKinPhone", "nextOfKinRelationship"] as const },
  { id: 2, name: "Qualifications", fields: ["qualifications"] as const },
  { id: 3, name: "Experience", fields: ["experiences"] as const },
  { id: 4, name: "Program Choice", fields: ["preferredProgram", "preferredCampus", "entryMode"] as const },
  { id: 5, name: "Preview & Submit", fields: ["terms"] as const },
];

const availablePrograms = [
    "Computer Science", "Software Engineering", "Mass Communication", "Business Administration",
    "Accounting", "Electrical Engineering Technology", "Public Administration", "Science Laboratory Technology"
];
const availableCampuses = ["Main Campus - Zaria", "Kaduna City Campus", "Kano Extension Center"];
const qualificationTypes = ["SSCE (WAEC/NECO/NABTEB)", "Diploma", "National Diploma (ND)", "NCE", "Bachelor's Degree", "Master's Degree", "Other"];
const genderOptions = ["Male", "Female", "Other"];
const entryModes = ["UTME", "Direct Entry", "Transfer"];


export default function NewIntakePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photographPreview, setPhotographPreview] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(newIntakeFormSchema),
    defaultValues: {
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
      qualifications: [],
      experiences: [],
      preferredProgram: "",
      preferredCampus: "",
      entryMode: undefined, 
      terms: false,
    },
  });

  const { fields: qualifications, append: appendQualification, remove: removeQualification } = useFieldArray({
    control: form.control,
    name: "qualifications",
  });

  const { fields: experiences, append: appendExperience, remove: removeExperience } = useFieldArray({
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

  const handleAddQualification = () => {
    if (qualifications.length < MAX_QUALIFICATIONS) {
      appendQualification({ id: crypto.randomUUID(), type: "", institution: "", yearAwarded: "", fileInput: null, file: undefined });
    } else {
      toast({ title: "Limit Reached", description: `You can add a maximum of ${MAX_QUALIFICATIONS} qualifications.`, variant: "destructive" });
    }
  };

  const handleAddExperience = () => {
     if ((experiences?.length || 0) < MAX_EXPERIENCES) {
      appendExperience({ id: crypto.randomUUID(), organization: "", role: "", startDate: "", endDate: "", fileInput: null, file: undefined });
    } else {
      toast({ title: "Limit Reached", description: `You can add a maximum of ${MAX_EXPERIENCES} experiences.`, variant: "destructive" });
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
      ...data,
      photograph: processFileUpload(data.photographFile),
      qualifications: data.qualifications.map(q => ({
        ...q,
        file: processFileUpload(q.fileInput),
      })),
      experiences: data.experiences?.map(e => ({
        ...e,
        file: processFileUpload(e.fileInput),
      })) || [],
    };
    
    delete (applicationDataToSubmit as any).photographFile;
    applicationDataToSubmit.qualifications.forEach(q => delete (q as any).fileInput);
    applicationDataToSubmit.experiences?.forEach(e => delete (e as any).fileInput);
    delete (applicationDataToSubmit as any).terms;


    const result = await submitNewIntakeApplicationAction(applicationDataToSubmit);
    
    // Even if API fails, we proceed with localStorage for prototype's admin view
    if (result.success && result.data && result.applicationId) {
      try {
        const existingApplicationsString = localStorage.getItem("newIntakeApplications");
        const existingApplications: NewIntakeApplicationData[] = existingApplicationsString ? JSON.parse(existingApplicationsString) : [];
        // Use the data returned by the action which includes the generated applicationId
        existingApplications.push(result.data); 
        localStorage.setItem("newIntakeApplications", JSON.stringify(existingApplications));
        
        toast({ title: "Application Update", description: result.message, duration: 10000 });
        form.reset();
        setPhotographPreview(null);
        setCurrentStep(0); 
        router.push("/"); 
      } catch (e) {
        console.error("Failed to save application to localStorage", e);
        toast({ variant: "destructive", title: "Local Save Failed", description: "Your application was submitted but could not be saved locally for admin preview." });
      }
    } else if (!result.success) { // Handle Zod validation errors or other critical server action failures
      toast({ variant: "destructive", title: "Submission Failed", description: result.message, duration: 7000 });
    }
    setIsLoading(false);
  };

 type FieldName = keyof FormValues;

  const nextStep = async () => {
    const currentFields = steps[currentStep].fields as FieldName[] | undefined;
    let output = true;
    if (currentFields) {
      output = await form.trigger(currentFields, { shouldFocus: true });
    }
    
    if (currentStep === steps.length - 1) {
        const termsOutput = await form.trigger(["terms"]);
        if (!termsOutput) output = false;
    }

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-xl border-2 border-primary/10">
          <CardHeader className="text-center">
            <Link href="/" className="inline-block mb-4">
                <ArewaLogo className="h-12 w-12 text-primary mx-auto" />
            </Link>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary">New Intake Application Portal</CardTitle>
            <CardDescription className="text-md">
              Complete all steps to submit your application to Scholars Institute of Arts & Technology.
            </CardDescription>
            <Progress value={progressValue} className="w-full mt-4 h-2" />
             <p className="text-sm text-muted-foreground mt-2">Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}</p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 0 && (
                  <section className="space-y-6 animate-in fade-in-50">
                    <FormField
                        control={form.control}
                        name="photographFile"
                        render={({ field }) => ( 
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
                        )}
                    />
                    {photographPreview && (
                        <div className="mt-2 text-center">
                            <Image src={photographPreview} alt="Photograph Preview" width={150} height={150} className="rounded-md border object-cover mx-auto" data-ai-hint="passport photograph"/>
                        </div>
                    )}
                    {!photographPreview && (
                         <div className="mt-2 text-center">
                            <div className="w-[150px] h-[150px] bg-muted rounded-md border flex items-center justify-center mx-auto">
                                <UserIcon className="w-16 h-16 text-muted-foreground" data-ai-hint="avatar placeholder" />
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
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
                                captionLayout="dropdown-buttons"
                                fromYear={1950}
                                toYear={new Date().getFullYear() - 15}
                              />
                            </PopoverContent></Popover><FormMessage /></FormItem>
                       )}/>
                    </div>
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
                  </section>
                )}

                {currentStep === 1 && (
                  <section className="space-y-6 animate-in fade-in-50">
                    <CardTitle className="text-xl text-primary">Academic Qualifications</CardTitle>
                    {qualifications.map((item, index) => (
                      <Card key={item.id} className="p-4 space-y-4 relative bg-muted/50">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeQualification(index)}>
                            <Trash2 className="h-4 w-4" /><span className="sr-only">Remove Qualification</span>
                        </Button>
                        <h4 className="font-medium text-primary">Qualification {index + 1}</h4>
                        <FormField control={form.control} name={`qualifications.${index}.type`} render={({ field }) => (
                          <FormItem><FormLabel>Qualification Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                              <SelectContent>{qualificationTypes.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                            </Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`qualifications.${index}.institution`} render={({ field }) => (
                          <FormItem><FormLabel>Institution Name</FormLabel><FormControl><Input placeholder="Name of school/body" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`qualifications.${index}.yearAwarded`} render={({ field }) => (
                          <FormItem><FormLabel>Year Awarded</FormLabel><FormControl><Input type="number" placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`qualifications.${index}.fileInput`} render={({ field: { onChange, value, ...rest } }) => ( 
                            <FormItem>
                                <FormLabel>Upload Certificate (PDF, JPG, PNG - Max 2MB)</FormLabel>
                                <FormControl>
                                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) {
                                            const file = files[0];
                                            if (!ALLOWED_DOC_TYPES.includes(file.type)) {
                                                toast({ variant: "destructive", title: "Invalid File Type", description: "Only PDF, JPG, JPEG, and PNG files are allowed."});
                                                e.target.value = ""; 
                                                onChange(null); 
                                                return;
                                            }
                                            if (file.size > MAX_FILE_SIZE_BYTES) {
                                                toast({ variant: "destructive", title: "File Too Large", description: `Document size cannot exceed ${MAX_FILE_SIZE_MB}MB.`});
                                                e.target.value = ""; 
                                                onChange(null);
                                                return;
                                            }
                                        }
                                        onChange(files);
                                    }} 
                                    {...rest} className="file:text-accent file:font-semibold"/>
                                </FormControl>
                                <FormMessage />
                                {value && value.length > 0 && <p className="text-xs text-muted-foreground">Selected: {value[0].name}</p>}
                            </FormItem>
                        )} />
                      </Card>
                    ))}
                    {qualifications.length < MAX_QUALIFICATIONS && (
                        <Button type="button" variant="outline" onClick={handleAddQualification} className="text-accent border-accent hover:bg-accent/10">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Qualification
                        </Button>
                    )}
                     {form.formState.errors.qualifications?.root && qualifications.length === 0 && (
                        <FormMessage>{form.formState.errors.qualifications.root.message}</FormMessage>
                     )}
                      {form.formState.errors.qualifications && !form.formState.errors.qualifications?.root && qualifications.length === 0 && (
                        <FormMessage>{form.formState.errors.qualifications.message}</FormMessage>
                     )}
                  </section>
                )}

                {currentStep === 2 && (
                  <section className="space-y-6 animate-in fade-in-50">
                    <CardTitle className="text-xl text-primary">Work Experience (Optional)</CardTitle>
                     {(experiences || []).map((item, index) => (
                      <Card key={item.id} className="p-4 space-y-4 relative bg-muted/50">
                         <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeExperience(index)}>
                            <Trash2 className="h-4 w-4" /><span className="sr-only">Remove Experience</span>
                        </Button>
                        <h4 className="font-medium text-primary">Experience {index + 1}</h4>
                        <FormField control={form.control} name={`experiences.${index}.organization`} render={({ field }) => (
                          <FormItem><FormLabel>Organization Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name={`experiences.${index}.role`} render={({ field }) => (
                          <FormItem><FormLabel>Role/Position</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name={`experiences.${index}.startDate`} render={({ field }) => (
                                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                             <FormField control={form.control} name={`experiences.${index}.endDate`} render={({ field }) => (
                                <FormItem><FormLabel>End Date (or expected)</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <FormField control={form.control} name={`experiences.${index}.fileInput`} render={({ field: { onChange, value, ...rest } }) => ( 
                            <FormItem>
                                <FormLabel>Upload Supporting Document (Optional)</FormLabel>
                                <FormControl>
                                     <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) {
                                            const file = files[0];
                                            if (!ALLOWED_DOC_TYPES.includes(file.type)) {
                                                toast({ variant: "destructive", title: "Invalid File Type", description: "Only PDF, JPG, JPEG, and PNG files are allowed."});
                                                e.target.value = "";
                                                onChange(null);
                                                return;
                                            }
                                            if (file.size > MAX_FILE_SIZE_BYTES) {
                                                toast({ variant: "destructive", title: "File Too Large", description: `Document size cannot exceed ${MAX_FILE_SIZE_MB}MB.`});
                                                e.target.value = ""; 
                                                onChange(null);
                                                return;
                                            }
                                        }
                                        onChange(files);
                                    }}
                                     {...rest} className="file:text-accent file:font-semibold"/>
                                </FormControl>
                                <FormMessage />
                                {value && value.length > 0 && <p className="text-xs text-muted-foreground">Selected: {value[0].name}</p>}
                            </FormItem>
                        )} />
                      </Card>
                    ))}
                    {(experiences?.length || 0) < MAX_EXPERIENCES && (
                        <Button type="button" variant="outline" onClick={handleAddExperience} className="text-accent border-accent hover:bg-accent/10">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                        </Button>
                    )}
                  </section>
                )}

                {currentStep === 3 && (
                  <section className="space-y-6 animate-in fade-in-50">
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
                  </section>
                )}
                
                {currentStep === 4 && (
                  <section className="space-y-6 animate-in fade-in-50">
                    <CardTitle className="text-xl text-primary">Application Preview</CardTitle>
                    <CardDescription>Please review all your information carefully before submitting.</CardDescription>
                    
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-primary border-b pb-1">Bio-data</h3>
                        <PreviewItem label="Photograph" value={processFileUpload(form.getValues("photographFile"))?.name || "Not uploaded"} />
                        {photographPreview && (
                            <div className="text-center">
                                <Image src={photographPreview} alt="Photograph Preview" width={100} height={100} className="rounded-md border object-cover mx-auto shadow-md" data-ai-hint="passport photograph small" />
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

                        <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">Qualifications</h3>
                        {form.getValues("qualifications").map((q, i) => (
                            <div key={q.id} className="p-3 border rounded-md bg-muted/30">
                                <p className="font-medium">Qualification {i + 1}: {q.type}</p>
                                <PreviewItem label="Institution" value={q.institution} />
                                <PreviewItem label="Year Awarded" value={q.yearAwarded} />
                                <PreviewItem label="Certificate" value={processFileUpload(q.fileInput)?.name || "Not uploaded / No file selected"} />
                            </div>
                        ))}

                        {form.getValues("experiences") && form.getValues("experiences")!.length > 0 && (
                            <>
                                <h3 className="font-semibold text-lg text-primary border-b pb-1 mt-6">Work Experience</h3>
                                {form.getValues("experiences")!.map((exp, i) => (
                                <div key={exp.id} className="p-3 border rounded-md bg-muted/30">
                                    <p className="font-medium">Experience {i + 1}: {exp.role} at {exp.organization}</p>
                                    <PreviewItem label="Duration" value={`${exp.startDate} to ${exp.endDate}`} />
                                    <PreviewItem label="Certificate" value={processFileUpload(exp.fileInput)?.name || "Not uploaded / No file selected"} />
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
                                <FormLabel>I confirm that all information provided is accurate and complete.</FormLabel>
                                <FormMessage />
                            </div>
                            </FormItem>
                        )}
                    />
                  </section>
                )}

                <CardFooter className="flex justify-between mt-8 p-0">
                  {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                  )}
                  {currentStep < steps.length - 1 && (
                    <Button type="button" onClick={nextStep} className="ml-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  {currentStep === steps.length - 1 && (
                    <Button type="submit" className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !form.watch("terms")}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                      {isLoading ? "Submitting..." : "Submit Application"}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
         <p className="text-center text-xs text-muted-foreground mt-6">
            &copy; {new Date().getFullYear()} Scholars Institute of Arts & Technology. All rights reserved.
          </p>
      </div>
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
    <dd className="text-foreground sm:text-right">{value || "N/A"}</dd>
  </div>
);
