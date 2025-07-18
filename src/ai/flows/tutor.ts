
'use server';
/**
 * @fileOverview An AI Tutor for the SIAT learning dashboard.
 *
 * - askTutor - A function that allows students to ask questions about their course modules.
 * - TutorInput - The input type for the askTutor function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const TutorInputSchema = z.object({
  program: z.string().describe('The student\'s program of study, e.g., "Computer Science".'),
  moduleTitle: z.string().describe('The title of the learning module the student is asking about.'),
  question: z.string().describe('The specific question the student is asking.'),
});
export type TutorInput = z.infer<typeof TutorInputSchema>;

export async function askTutor(input: TutorInput): Promise<string> {
  const tutorResponse = await tutorFlow(input);
  return tutorResponse;
}

const prompt = ai.definePrompt({
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

const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.text;
  }
);
