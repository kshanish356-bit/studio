
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wand2, Calendar, IndianRupee, Sparkles, Map, ListChecks, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateItinerary, type GenerateItineraryOutput } from '@/ai/flows/generate-itinerary-flow';

export default function ItineraryPlannerPage() {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('');
  const [itinerary, setItinerary] = useState<GenerateItineraryOutput['itinerary'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setItinerary(null);

    if (!destination || !duration) {
      toast({
        title: "Missing Information",
        description: "Please provide a destination and trip duration.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = await generateItinerary({
        destination,
        duration,
        interests: interests || 'popular tourist attractions',
        budget: budget || 'any',
      });

      if (result && result.itinerary && result.itinerary.length > 0) {
        setItinerary(result.itinerary);
        toast({
          title: "Itinerary Generated!",
          description: `Your custom plan for ${destination} is ready.`,
        });
      } else {
        toast({
          title: "No Itinerary Generated",
          description: "We couldn't create an itinerary. Please try different inputs.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error generating itinerary:", error);
      toast({
        title: "AI Error",
        description: "Failed to generate itinerary. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-secondary/40 min-h-screen">
      <section 
        className="py-20 text-white relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://placehold.co/1920x600.png')"}}
        data-ai-hint="world map illustration"
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg flex items-center justify-center gap-4">
            <Wand2 className="h-10 w-10" />
            AI Itinerary Planner
          </h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow-md">Craft your perfect trip in seconds. Just tell us where and when.</p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Input Form Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">Plan Your Adventure</CardTitle>
                <CardDescription>Fill in the details below to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="destination" className="text-base font-medium flex items-center">
                      <Map className="mr-2 h-5 w-5 text-primary" /> Destination
                    </Label>
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., Paris, France"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-base font-medium flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-primary" /> Trip Duration
                    </Label>
                    <Input
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 5 days"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interests" className="text-base font-medium flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-primary" /> Interests (Optional)
                    </Label>
                    <Textarea
                      id="interests"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="e.g., art, history, food, hiking"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-base font-medium flex items-center">
                      <IndianRupee className="mr-2 h-5 w-5 text-primary" /> Budget in Indian Rupees (₹)
                    </Label>
                    <Input
                      id="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g., 50000 or Mid-range"
                    />
                  </div>
                  <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-6 w-6" />
                    )}
                    Generate Itinerary
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Itinerary Display Section */}
          <div className="lg:col-span-2">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-card p-8 rounded-lg shadow-inner">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <h3 className="text-2xl font-semibold text-primary">Crafting Your Perfect Trip...</h3>
                <p className="text-muted-foreground mt-2">Our AI is exploring the best spots for you!</p>
              </div>
            )}
            
            {!isLoading && !itinerary && (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-card p-8 rounded-lg shadow-inner text-center">
                <ListChecks className="h-16 w-16 text-muted-foreground mb-6" />
                <h3 className="text-2xl font-semibold">Your Itinerary Will Appear Here</h3>
                <p className="text-muted-foreground mt-2 max-w-md">Fill out the form to the left and let our AI create a personalized travel plan just for you.</p>
              </div>
            )}

            {!isLoading && itinerary && (
              <div className="space-y-8">
                <h2 className="text-4xl font-bold text-center">Your Custom Itinerary for {destination}</h2>
                {itinerary.map((dayPlan, index) => (
                  <Card key={index} className="shadow-lg">
                    <CardHeader className="bg-secondary">
                      <CardTitle className="text-2xl text-primary">Day {dayPlan.day}: {dayPlan.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-4">
                        {dayPlan.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
