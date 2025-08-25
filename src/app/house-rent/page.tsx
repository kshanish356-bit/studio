
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Search, MapPin, BedDouble, Bath, Users, Heart, Filter, Calendar as CalendarIcon, Users as UsersIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const mockProperties = [
  { id: 1, title: 'Luxury Beachfront Villa', location: 'Goa, India', price: 25000, beds: 4, baths: 5, guests: 8, image: 'https://placehold.co/600x400.png', aiHint: 'luxury villa' },
  { id: 2, title: 'Mountain View Chalet', location: 'Manali, Himachal Pradesh', price: 15000, beds: 3, baths: 3, guests: 6, image: 'https://placehold.co/600x400.png', aiHint: 'mountain chalet' },
  { id: 3, title: 'Modern City Loft', location: 'Mumbai, Maharashtra', price: 18000, beds: 2, baths: 2, guests: 4, image: 'https://placehold.co/600x400.png', aiHint: 'city apartment' },
  { id: 4, title: 'Peaceful Backwater Homestay', location: 'Alleppey, Kerala', price: 8000, beds: 2, baths: 2, guests: 4, image: 'https://placehold.co/600x400.png', aiHint: 'kerala house' },
  { id: 5, title: 'Heritage Haveli', location: 'Jaipur, Rajasthan', price: 22000, beds: 5, baths: 6, guests: 10, image: 'https://placehold.co/600x400.png', aiHint: 'heritage building' },
  { id: 6, title: 'Cozy Cottage in the Hills', location: 'Ooty, Tamil Nadu', price: 12000, beds: 2, baths: 1, guests: 3, image: 'https://placehold.co/600x400.png', aiHint: 'hill cottage' },
];

export default function HouseRentPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Find your perfect stay</h1>
          <p className="text-lg text-muted-foreground">Rent unique homes and apartments from local hosts.</p>
        </header>

        <Card className="p-4 md:p-6 shadow-xl sticky top-20 z-30 bg-background/95 backdrop-blur-sm mb-12">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="w-full flex-grow-[2]">
              <Input placeholder="Search destinations (e.g., 'Goa')" className="h-12 text-base" />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto flex-grow h-12 text-base justify-start text-left font-normal text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")
                  ) : "Add dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto flex-grow h-12 text-base justify-start text-left font-normal text-muted-foreground">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Add guests
                </Button>
              </PopoverTrigger>
               <PopoverContent className="w-64 p-4" align="start">
                <p className="text-center">Guest selection UI here</p>
              </PopoverContent>
            </Popover>
            <Button size="lg" className="w-full md:w-auto h-12 text-base px-8 bg-primary hover:bg-primary/90">
              <Search className="mr-2 h-5 w-5" /> Search
            </Button>
          </div>
        </Card>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{mockProperties.length} stays available</h2>
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> More Filters</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mockProperties.map(property => (
            <Card key={property.id} className="border-none shadow-none rounded-lg group overflow-hidden">
              <div className="relative">
                <Image
                  src={property.image}
                  alt={property.title}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg transform group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={property.aiHint}
                />
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-background/70 hover:bg-background rounded-full">
                  <Heart className="h-5 w-5 text-foreground hover:fill-red-500 hover:text-red-500" />
                </Button>
              </div>
              <CardContent className="p-2 pt-4">
                <h3 className="font-bold text-lg truncate">{property.title}</h3>
                <p className="text-muted-foreground text-sm flex items-center mb-1"><MapPin className="h-3 w-3 mr-1" />{property.location}</p>
                <div className="flex items-center text-sm text-muted-foreground space-x-3">
                  <span>{property.guests} guests</span>
                  <span>·</span>
                  <span>{property.beds} beds</span>
                  <span>·</span>
                  <span>{property.baths} baths</span>
                </div>
                <p className="mt-2 text-lg">
                  <span className="font-bold">₹{property.price.toLocaleString()}</span>
                  <span className="text-muted-foreground"> / night</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
