
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { ArrowRightLeft, Bus, Search, Sofa, Clock, Filter, Wind, Tv, Plug, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const mockBuses = [
  { id: 1, operator: 'VRL Travels', type: 'Sleeper, A/C', departure: '21:00', arrival: '06:30', duration: '9h 30m', price: 1250, seats: 15, rating: 4.5, amenities: ['ac', 'tv', 'plug'] },
  { id: 2, operator: 'Sharma Transports', type: 'Seater, Non-A/C', departure: '22:30', arrival: '08:00', duration: '9h 30m', price: 800, seats: 25, rating: 4.2, amenities: ['plug'] },
  { id: 3, operator: 'Intercity SmartBus', type: 'Sleeper, A/C, Volvo', departure: '20:00', arrival: '05:00', duration: '9h 00m', price: 1600, seats: 8, rating: 4.8, amenities: ['ac', 'tv', 'plug'] },
  { id: 4, operator: 'KSRTC (Govt)', type: 'Seater, A/C', departure: '19:00', arrival: '04:30', duration: '9h 30m', price: 950, seats: 30, rating: 3.9, amenities: ['ac'] },
];

const amenityIcons: { [key: string]: React.ElementType } = {
  ac: Wind,
  tv: Tv,
  plug: Plug,
};

export default function BusPage() {
  const [fromCity, setFromCity] = useState('Bangalore');
  const [toCity, setToCity] = useState('Hyderabad');
  const [travelDate, setTravelDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTravelDate(today);
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500); // Simulate API call
  };

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };
  
  return (
    <div className="bg-secondary/40 min-h-screen">
       <div className="bg-gradient-to-r from-primary to-blue-600 py-12">
        <div className="container mx-auto px-4">
          <Card className="p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
              <div className="md:col-span-4">
                <Label htmlFor="fromCity" className="text-muted-foreground">From</Label>
                <Input id="fromCity" value={fromCity} onChange={e => setFromCity(e.target.value)} className="text-lg h-12" />
              </div>
              <div className="md:col-span-1 flex justify-center">
                 <Button variant="outline" size="icon" onClick={handleSwapCities} className="h-12 w-12 border-2">
                    <ArrowRightLeft />
                 </Button>
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="toCity" className="text-muted-foreground">To</Label>
                <Input id="toCity" value={toCity} onChange={e => setToCity(e.target.value)} className="text-lg h-12" />
              </div>
              <div className="md:col-span-3">
                 <Label htmlFor="travelDate" className="text-muted-foreground">Date of Journey</Label>
                 <Input id="travelDate" type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} className="text-lg h-12" />
              </div>
              <div className="md:col-span-4" />
              <Button onClick={handleSearch} className="md:col-span-3 w-full h-12 text-lg" disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Search className="mr-2 h-5 w-5" />} Search Buses
              </Button>
            </div>
          </Card>
        </div>
       </div>

       <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 bg-background p-6 rounded-lg shadow-lg self-start">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Filter className="mr-2"/>Filters</h2>
            <Separator className="mb-4" />
            <div className="space-y-6">
               <div>
                  <h3 className="font-semibold mb-2">Bus Type</h3>
                  <div className="space-y-2">
                    {['A/C', 'Non-A/C', 'Seater', 'Sleeper'].map(type => (
                      <div key={type} className="flex items-center"><Checkbox id={`type-${type}`} /><Label htmlFor={`type-${type}`} className="ml-2">{type}</Label></div>
                    ))}
                  </div>
              </div>
              <Separator />
               <div>
                  <h3 className="font-semibold mb-2">Departure Time</h3>
                   <div className="space-y-2">
                    {['Before 6 AM', '6 AM - 12 PM', '12 PM - 6 PM', 'After 6 PM'].map(time => (
                      <div key={time} className="flex items-center"><Checkbox id={`time-${time}`} /><Label htmlFor={`time-${time}`} className="ml-2">{time}</Label></div>
                    ))}
                  </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3 space-y-6">
            <h3 className="text-xl font-semibold">Showing {mockBuses.length} buses from {fromCity} to {toCity}</h3>
            {mockBuses.map(bus => (
              <Card key={bus.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="grid grid-cols-1 md:grid-cols-6 p-4">
                  <div className="md:col-span-4 flex flex-col justify-between pr-4">
                    <div>
                      <CardTitle className="text-xl">{bus.operator}</CardTitle>
                      <CardDescription>{bus.type}</CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        {bus.amenities.map(amenity => {
                          const Icon = amenityIcons[amenity];
                          return Icon ? <Icon key={amenity} className="h-5 w-5 text-muted-foreground" title={amenity} /> : null;
                        })}
                      </div>
                    </div>
                     <div className="flex items-center gap-2 text-sm mt-4 text-muted-foreground">
                        <span className="flex items-center"><Clock className="h-4 w-4 mr-1"/>{bus.duration}</span>
                        <span>•</span>
                        <span className="flex items-center"><Sofa className="h-4 w-4 mr-1"/>{bus.seats} Seats left</span>
                        <span>•</span>
                        <span className="flex items-center bg-green-600 text-white font-bold py-0.5 px-2 rounded"><Bus className="h-4 w-4 mr-1"/>{bus.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 mt-4 md:mt-0">
                    <div className="flex md:flex-col md:items-end w-full justify-between">
                       <div className="text-center">
                          <p className="font-bold text-lg">{bus.departure}</p>
                          <p className="text-sm text-muted-foreground">From</p>
                       </div>
                       <div className="text-center mx-4 text-muted-foreground">→</div>
                       <div className="text-center">
                          <p className="font-bold text-lg">{bus.arrival}</p>
                          <p className="text-sm text-muted-foreground">To</p>
                       </div>
                    </div>
                    <div className="text-right mt-4 w-full">
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-2xl font-bold text-primary">₹{bus.price.toLocaleString()}</p>
                      <Button className="w-full mt-2">View Seats</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </section>
        </div>
       </main>
    </div>
  );
}
