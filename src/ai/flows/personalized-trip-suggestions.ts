'use server';
/**
 * @fileOverview AI-powered personalized trip suggestions.
 *
 * - personalizedTripSuggestions - A function that generates trip suggestions based on user input.
 * - PersonalizedTripSuggestionsInput - The input type for the personalizedTripSuggestions function.
 * - PersonalizedTripSuggestionsOutput - The return type for the personalizedTripSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit'; // Using z from genkit as per examples

// Define Input Schema
const PersonalizedTripSuggestionsInputSchema = z.object({
  travelHistory: z.string().describe("The user's past travel experiences, including destinations, activities enjoyed, and duration."),
  preferences: z.string().describe("The user's current travel preferences, such as budget, desired activities, travel style (e.g., adventure, relaxation), and trip length."),
});
export type PersonalizedTripSuggestionsInput = z.infer<typeof PersonalizedTripSuggestionsInputSchema>;

// Define Output Schema (specifically the structure of each suggestion)
const SuggestionSchema = z.object({
  destination: z.string().describe("The suggested destination (e.g., 'Paris, France', 'Kyoto, Japan')."),
  reason: z.string().describe("A brief explanation for why this destination is recommended based on the user's history and preferences."),
  estimatedCost: z.string().describe("A general estimate of the trip cost (e.g., '$1000 - $1500 USD', 'Around €800')."),
  suggestedDuration: z.string().describe("A recommended duration for the trip (e.g., '5-7 days', '2 weeks')."),
});

const PersonalizedTripSuggestionsOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe("An array of personalized trip suggestions. Aim for 2-3 diverse suggestions."),
});
export type PersonalizedTripSuggestionsOutput = z.infer<typeof PersonalizedTripSuggestionsOutputSchema>;

// Exported async wrapper function
export async function personalizedTripSuggestions(input: PersonalizedTripSuggestionsInput): Promise<PersonalizedTripSuggestionsOutput> {
  return personalizedTripSuggestionsFlow(input);
}

// Define the Genkit Prompt
const tripSuggestionsPrompt = ai.definePrompt({
  name: 'tripSuggestionsPrompt',
  input: { schema: PersonalizedTripSuggestionsInputSchema },
  output: { schema: PersonalizedTripSuggestionsOutputSchema },
  prompt: `You are an expert AI travel assistant. Your goal is to generate personalized trip suggestions.
Analyze the user's travel history and preferences provided below.

User's Travel History:
{{{travelHistory}}}

User's Preferences:
{{{preferences}}}

Based on this information, provide 2-3 diverse trip suggestions. For each suggestion, include:
1.  Destination: The city and country.
2.  Reason: Why it's a good fit for the user.
3.  Estimated Cost: A general cost range.
4.  Suggested Duration: How long the trip might be.

Follow these guidelines:
- If past travels indicate enjoyment of certain activities or destination types, suggest similar or complementary options.
- Align suggestions with any stated budget or preferences.
- Offer a variety of options if possible.
- Be concise and helpful.
`,
  config: {
    temperature: 0.7,
    topP: 1, 
    maxOutputTokens: 500, 
  },
  // model: 'googleai/gemini-2.0-flash' // This will be used by default from ai/genkit.ts
});

// Define the Genkit Flow
const personalizedTripSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedTripSuggestionsFlow',
    inputSchema: PersonalizedTripSuggestionsInputSchema,
    outputSchema: PersonalizedTripSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await tripSuggestionsPrompt(input);
    if (!output) {
        console.warn("Personalized trip suggestions flow received no output from prompt. Returning empty suggestions.");
        return { suggestions: [] };
    }
    return output;
  }
);
