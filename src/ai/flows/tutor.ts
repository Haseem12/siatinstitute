
'use server';
/**
 * @fileOverview An AI Tutor for the SIAT learning dashboard.
 *
 * This file defines the AI-powered tutoring functionality.
 * The primary export is `askTutor`, an async function that takes a student's
 * question and context, and returns a helpful explanation from the AI model.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

/**
 * Defines the schema for the input to the AI tutor.
 */
export const TutorInputSchema = z.object({
  program: z.string().describe('The student\'s program of study, e.g., "Computer Science".'),
  moduleTitle: z.string().describe('The title of the learning module the student is asking about.'),
  question: z.string().describe('The specific question the student is asking.'),
});
export type TutorInput = z.infer<typeof TutorInputSchema>;

/**
 * The Genkit prompt that instructs the AI model how to behave as a tutor.
 * This is an internal detail and is not exported.
 */
const tutorPrompt = ai.definePrompt({
  name: 'tutorPrompt',
  input: { schema: TutorInputSchema },
  prompt: `You are an expert AI Tutor for the "Scholars Institute of Arts & Technology, Zaria". 
  Your goal is to provide clear, helpful, and encouraging explanations to students.

  A student is studying the program: "{{program}}".
  They are currently on the module titled: "{{moduleTitle}}".

  The student's question is: "{{question}}"

  Please provide a concise and easy-to-understand explanation that directly answers the student's question in the context of their module and program. 
  Address the student directly. Avoid jargon where possible, or explain it if necessary.
  Do not answer questions outside the scope of their field of study. If the question is off-topic, politely guide them back to their coursework.
  Format your answer using markdown for readability (e.g., use bullet points, bold text for key terms).`,
});

/**
 * The Genkit flow that orchestrates the call to the AI model.
 * This is an internal detail and is not exported.
 */
const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await tutorPrompt(input);
    return llmResponse.text;
  }
);


/**
 * The primary server action function that is exposed to the rest of the application.
 * It takes the student's question and returns the AI's response.
 * @param input The student's question and context, matching the TutorInput schema.
 * @returns A promise that resolves to the AI tutor's string response.
 */
export async function askTutor(input: TutorInput): Promise<string> {
  // This is the exported wrapper function that calls the internal Genkit flow.
  // It is an async function, which is permissible in a 'use server' file.
  const tutorResponse = await tutorFlow(input);
  return tutorResponse;
}
