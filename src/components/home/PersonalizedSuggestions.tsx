
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { personalizedTripSuggestions, type PersonalizedTripSuggestionsOutput } from '@/ai/flows/personalized-trip-suggestions';
import { useToast } from '@/hooks/use-toast';

export default function PersonalizedSuggestions() {
  const [travelHistory, setTravelHistory] = useState('');
  const [preferences, setPreferences] = useState('');
  const [suggestions, setSuggestions] = useState<PersonalizedTripSuggestionsOutput['suggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuggestions(null);

    if (!travelHistory.trim() || !preferences.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both travel history and preferences.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await personalizedTripSuggestions({ travelHistory, preferences });
      if (result && result.suggestions) {
        setSuggestions(result.suggestions);
         toast({
          title: "Suggestions Ready!",
          description: "We've found some trips you might like.",
        });
      } else {
        toast({
          title: "No Suggestions",
          description: "We couldn't generate suggestions based on your input. Please try again or refine your input.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to get suggestions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <Wand2 className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl">Personalized Trip Suggestions</CardTitle>
            <CardDescription>
              Tell us about your past travels and preferences, and we&apos;ll suggest your next adventure!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="travelHistory" className="text-lg font-medium">Your Travel History</Label>
                <Textarea
                  id="travelHistory"
                  value={travelHistory}
                  onChange={(e) => setTravelHistory(e.target.value)}
                  placeholder="e.g., Visited Paris last summer for 7 days with family, enjoyed museums and cafes. Took a solo backpacking trip through Southeast Asia focusing on nature and budget travel."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="preferences" className="text-lg font-medium">Your Travel Preferences</Label>
                <Textarea
                  id="preferences"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g., Interested in beach destinations, budget around $1000-$2000, prefer relaxed pace, enjoy local food and cultural experiences. Looking for a 5-7 day trip."
                  rows={4}
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-6 w-6" />
                )}
                Get Suggestions
              </Button>
            </form>

            {suggestions && suggestions.length > 0 && (
              <div className="mt-10 space-y-6">
                <h3 className="text-2xl font-semibold text-center">Here are your personalized suggestions:</h3>
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-secondary">
                    <CardHeader>
                      <CardTitle>{suggestion.destination}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Reason:</strong> {suggestion.reason}</p>
                      <p><strong>Estimated Cost:</strong> {suggestion.estimatedCost}</p>
                      <p><strong>Suggested Duration:</strong> {suggestion.suggestedDuration}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {suggestions === null && !isLoading && travelHistory && preferences && (
                <p className="mt-6 text-center text-muted-foreground">Click "Get Suggestions" to see personalized trip ideas.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
