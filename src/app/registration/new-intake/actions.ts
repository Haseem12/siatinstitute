
"use server";

import { z } from "zod";
import type { NewIntakeApplicationData, QualificationUpload, ExperienceUpload, FileUploadInfo } from "@/types";

// Define Zod schema matching NewIntakeApplicationData for server-side validation
// This schema should ideally be as close as possible to the client-side one for consistency
// For brevity in this example, focusing on the structure. Full validation is crucial in a real app.

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

const applicationSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  dateOfBirth: z.date().optional(), // Date comes as Date object
  gender: z.enum(["Male", "Female", "Other", ""]),
  address: z.string().min(5),
  city: z.string().min(2),
  stateOfOrigin: z.string().min(2),
  nationality: z.string().min(2),
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
  payload: NewIntakeApplicationData
): Promise<{ success: boolean; message: string; applicationId?: string }> {
  try {
    // Server-side validation
    const validatedPayload = applicationSchema.parse(payload);

    // Simulate database operation and file handling
    console.log("Received New Intake Application:", JSON.stringify(validatedPayload, null, 2));
    
    // Mock: In a real app, you would:
    // 1. Save text data to a database (e.g., Firestore).
    // 2. Handle file uploads:
    //    - If files were uploaded to a temporary location or passed as base64,
    //      you'd move them to permanent storage (e.g., Firebase Storage, Google Cloud Storage).
    //    - Store URLs/references to these files in the database along with the application data.
    // For this mock, we are only receiving file metadata.

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay & processing

    // Simulate success
    const applicationId = `SIAT-APP-${Date.now()}`;
    return { 
      success: true, 
      message: `Application received successfully! Your Application ID is ${applicationId}. We will contact you via email (${validatedPayload.email}) with further instructions.`,
      applicationId: applicationId 
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation Error:", error.errors);
      return { 
        success: false, 
        message: `Validation failed: ${error.errors.map(e => `${e.path.join(".")} - ${e.message}`).join("; ")}` 
      };
    }
    console.error("Error submitting new intake application:", error);
    return { 
      success: false, 
      message: "An unexpected error occurred while submitting your application. Please try again later or contact support." 
    };
  }
}
