"use server";

import { z } from "zod";
import type { User, NewIntakeApplicationData } from "@/types"; // Added NewIntakeApplicationData

// Schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().optional(),
  level: z.string().optional(),
  phoneNumber: z.string().optional(), // Added from NewIntakeApplicationData
  address: z.string().optional(), // Added from NewIntakeApplicationData
  avatarUrl: z.string().url("Invalid URL for avatar").optional(),
});

export type UpdateProfilePayload = z.infer<typeof profileUpdateSchema>;

// Changed userId to applicationId to reflect what we'd use for DB lookup
export async function updateProfileAction(
  applicationId: string, 
  payload: UpdateProfilePayload
): Promise<{ success: boolean; message: string; user?: NewIntakeApplicationData }> { // Return NewIntakeApplicationData
  try {
    const validatedPayload = profileUpdateSchema.parse(payload);

    // Simulate database update
    console.log(`Updating profile for applicant ${applicationId}:`, validatedPayload);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Mock updated user data. In a real app, fetch current user, update, then return.
    // This would be a more complex merge with existing NewIntakeApplicationData
    const updatedUser: NewIntakeApplicationData = {
      applicationId: applicationId,
      fullName: validatedPayload.name,
      email: validatedPayload.email,
      department: validatedPayload.department,
      level: validatedPayload.level,
      phoneNumber: validatedPayload.phoneNumber || "",
      address: validatedPayload.address || "",
      avatarUrl: validatedPayload.avatarUrl || "https://placehold.co/100x100.png",
      // Fill in other NewIntakeApplicationData fields with defaults or existing data
      // For this mock, we'll keep it simple
      gender: "Male", // Placeholder
      city: "", // Placeholder
      stateOfOrigin: "", // Placeholder
      nationality: "", // Placeholder
      nextOfKinName: "", // Placeholder
      nextOfKinPhone: "", // Placeholder
      nextOfKinRelationship: "", // Placeholder
      preferredProgram: "", // Placeholder
      preferredCampus: "", // Placeholder
      entryMode: "UTME", // Placeholder
      admissionStatus: "Admitted", // Placeholder
    };
    
    return { 
      success: true, 
      message: "Profile updated successfully! (Mocked)",
      user: updatedUser 
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: `Validation failed: ${error.errors.map(e => e.message).join(", ")}` };
    }
    console.error("Error updating profile:", error);
    return { success: false, message: "An unexpected error occurred. Please try again." };
  }
}
