
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { Search, Star, MapPin, Wifi, Utensils, ParkingCircle, Sun, Wind, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

const mockHotels = [
  { id: 1, name: 'The Oberoi Grand', location: 'Kolkata, West Bengal', rating: 4.9, price: 15000, image: 'https://placehold.co/400x300.png', aiHint: 'luxury hotel', amenities: ['wifi', 'parking', 'pool'] },
  { id: 2, name: 'Taj Falaknuma Palace', location: 'Hyderabad, Telangana', rating: 5.0, price: 35000, image: 'https://placehold.co/400x300.png', aiHint: 'palace hotel', amenities: ['wifi', 'parking', 'pool', 'restaurant'] },
  { id: 3, name: 'The Leela Palace', location: 'Udaipur, Rajasthan', rating: 4.8, price: 28000, image: 'https://placehold.co/400x300.png', aiHint: 'lake palace', amenities: ['wifi', 'parking', 'pool', 'restaurant', 'ac'] },
  { id: 4, name: 'Wildflower Hall', location: 'Shimla, Himachal Pradesh', rating: 4.7, price: 22000, image: 'https://placehold.co/400x300.png', aiHint: 'mountain resort', amenities: ['wifi', 'parking', 'restaurant', 'ac'] },
  { id: 5, name: 'Spice Village - CGH Earth', location: 'Thekkady, Kerala', rating: 4.6, price: 18000, image: 'https://placehold.co/400x300.png', aiHint: 'eco resort', amenities: ['wifi', 'parking', 'pool'] },
  { id: 6, name: 'The Imperial', location: 'New Delhi, Delhi', rating: 4.9, price: 20000, image: 'https://placehold.co/400x300.png', aiHint: 'historic hotel', amenities: ['wifi', 'parking', 'pool', 'restaurant', 'ac'] },
];

const amenityIcons: { [key: string]: React.ElementType } = {
  wifi: Wifi,
  parking: ParkingCircle,
  pool: Sun,
  restaurant: Utensils,
  ac: Wind,
};

export default function HotelsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 1)) });
  const [priceRange, setPriceRange] = useState([25000]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500); // Simulate search
  };

  return (
    <div className="bg-secondary/40">
      <header className="bg-background shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2 xl:col-span-2">
              <Label htmlFor="destination">Destination/Hotel Name</Label>
              <Input id="destination" placeholder="e.g., Goa" defaultValue="India" />
            </div>
            <div>
              <Label>Check-in / Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <span>{dateRange?.from ? format(dateRange.from, 'LLL dd, y') : 'Check-in'}</span> - <span>{dateRange?.to ? format(dateRange.to, 'LLL dd, y') : 'Check-out'}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="guests">Guests & Rooms</Label>
              <Input id="guests" placeholder="2 Guests, 1 Room" defaultValue="2 Guests, 1 Room" />
            </div>
            <Button onClick={handleSearch} className="w-full h-10 xl:h-auto" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              <span className="ml-2 hidden xl:inline">Search</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 bg-background p-6 rounded-lg shadow-lg self-start">
            <h2 className="text-xl font-bold mb-4">Filter By</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Price Range (per night)</h3>
                <Slider defaultValue={[25000]} max={50000} step={1000} onValueChange={setPriceRange} />
                <p className="text-sm text-muted-foreground mt-2">Up to ₹{priceRange[0].toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Star Category</h3>
                <div className="space-y-2">
                  {[5, 4, 3].map(star => (
                    <div key={star} className="flex items-center">
                      <Checkbox id={`star-${star}`} />
                      <Label htmlFor={`star-${star}`} className="ml-2 flex items-center">
                        {Array(star).fill(0).map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="space-y-2">
                  {Object.keys(amenityIcons).map(amenity => (
                     <div key={amenity} className="flex items-center">
                      <Checkbox id={`amenity-${amenity}`} />
                      <Label htmlFor={`amenity-${amenity}`} className="ml-2 capitalize">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Hotel Listings */}
          <section className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockHotels.map(hotel => (
                <Card key={hotel.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="relative">
                    <Image src={hotel.image} alt={hotel.name} width={400} height={300} className="w-full h-48 object-cover" data-ai-hint={hotel.aiHint} />
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="text-lg font-bold truncate">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center"><MapPin className="h-3 w-3 mr-1" /> {hotel.location}</p>
                    <div className="flex items-center my-2">
                      <div className="flex items-center">
                        {Array(Math.floor(hotel.rating)).fill(0).map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                        {hotel.rating % 1 !== 0 && <Star className="h-4 w-4 text-yellow-400" />}
                      </div>
                      <span className="ml-2 text-xs bg-primary text-primary-foreground font-bold py-0.5 px-1.5 rounded">{hotel.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex gap-2 my-3">
                      {hotel.amenities.map(amenity => {
                        const Icon = amenityIcons[amenity];
                        return Icon ? <Icon key={amenity} className="h-5 w-5 text-muted-foreground" title={amenity} /> : null;
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 bg-secondary/50 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-xl font-bold">₹{hotel.price.toLocaleString()}</p>
                    </div>
                    <Button>View Deal</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
