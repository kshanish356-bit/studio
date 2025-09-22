
'use server';
/**
 * @fileOverview AI-powered user request interpreter.
 *
 * - interpretUserRequest - A function that analyzes a user's natural language query and maps it to a specific page and parameters.
 * - InterpretUserRequestInput - The input type for the function.
 * - InterpretUserRequestOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const InterpretUserRequestInputSchema = z.object({
  query: z.string().describe('The natural language query from the user.'),
});
export type InterpretUserRequestInput = z.infer<typeof InterpretUserRequestInputSchema>;

const InterpretUserRequestOutputSchema = z.object({
  page: z
    .string()
    .describe(
      "The most relevant page path for the user's query. Must be one of: /flights, /hotels, /trains, /bus, /cabs, /holiday-packages, /itinerary-planner, /house-rent, or /."
    ),
  params: z
    .record(z.any())
    .optional()
    .describe(
      'An object of key-value pairs to be used as URL query parameters. For example, for flights, it could be { from: "DEL", to: "BOM" }. For hotels, it could be { destination: "Goa" }.'
    ),
});
export type InterpretUserRequestOutput = z.infer<
  typeof InterpretUserRequestOutputSchema
>;

export async function interpretUserRequest(
  input: InterpretUserRequestInput
): Promise<InterpretUserRequestOutput> {
  const interpretRequestFlow = ai.defineFlow(
    {
      name: 'interpretRequestFlow',
      inputSchema: InterpretUserRequestInputSchema,
      outputSchema: InterpretUserRequestOutputSchema,
    },
    async (input) => {
      const prompt = ai.definePrompt({
        name: 'interpretRequestPrompt',
        input: { schema: InterpretUserRequestInputSchema },
        output: { schema: InterpretUserRequestOutputSchema },
        prompt: `You are an expert at interpreting user commands for a travel booking website. Your task is to analyze the user's query and determine the most appropriate page to redirect them to, along with any relevant parameters to pre-fill search forms.

The available pages are:
- /flights: For booking flights. Key parameters: 'from', 'to', 'date'.
- /hotels: For booking hotels. Key parameters: 'destination', 'checkIn', 'checkOut'.
- /trains: For booking trains. Key parameters: 'from', 'to', 'date'.
- /bus: For booking buses. Key parameters: 'from', 'to', 'date'.
- /cabs: For booking local or multi-city cabs. Key parameters: 'from', 'to'.
- /holiday-packages: For browsing tour packages. Key parameters: 'destination'.
- /itinerary-planner: For the AI itinerary planner. Key parameters: 'destination', 'duration'.
- /house-rent: For renting houses. Key parameters: 'destination'.
- /: The homepage, if no other page is a clear match.

Analyze the following user query and determine the correct 'page' and 'params'.

User Query: "{{{query}}}"

Instructions:
1.  **Page Selection**: Choose the most specific and relevant page from the list above. If the query is "I want to travel", default to the homepage ('/').
2.  **Parameter Extraction**: Extract key entities like departure city ('from'), arrival city ('to'), destination, dates, and duration.
3.  **Use IATA Codes**: If a city name is given for a flight, train, or bus, try to use its common IATA code (e.g., "Delhi" -> "DEL", "Mumbai" -> "BOM", "Bangalore" -> "BLR").
4.  **Default to Homepage**: If the intent is unclear or too generic, set the page to '/'.

Example 1:
Query: "I want to book a flight from Delhi to Mumbai for this weekend."
Output: { page: "/flights", params: { from: "DEL", to: "BOM" } }

Example 2:
Query: "Show me hotels in Goa"
Output: { page: "/hotels", params: { destination: "Goa" } }
`,
        config: {
          temperature: 0.2, // Lower temperature for more deterministic output
        },
      });

      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI failed to interpret the request.');
      }
      return output;
    }
  );

  return interpretRequestFlow(input);
}
