
"use server";

import { z } from "zod";
import type { NewIntakeApplicationData, QualificationUpload, ExperienceUpload, FileUploadInfo } from "@/types";

const fileUploadInfoSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
}).optional();


const qualificationUploadSchema = z.object({
  id: z.string(),
  type: z.string(),
  institution: z.string(),
  yearAwarded: z.string(),
  file: fileUploadInfoSchema,
});

const experienceUploadSchema = z.object({
  id: z.string(),
  organization: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  file: fileUploadInfoSchema,
});

// This schema is used for validation by the server action
const applicationSchema = z.object({
  applicationId: z.string().optional(), // Keep optional here as it's added by action
  fullName: z.string().min(3),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["Male", "Female", "Other", ""]),
  address: z.string().min(5),
  city: z.string().min(2),
  stateOfOrigin: z.string().min(2),
  nationality: z.string().min(2),
  photograph: fileUploadInfoSchema,
  nextOfKinName: z.string().min(3),
  nextOfKinPhone: z.string().min(10),
  nextOfKinRelationship: z.string().min(2),
  
  qualifications: z.array(qualificationUploadSchema).min(1),
  experiences: z.array(experienceUploadSchema).optional(),
  
  preferredProgram: z.string().min(1),
  preferredCampus: z.string().min(1),
  entryMode: z.enum(["UTME", "Direct Entry", "Transfer", ""]),
});


export async function submitNewIntakeApplicationAction(
  payload: NewIntakeApplicationData // This type now matches what the form prepares
): Promise<{ success: boolean; message: string; applicationId?: string }> {
  try {
    const validatedPayload = applicationSchema.parse(payload);

    const applicationWithId: NewIntakeApplicationData = {
      ...validatedPayload,
      applicationId: `SIAT-APP-${Date.now()}`,
    };

    console.log("Received New Intake Application for storage:", JSON.stringify(applicationWithId, null, 2));
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // Logic to save to localStorage will be client-side, after this action returns success.
    // This server action's role is to validate and confirm "receipt".
    
    return { 
      success: true, 
      message: `Application received successfully! Your Application ID is ${applicationWithId.applicationId}. We will contact you via email (${validatedPayload.email}) with further instructions.`,
      applicationId: applicationWithId.applicationId
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation Error in Server Action:", error.errors);
      return { 
        success: false, 
        message: `Validation failed: ${error.errors.map(e => `${e.path.join(".")} - ${e.message}`).join("; ")}` 
      };
    }
    console.error("Error submitting new intake application (server action):", error);
    return { 
      success: false, 
      message: "An unexpected error occurred while submitting your application. Please try again later or contact support." 
    };
  }
}
