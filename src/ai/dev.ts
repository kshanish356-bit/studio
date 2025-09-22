
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-trip-suggestions.ts';
import '@/ai/flows/city-tourist-places-flow.ts';
import '@/ai/flows/generate-image-flow.ts';
import '@/ai/flows/generate-package-details-flow.ts';
import '@/ai/flows/generate-itinerary-flow.ts';
import '@/ai/flows/interpret-request-flow.ts';

