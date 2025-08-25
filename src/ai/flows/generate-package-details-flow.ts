
'use server';
/**
 * @fileOverview AI-powered tour package content generation.
 *
 * - generatePackageDetails - A function that generates a description and itinerary for a tour package.
 * - GeneratePackageDetailsInput - The input type for the generatePackageDetails function.
 * - GeneratePackageDetailsOutput - The return type for the generatePackageDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define Input Schema
const GeneratePackageDetailsInputSchema = z.object({
  title: z.string().describe('The title of the tour package (e.g., "Romantic Goa Getaway", "Spiritual Varanasi Tour").'),
});
export type GeneratePackageDetailsInput = z.infer<typeof GeneratePackageDetailsInputSchema>;

// Define Output Schema
const GeneratePackageDetailsOutputSchema = z.object({
  description: z.string().describe("A compelling and brief marketing description for the tour package. Highlight key experiences. Keep it under 200 characters."),
  itinerary: z.string().describe("A suggested, brief day-by-day itinerary. For multi-day tours, use 'Day 1:', 'Day 2:'. For single-day tours, use 'Morning:', 'Afternoon:', 'Evening:'. Be concise."),
  aiImageHint: z.string().describe("A 2-3 word hint for an AI image generator to create a cover photo. For example: 'goa beach sunset', 'varanasi ganges ceremony'.")
});
export type GeneratePackageDetailsOutput = z.infer<typeof GeneratePackageDetailsOutputSchema>;

// Exported async wrapper function
export async function generatePackageDetails(input: GeneratePackageDetailsInput): Promise<GeneratePackageDetailsOutput> {
  return generatePackageDetailsFlow(input);
}

// Define the Genkit Prompt
const packageDetailsPrompt = ai.definePrompt({
  name: 'packageDetailsPrompt',
  input: { schema: GeneratePackageDetailsInputSchema },
  output: { schema: GeneratePackageDetailsOutputSchema },
  prompt: `You are an expert travel copywriter. Given a tour package title, generate a compelling, brief description, a concise itinerary, and a short hint for an AI image generator.

Package Title: {{{title}}}

Follow these instructions precisely:
1.  **Description**: Write a captivating marketing description. It must be under 200 characters.
2.  **Itinerary**: Create a brief, structured itinerary.
    - For multi-day tours (e.g., titles with "days" or "nights"), use the format: "Day 1: [Activity].\\nDay 2: [Activity]."
    - For single-day tours, use the format: "Morning: [Activity].\\nAfternoon: [Activity].\\nEvening: [Activity]."
3.  **AI Image Hint**: Provide a 2-3 word hint for an AI image generator. It should capture the essence of the destination (e.g., "Jaipur Amer Fort", "Kerala backwaters boat").
`,
  config: {
    temperature: 0.7,
    maxOutputTokens: 400,
  },
});

// Define the Genkit Flow
const generatePackageDetailsFlow = ai.defineFlow(
  {
    name: 'generatePackageDetailsFlow',
    inputSchema: GeneratePackageDetailsInputSchema,
    outputSchema: GeneratePackageDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await packageDetailsPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate package details.");
    }
    return output;
  }
);
