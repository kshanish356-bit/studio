
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Inspiration {
  destination: string;
  reason: string;
  estimatedCost: string;
  suggestedDuration: string;
}

export default function DailyInspiration() {
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInspiration = async () => {
      setIsLoading(true);
      try {
        // In a real app, you might fetch from a cached endpoint.
        // Here we call the cron route directly for demonstration.
        const response = await fetch('/api/cron/daily-inspiration', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch daily inspiration');
        }
        const data = await response.json();
        if (data.inspiration) {
          setInspiration(data.inspiration);
        } else {
          throw new Error('No inspiration data found in response');
        }
      } catch (error) {
        console.error("Error fetching daily inspiration:", error);
        toast({
          title: "Could not load inspiration",
          description: "There was a problem fetching the daily travel idea. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspiration();
  }, [toast]);

  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto shadow-lg bg-gradient-to-r from-primary to-blue-600 text-primary-foreground">
          <CardHeader className="text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-yellow-300 mb-4" />
            <CardTitle className="text-3xl">Inspiration for Your Next Trip</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              A daily dose of travel ideas, powered by AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-10 w-10 animate-spin text-primary-foreground" />
              </div>
            )}
            {!isLoading && inspiration && (
              <div className="text-center bg-background/20 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-2">{inspiration.destination}</h3>
                <p className="mb-4 italic">&quot;{inspiration.reason}&quot;</p>
                <div className="flex justify-center gap-6 text-sm">
                  <span><strong>Duration:</strong> {inspiration.suggestedDuration}</span>
                  <span><strong>Est. Cost:</strong> {inspiration.estimatedCost}</span>
                </div>
                <Button asChild variant="outline" className="mt-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Link href="/holiday-packages">
                    Explore Packages <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
            {!isLoading && !inspiration && (
              <div className="text-center h-48 flex items-center justify-center">
                <p>Could not load today's inspiration. Please check back later.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
