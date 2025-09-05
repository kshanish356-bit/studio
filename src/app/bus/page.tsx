
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRightLeft, Bus, Search, Sofa, Clock, Filter, Wind, Tv, Plug, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [returnDate, setReturnDate] = useState('');
  const [passengersSeatType, setPassengersSeatType] = useState('1-ALL');
  const [isLoading, setIsLoading] = useState(false);
  
  const [busType, setBusType] = useState('All');

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
    <div className="bg-background min-h-screen">
       <nav className="p-4 container mx-auto">
        <Link href="/" className="text-primary hover:text-primary/80 font-bold text-lg inline-flex items-center">
          <ArrowLeft className="mr-1 h-5 w-5"/>
          Home
        </Link>
      </nav>

       <section className="py-6 bg-secondary shadow-md">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end p-4 bg-card rounded-lg shadow">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="fromCity">From</Label>
              <Input id="fromCity" value={fromCity} onChange={e => setFromCity(e.target.value)} />
            </div>
            <div className="flex justify-center items-center">
                <Button variant="outline" size="icon" onClick={handleSwapCities} aria-label="Swap cities" className="mt-auto mb-[1px] h-10 w-10 md:mt-6">
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="toCity">To</Label>
              <Input id="toCity" value={toCity} onChange={e => setToCity(e.target.value)} />
            </div>
             <div className="flex flex-col space-y-1">
               <Label htmlFor="travelDate">Date of Journey</Label>
               <Input id="travelDate" type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} />
            </div>
             <div className="flex flex-col space-y-1">
              <Label htmlFor="return">Return (Optional)</Label>
              <Input id="return" type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1 col-span-1 md:col-span-2 lg:col-span-2">
              <Label htmlFor="passengersSeatType">Passengers & Seat Type</Label>
              <Select value={passengersSeatType} onValueChange={setPassengersSeatType}>
                <SelectTrigger id="passengersSeatType"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-ALL">1 Passenger, All Types</SelectItem>
                  <SelectItem value="1-Seater">1 Passenger, Seater</SelectItem>
                  <SelectItem value="1-Sleeper">1 Passenger, Sleeper</SelectItem>
                  <SelectItem value="2-ALL">2 Passengers, All Types</SelectItem>
                  <SelectItem value="2-Seater">2 Passengers, Seater</SelectItem>
                  <SelectItem value="2-Sleeper">2 Passengers, Sleeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="w-full lg:col-start-5 bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 py-2 text-base" disabled={isLoading}>
               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-5 w-5" />} Search
            </Button>
          </div>
        </div>
       </section>

       <main className="container mx-auto flex flex-col md:flex-row gap-8 px-4 py-8">
        <aside className="w-full md:w-1/4 lg:w-1/5 p-6 bg-card rounded-lg shadow-lg self-start">
          <h2 className="text-2xl font-semibold mb-6 flex items-center"><Filter className="mr-2 h-6 w-6 text-primary"/>Filters</h2>
          
          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Bus Type</h3>
             <RadioGroup value={busType} onValueChange={setBusType} className="space-y-2">
              {['All', 'A/C', 'Non-A/C', 'Sleeper', 'Seater'].map(type => (
                <div key={type} className="flex items-center">
                  <RadioGroupItem value={type} id={`type-${type}`} />
                  <Label htmlFor={`type-${type}`} className="ml-2 cursor-pointer">{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Departure Time</h3>
             <div className="space-y-2">
              {['Before 6 AM', '6 AM - 12 PM', '12 PM - 6 PM', 'After 6 PM'].map(time => (
                <div key={time} className="flex items-center"><Checkbox id={`time-${time}`} /><Label htmlFor={`time-${time}`} className="ml-2">{time}</Label></div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-grow w-full md:w-3/4 lg:w-4/5">
            <h2 className="text-2xl font-semibold mb-6 flex items-center"><Bus className="mr-2 h-6 w-6 text-primary"/> Available Buses</h2>
             {isLoading && (
               <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
               </div>
            )}
            {!isLoading && mockBuses.length === 0 && (
              <div className="text-center py-10 bg-card rounded-lg shadow">
                <p className="text-muted-foreground">No buses found for your criteria. Please try adjusting your search or filters.</p>
              </div>
            )}
            {!isLoading && mockBuses.length > 0 && (
              <div className="space-y-6">
                {mockBuses.map(bus => (
                  <div key={bus.id} className="bg-card p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-center">
                    <div className="bus-card-info mb-4 sm:mb-0">
                      <h3 className="text-xl font-semibold text-primary">{bus.operator}</h3>
                      <p className="text-sm text-muted-foreground">{bus.type}</p>
                      <p className="text-muted-foreground mt-2">Departure: {bus.departure}</p>
                      <p className="text-muted-foreground">Arrival: {bus.arrival}</p>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="flex items-center text-sm text-muted-foreground"><Clock className="h-4 w-4 mr-1"/>{bus.duration}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="flex items-center text-sm text-muted-foreground"><Sofa className="h-4 w-4 mr-1"/>{bus.seats} Seats left</span>
                       </div>
                    </div>
                    <div className="bus-card-price text-center sm:text-right">
                      <h3 className="text-2xl font-bold text-accent mb-2">₹{bus.price.toLocaleString()}</h3>
                      <Button variant="outline">View Seats</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
       </main>
    </div>
  );
}
