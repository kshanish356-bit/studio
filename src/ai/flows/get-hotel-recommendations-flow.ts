
'use server';
/**
 * @fileOverview AI-powered hotel recommendations using tools.
 *
 * This flow demonstrates tool usage. The AI model is given a `getHotels` tool
 * that it can use to fetch a list of available hotels. It uses this tool
 * to answer the user's query about hotel recommendations.
 *
 * - getHotelRecommendations - A function that provides hotel recommendations based on a user query.
 * - GetHotelRecommendationsInput - The input type for the function.
 * - GetHotelRecommendationsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for a single hotel. This will be used by our tool.
const HotelSchema = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  rating: z.number(),
  price: z.number(),
  amenities: z.array(z.string()),
});
type Hotel = z.infer<typeof HotelSchema>;

// Define Input and Output schemas for the main flow
const GetHotelRecommendationsInputSchema = z.object({
  query: z.string().describe('The user\'s natural language query for hotel recommendations.'),
});
export type GetHotelRecommendationsInput = z.infer<typeof GetHotelRecommendationsInputSchema>;

const GetHotelRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('A helpful, conversational response providing hotel recommendations based on the user query and the provided hotel list.'),
});
export type GetHotelRecommendationsOutput = z.infer<typeof GetHotelRecommendationsOutputSchema>;

/**
 * A "tool" that the AI model can use to fetch a list of available hotels.
 * In a real application, this would fetch data from a live database or API.
 * Here, we are fetching from our mock API route.
 */
const getHotels = ai.defineTool(
  {
    name: 'getHotels',
    description: 'Returns a list of available hotels. Can be filtered by location.',
    inputSchema: z.object({
        location: z.string().optional().describe("The location to filter hotels by (e.g., 'Goa', 'Rajasthan')."),
    }),
    outputSchema: z.array(HotelSchema),
  },
  async (input) => {
    // In a real app, you would have a robust hotel fetching service here.
    // For this example, we'll fetch from our own API endpoint which returns mock data.
    // NOTE: This assumes the dev server is running on localhost:3000.
    // This is not ideal for production, but demonstrates the concept.
    // A better approach would be to import a server-side service function directly.
    try {
      const response = await fetch('http://localhost:3000/api/hotels');
      if (!response.ok) {
          throw new Error('Failed to fetch hotels from API');
      }
      const allHotels: Hotel[] = await response.json();
      if (input.location) {
          return allHotels.filter(hotel => hotel.location.toLowerCase().includes(input.location!.toLowerCase()));
      }
      return allHotels;
    } catch (error) {
       console.error("Error in getHotels tool:", error);
       // Return an empty array on error so the AI can report that it failed.
       return [];
    }
  }
);

// Define the Genkit Prompt that uses the tool
const hotelRecommenderPrompt = ai.definePrompt({
  name: 'hotelRecommenderPrompt',
  input: { schema: GetHotelRecommendationsInputSchema },
  output: { schema: GetHotelRecommendationsOutputSchema },
  tools: [getHotels],
  prompt: `You are an expert hotel concierge. A user will ask for hotel recommendations.
Your task is to use the 'getHotels' tool to find available hotels and then provide a helpful, conversational recommendation based on the user's query.

If the user specifies a location, use it in the tool.
Analyze the user's query for preferences like budget, rating, and desired amenities.
Based on the tool's output, recommend 1-2 of the best matches.
If no hotels match the criteria, inform the user gracefully.

User Query: "{{{query}}}"
`,
  config: {
    temperature: 0.5,
  },
});

// Define the main Genkit Flow
const hotelRecommendationsFlow = ai.defineFlow(
  {
    name: 'hotelRecommendationsFlow',
    inputSchema: GetHotelRecommendationsInputSchema,
    outputSchema: GetHotelRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await hotelRecommenderPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate hotel recommendations.");
    }
    return output;
  }
);

// Exported async wrapper function for the client to call
export async function getHotelRecommendations(input: GetHotelRecommendationsInput): Promise<GetHotelRecommendationsOutput> {
  return hotelRecommendationsFlow(input);
}
