
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { personalizedTripSuggestions, type PersonalizedTripSuggestionsInput } from '@/ai/flows/personalized-trip-suggestions';

// IMPORTANT: In a production environment, you MUST secure this endpoint.
// Cron job endpoints should not be publicly accessible without authentication.
// Common methods include:
// 1. Using a secret token in the request header/query parameter that your endpoint checks.
// 2. If deployed on a platform like Vercel or Google Cloud, use their built-in mechanisms
//    for invoking functions securely (e.g., Vercel Cron Jobs with protected endpoints,
//    Google Cloud Scheduler with IAM authentication for HTTP targets).

export async function GET(request: NextRequest) {
  console.log('Daily Inspiration Cron Job Triggered');

  // Example: Define generic preferences for daily inspiration
  const genericInput: PersonalizedTripSuggestionsInput = {
    travelHistory: "User enjoys a mix of cultural experiences and nature. Has previously visited historical cities in Europe and national parks in North America.",
    preferences: "Looking for unique destinations that are not overly touristy. Open to various budgets but prefers good value. Interested in photography and local cuisine. Trip duration: 7-10 days.",
  };

  try {
    const result = await personalizedTripSuggestions(genericInput);

    if (result && result.suggestions && result.suggestions.length > 0) {
      const inspiration = result.suggestions[0]; // Take the first suggestion as "inspiration of the day"
      console.log('Daily Travel Inspiration:', inspiration);

      // In a real application, you might:
      // - Save this to a "daily_inspiration" collection in Firestore.
      // - Add it to a queue for a newsletter.
      // - Post it to social media via an API.

      return NextResponse.json({
        message: 'Daily inspiration generated successfully.',
        inspiration: inspiration,
      });
    } else {
      console.warn('No travel inspiration generated today.');
      return NextResponse.json(
        { message: 'Could not generate travel inspiration today.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating daily inspiration:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { message: 'Failed to generate daily inspiration.', error: errorMessage },
      { status: 500 }
    );
  }
}
