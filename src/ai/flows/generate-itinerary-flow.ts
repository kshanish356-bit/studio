
'use server';
/**
 * @fileOverview AI-powered itinerary generation.
 *
 * - generateItinerary - A function that creates a detailed, day-by-day travel itinerary.
 * - GenerateItineraryInput - The input type for the generateItinerary function.
 * - GenerateItineraryOutput - The return type for the generateItinerary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define Input Schema and Type inside the scope of where it is used or as non-exported consts
const GenerateItineraryInputSchema = z.object({
  destination: z.string().describe('The city and country for the trip (e.g., "Paris, France").'),
  duration: z.string().describe('The total length of the trip (e.g., "5 days", "1 week").'),
  interests: z.string().describe('User interests to tailor the plan (e.g., "art, history, food, hiking").'),
  budget: z.string().describe('The general budget for the trip (e.g., "budget-friendly", "mid-range", "luxury").'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

// Define Output Schema and Type
const DayPlanSchema = z.object({
  day: z.number().describe('The day number of the itinerary (e.g., 1, 2, 3).'),
  title: z.string().describe('A catchy title for the day\'s plan (e.g., "Arrival and Eiffel Tower Magic").'),
  activities: z.array(z.string()).describe('A list of specific activities, sights, or restaurant suggestions for the day. Each activity should be a concise, actionable item.'),
});

const GenerateItineraryOutputSchema = z.object({
  itinerary: z.array(DayPlanSchema).describe('The full day-by-day itinerary plan.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;

// Exported async wrapper function
export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
  // Define the Genkit Prompt inside the function to avoid exporting it
  const itineraryPrompt = ai.definePrompt({
    name: 'itineraryPrompt',
    input: { schema: GenerateItineraryInputSchema },
    output: { schema: GenerateItineraryOutputSchema },
    prompt: `You are an expert travel agent who creates personalized travel itineraries. A user will provide a destination, trip duration, their interests, and a budget. Create a logical, day-by-day itinerary based on this information.

**Destination:** {{{destination}}}
**Duration:** {{{duration}}}
**Interests:** {{{interests}}}
**Budget:** {{{budget}}}

**Instructions:**
1.  **Structure:** Create a plan for each day of the trip. The number of days should match the user's specified duration.
2.  **Content:** For each day, provide a short, engaging title and a list of 2-4 activities.
3.  **Logical Flow:** Arrange activities logically (e.g., group sights that are geographically close).
4.  **Relevance:** All suggestions must be highly relevant to the user's stated destination, interests, and budget.
5.  **Clarity:** Be specific and clear in your activity descriptions. For example, instead of "Visit a museum," say "Visit the Louvre Museum to see the Mona Lisa."
`,
    config: {
      temperature: 0.8, // Higher temperature for more creative and varied suggestions.
      maxOutputTokens: 1500,
    },
  });

  // Define the Genkit Flow inside the function to avoid exporting it
  const generateItineraryFlow = ai.defineFlow(
    {
      name: 'generateItineraryFlow',
      inputSchema: GenerateItineraryInputSchema,
      outputSchema: GenerateItineraryOutputSchema,
    },
    async (input) => {
      const { output } = await itineraryPrompt(input);
      if (!output) {
        throw new Error("AI failed to generate an itinerary.");
      }
      return output;
    }
  );
  
  return generateItineraryFlow(input);
}
