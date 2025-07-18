
"use server";
import { askTutor, type TutorInput } from "@/ai/flows/tutor";

/**
 * Server action to call the AI tutor Genkit flow.
 * @param input The data containing the student's program, module, and question.
 * @returns The AI tutor's string response.
 */
export async function askTutorAction(input: TutorInput): Promise<string> {
    try {
        const response = await askTutor(input);
        return response;
    } catch (error) {
        console.error("Error in askTutorAction:", error);
        return "Sorry, I encountered an error trying to process your question. Please try again.";
    }
}
