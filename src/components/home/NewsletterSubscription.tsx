
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewsletterSubscription() {
  const { toast } = useToast();
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailInput = event.currentTarget.elements.namedItem('email') as HTMLInputElement;
    if (emailInput && emailInput.value) {
      toast({
        title: "Subscribed!",
        description: `Thank you for subscribing with ${emailInput.value}.`,
      });
      emailInput.value = ''; // Clear the input
    } else {
       toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <Mail size={48} className="mx-auto mb-4 text-accent" />
        <h3 className="text-3xl font-bold mb-3">Get Travel Deals & Updates</h3>
        <p className="text-lg mb-8 max-w-xl mx-auto">
          Subscribe to our newsletter for exclusive offers and travel inspiration.
        </p>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            name="email"
            placeholder="Your email address"
            required
            aria-label="Email address for newsletter"
            className="flex-grow text-lg p-3 rounded-md text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
