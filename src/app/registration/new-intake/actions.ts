
"use server";

import { z } from "zod";
import type { NewIntakeApplicationData, FileUploadInfo } from "@/types";

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
  applicationId: z.string().optional(),
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
  payload: NewIntakeApplicationData
): Promise<{ success: boolean; message: string; applicationId?: string; data?: NewIntakeApplicationData }> {
  try {
    const validatedPayload = applicationSchema.parse(payload);

    const applicationWithGeneratedId: NewIntakeApplicationData = {
      ...validatedPayload,
      applicationId: `SIAT-APP-${Date.now()}`, // Generate ID here before sending
    };

    // Attempt to send data to the external API
    const apiEndpoint = "https://sajfoods.net/api/submitApplication.php"; // Replace with your actual endpoint if different

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationWithGeneratedId),
      });

      if (!response.ok) {
        // Attempt to parse error response from PHP if available
        let errorDetails = `API request failed with status ${response.status}.`;
        try {
          const errorData = await response.json();
          errorDetails += ` ${errorData.message || ''}`;
        } catch (e) {
          // Could not parse JSON error, use text
          errorDetails += ` ${await response.text()}`;
        }
         // For the prototype, even if API fails, we proceed to save to localStorage and return success to client
        // This allows admin to see the application via localStorage on their side.
        console.warn(`API submission to ${apiEndpoint} failed: ${errorDetails}. Proceeding with localStorage.`);
         return { 
          success: true, // Still true for client-side localStorage saving
          message: `Application submitted locally. API submission failed: ${errorDetails}. Application ID: ${applicationWithGeneratedId.applicationId}.`,
          applicationId: applicationWithGeneratedId.applicationId,
          data: applicationWithGeneratedId // Send back the data so client can save to localStorage
        };
      }

      const responseData = await response.json();
      
      if (responseData.success) {
        return { 
          success: true, 
          message: `Application submitted successfully to API and locally! Your Application ID is ${applicationWithGeneratedId.applicationId}. ${responseData.message || ''}`,
          applicationId: applicationWithGeneratedId.applicationId,
          data: applicationWithGeneratedId // Send back the data so client can save to localStorage
        };
      } else {
         // API returned success: false
        console.warn(`API submission to ${apiEndpoint} was not successful: ${responseData.message || 'Unknown API error'}. Proceeding with localStorage.`);
        return { 
          success: true, // Still true for client-side localStorage saving
          message: `Application submitted locally. API reported an issue: ${responseData.message || 'Unknown API error'}. Application ID: ${applicationWithGeneratedId.applicationId}.`,
          applicationId: applicationWithGeneratedId.applicationId,
          data: applicationWithGeneratedId // Send back the data so client can save to localStorage
        };
      }

    } catch (apiError: any) {
      console.error("Error submitting application to API:", apiError);
      // For the prototype, even if API call completely fails, we proceed to save to localStorage
      return { 
        success: true, // Still true for client-side localStorage saving
        message: `Application submitted locally. Could not reach API: ${apiError.message}. Application ID: ${applicationWithGeneratedId.applicationId}.`,
        applicationId: applicationWithGeneratedId.applicationId,
        data: applicationWithGeneratedId // Send back the data so client can save to localStorage
      };
    }

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
      message: "An unexpected error occurred while processing your application. Please try again later or contact support." 
    };
  }
}
