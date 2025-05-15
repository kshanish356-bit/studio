
'use server';
/**
 * @fileOverview AI-powered city tourist attraction suggestions.
 *
 * - getCityTouristPlaces - A function that generates a list of tourist attractions for a given Indian city.
 * - GetCityTouristPlacesInput - The input type for the getCityTouristPlaces function.
 * - GetCityTouristPlacesOutput - The return type for the getCityTouristPlaces function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define Input Schema
const GetCityTouristPlacesInputSchema = z.object({
  cityName: z.string().describe('The name of the Indian city for which to find tourist attractions.'),
});
export type GetCityTouristPlacesInput = z.infer<typeof GetCityTouristPlacesInputSchema>;

// Define Output Schema
const GetCityTouristPlacesOutputSchema = z.object({
  attractions: z.array(z.string()).describe('A list of popular tourist attractions in the specified Indian city. Provide up to 10-15 key attractions. If the city is not in India or not recognized, return an empty list or a message indicating this.'),
});
export type GetCityTouristPlacesOutput = z.infer<typeof GetCityTouristPlacesOutputSchema>;

// Exported async wrapper function
export async function getCityTouristPlaces(input: GetCityTouristPlacesInput): Promise<GetCityTouristPlacesOutput> {
  return cityTouristPlacesFlow(input);
}

// Define the Genkit Prompt
const cityAttractionsPrompt = ai.definePrompt({
  name: 'cityAttractionsPrompt',
  input: { schema: GetCityTouristPlacesInputSchema },
  output: { schema: GetCityTouristPlacesOutputSchema },
  prompt: `You are a knowledgeable travel expert specializing in Indian tourism.
The user will provide the name of an Indian city. Your task is to list its most popular and well-known tourist attractions.
Provide up to 10-15 key attractions if available.
If the provided name is not a recognized Indian city, or if it's a city outside India, please state that you can only provide information for Indian cities or return an empty list of attractions.

City Name: {{{cityName}}}
`,
  config: {
    temperature: 0.5, // For factual listing, slightly lower temperature
    maxOutputTokens: 300,
  },
});

// Define the Genkit Flow
const cityTouristPlacesFlow = ai.defineFlow(
  {
    name: 'cityTouristPlacesFlow',
    inputSchema: GetCityTouristPlacesInputSchema,
    outputSchema: GetCityTouristPlacesOutputSchema,
  },
  async (input) => {
    const { output } = await cityAttractionsPrompt(input);
    if (!output) {
        console.warn("City tourist places flow received no output from prompt. Returning empty attractions.");
        return { attractions: [] };
    }
    return output;
  }
);
