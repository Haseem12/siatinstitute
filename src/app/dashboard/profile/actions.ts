"use server";

import { z } from "zod";
import type { User } from "@/types";

// Schema for profile update
// Avatar handling is complex and typically involves file storage services.
// For this mock, we'll just accept avatarUrl as a string or skip actual upload.
const profileUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  // studentId: z.string(), // Usually not editable by user
  department: z.string().optional(),
  level: z.string().optional(),
  avatarUrl: z.string().url("Invalid URL for avatar").optional(), // If providing URL
  // newAvatar: z.any().optional(), // For actual file upload, would need more complex handling
});

export type UpdateProfilePayload = z.infer<typeof profileUpdateSchema>;

export async function updateProfileAction(
  userId: string, 
  payload: UpdateProfilePayload
): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    const validatedPayload = profileUpdateSchema.parse(payload);

    // Simulate database update
    console.log(`Updating profile for user ${userId}:`, validatedPayload);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Mock updated user data. In a real app, fetch current user, update, then return.
    const updatedUser: User = {
      id: userId,
      studentId: "SIAT/001", // This would come from the existing user data
      name: validatedPayload.name,
      email: validatedPayload.email,
      department: validatedPayload.department || "Computer Science", // Fallback mock
      level: validatedPayload.level || "300 Level", // Fallback mock
      avatarUrl: validatedPayload.avatarUrl || "https://placehold.co/100x100.png", // Fallback mock
    };
    
    return { 
      success: true, 
      message: "Profile updated successfully!",
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
