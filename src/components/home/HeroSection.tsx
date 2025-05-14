
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="hero bg-cover bg-center py-20 md:py-32 text-white relative"
      style={{ backgroundImage: "url('https://placehold.co/1920x1080.png?text=Scenic+Travel+Destination')" }}
      data-ai-hint="travel background"
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover Your Next Adventure
        </h1>
        <p className="text-lg md:text-xl mb-10">
          Book flights, hotels, and packages with exclusive discounts
        </p>
        <form className="max-w-xl mx-auto flex gap-2" onSubmit={(e) => { e.preventDefault(); alert('Search submitted!'); }}>
          <Input
            type="text"
            placeholder="Search destinations, e.g., Paris, Bali, Tokyo..."
            aria-label="Search destinations"
            className="text-lg p-4 rounded-md flex-grow text-foreground"
          />
          <Button type="submit" size="lg" aria-label="Search" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Search className="mr-2 h-5 w-5" /> Search
          </Button>
        </form>
      </div>
    </section>
  );
}

