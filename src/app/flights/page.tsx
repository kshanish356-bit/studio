
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle as CardTitleShad, CardDescription as CardDescriptionShad, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, Search, Plane, Filter, Loader2, ArrowLeft, X, CheckCircle2, AlertCircle, BaggageClaim, Percent, MinusCircle, CalendarDays, ChevronRight, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Added for airline logo in modal

interface FareBenefit {
  text: string;
  isPositive: boolean; // true for green check, false for orange alert/minus
}

interface FareOption {
  id: string;
  name: string; // e.g., SAVER, FLEXI PLUS
  price: string; // e.g., "₹ 8,841"
  pricePerAdultSuffix?: string; // e.g., "per adult"
  fareSource?: string; // e.g., "FARE BY MAKEMYTRIP"
  isSpecial?: boolean; // e.g., MMT SPECIAL tag
  baggage: {
    cabin: string;
    checkIn: string;
  };
  flexibility: FareBenefit[];
  seatsMealsMore: FareBenefit[];
  offers?: string[];
  benefits?: {
    title: string; // e.g., "BENEFITS WORTH ₹4,279 INCLUDED"
    details: { icon?: React.ElementType; text: string }[];
  };
}

interface FlightWithFares {
  id: string;
  airlineName: string;
  airlineLogo?: string; // Optional: path to airline logo
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  departureDateDisplay: string; // e.g., "Tue, 10 Jun 25"
  duration?: string; // e.g., "2h 15m"
  stops?: string; // e.g., "Non-stop"
  fareOptions: FareOption[];
  // For display on the main card before opening modal
  cheapestFare: string; 
}

// Mock Data with Fare Options
const mockFlightResults: FlightWithFares[] = [
  {
    id: '1',
    airlineName: 'IndiGo',
    airlineLogo: 'https://placehold.co/20x20.png', // Placeholder
    flightNumber: '6E-202',
    departureCity: 'New Delhi',
    arrivalCity: 'Bengaluru',
    departureTime: '20:15',
    arrivalTime: '23:15',
    departureDateDisplay: 'Tue, 10 Jun 25',
    duration: '3h 0m',
    stops: 'Non-stop',
    cheapestFare: '₹ 8,841',
    fareOptions: [
      {
        id: '1-saver',
        name: 'SAVER',
        price: '₹ 8,841',
        pricePerAdultSuffix: 'per adult',
        baggage: { cabin: '7 Kgs', checkIn: '15 Kgs' },
        flexibility: [
          { text: 'Cancellation fee starts at ₹4,279 (up to 4 hours before departure)', isPositive: false },
          { text: 'Date Change fee starts at ₹2,999 (up to 4 hrs before departure)', isPositive: false },
        ],
        seatsMealsMore: [
          { text: 'Chargeable Seats', isPositive: false },
          { text: 'Chargeable Meals', isPositive: false },
        ],
        offers: ['Get FLAT ₹205 OFF using MMTSUPER | Get Flat 10% off on SBI credit cards using code MMTSBI'],
      },
      {
        id: '1-mmtspecial',
        name: 'FARE BY MAKEMYTRIP',
        price: '₹ 9,098',
        pricePerAdultSuffix: 'per adult',
        isSpecial: true,
        baggage: { cabin: '7 Kgs', checkIn: '15 Kgs' },
        flexibility: [
          { text: 'Free Cancellation', isPositive: true },
          { text: 'Free Date Change', isPositive: true },
        ],
        seatsMealsMore: [
          { text: 'Chargeable Seats', isPositive: false },
          { text: 'Chargeable Meals', isPositive: false },
        ],
        benefits: {
          title: 'BENEFITS WORTH ₹4,279 INCLUDED',
          details: [{ icon: CalendarDays, text: 'Flexifly (Zero Cancellation OR Free Date Change)' }],
        },
      },
      {
        id: '1-flexiplus',
        name: 'FLEXI PLUS',
        price: '₹ 9,366',
        pricePerAdultSuffix: 'per adult',
        baggage: { cabin: '7 Kgs', checkIn: '15 Kgs' },
        flexibility: [
          { text: 'Lower Cancellation fee of ₹3,209 (up to 4 hours before departure)', isPositive: false },
          { text: 'Lower Date Change fee ₹999 up to 4 hrs before departure', isPositive: false },
        ],
        seatsMealsMore: [
          { text: 'Free Seats', isPositive: true },
          { text: 'Complimentary Meals', isPositive: true },
        ],
      },
    ],
  },
  // Add more mock flights if needed
];


export default function FlightsPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [fromLocation, setFromLocation] = useState('New Delhi');
  const [toLocation, setToLocation] = useState('Bengaluru');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengersClass, setPassengersClass] = useState('1-Economy');

  const [fareType, setFareType] = useState('Regular');
  const [nonStop, setNonStop] = useState(false);
  const [oneStop, setOneStop] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  const [isFareOptionsModalOpen, setIsFareOptionsModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // For passenger details
  const [selectedFlightForFare, setSelectedFlightForFare] = useState<FlightWithFares | null>(null);
  const [selectedFareOption, setSelectedFareOption] = useState<FareOption | null>(null);
  
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [flightResults, setFlightResults] = useState<FlightWithFares[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDepartureDate(today);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSearchFlights = async () => {
    setIsLoading(true);
    toast({ title: 'Searching Flights', description: `From: ${fromLocation}, To: ${toLocation}` });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFlightResults(mockFlightResults); // Use updated mock data
    setIsLoading(false);
    toast({ title: 'Search Complete', description: 'Displaying available flights.' });
  };

  const handleViewFareOptions = (flight: FlightWithFares) => {
    setSelectedFlightForFare(flight);
    setIsFareOptionsModalOpen(true);
  };

  const handleBookNowFromFareOption = (flight: FlightWithFares, fare: FareOption) => {
    setSelectedFlightForFare(flight); // Keep flight context
    setSelectedFareOption(fare);
    setIsFareOptionsModalOpen(false); // Close fare options modal
    setIsBookingModalOpen(true); // Open passenger details modal
  };
  
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({ title: 'Processing Booking...', description: `Booking flight ${selectedFlightForFare?.flightNumber} (${selectedFareOption?.name}) for ${passengerName}.` });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsBookingModalOpen(false); 
    setPassengerName('');
    setPassengerEmail('');
    setIsLoading(false);
    toast({ title: 'Booking Processed!', description: 'Proceeding to payment.' });
    router.push('/payment'); 
  };

  const handleAirlineChange = (airline: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
    );
  };

  const FareOptionsModal: React.FC<{ flight: FlightWithFares | null; isOpen: boolean; onClose: () => void; onBook: (flight: FlightWithFares, fare: FareOption) => void }> = ({ flight, isOpen, onClose, onBook }) => {
    if (!flight) return null;
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -300 : 300;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-lg">
              {flight.fareOptions.length} Fare Options for your trip
              <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-3">
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground flex items-center gap-2">
              <span>{flight.departureCity} &gt; {flight.arrivalCity}</span>
              {flight.airlineLogo && <Image src={flight.airlineLogo} alt={flight.airlineName} width={16} height={16} data-ai-hint={`${flight.airlineName} logo`} />}
              <span>{flight.airlineName}</span>
              <span>• {flight.departureDateDisplay}</span>
              <span>• Dep: {flight.departureTime} - Arr: {flight.arrivalTime}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative p-4 md:p-6">
             {flight.fareOptions.length > 2 && ( // Show scroll buttons if more than 2 options (adjust as needed)
                <>
                    <Button onClick={() => scroll('left')} variant="outline" size="icon" className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:left-2"> <ChevronLeft className="h-4 w-4" /></Button>
                    <Button onClick={() => scroll('right')} variant="outline" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:right-2"> <ChevronRight className="h-4 w-4" /> </Button>
                </>
             )}
            <div ref={scrollContainerRef} className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {flight.fareOptions.map(fare => (
                <Card key={fare.id} className="min-w-[280px] md:min-w-[300px] flex-shrink-0 border-2 hover:border-primary transition-all">
                  <CardHeader className="p-3 md:p-4 space-y-1 bg-secondary/50">
                    <div className="flex justify-between items-center">
                      <CardTitleShad className="text-sm md:text-base font-semibold">{fare.name}</CardTitleShad>
                      {fare.isSpecial && <span className="text-xs px-2 py-0.5 rounded-sm bg-amber-500 text-white font-semibold">MMTSPECIAL</span>}
                    </div>
                    <p className="text-lg md:text-xl font-bold text-primary">{fare.price} <span className="text-xs font-normal text-muted-foreground">{fare.pricePerAdultSuffix}</span></p>
                    {fare.fareSource && <p className="text-xs text-muted-foreground">{fare.fareSource}</p>}
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 text-xs space-y-2">
                    <div>
                      <p className="font-medium mb-1">Baggage</p>
                      <ul className="space-y-0.5">
                        <li className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />Cabin: {fare.baggage.cabin}</li>
                        <li className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500" />Check-in: {fare.baggage.checkIn}</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Flexibility</p>
                      <ul className="space-y-0.5">
                        {fare.flexibility.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            {item.isPositive ? <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-orange-500 flex-shrink-0 mt-0.5" />}
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Seats, Meals & More</p>
                       <ul className="space-y-0.5">
                        {fare.seatsMealsMore.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            {item.isPositive ? <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-500 flex-shrink-0 mt-0.5" /> : <MinusCircle className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0 mt-0.5" />}
                             <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {fare.offers && fare.offers.length > 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-green-700">
                        {fare.offers.map((offer, idx) => <p key={idx} className="flex items-start"><Percent className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5" /><span>{offer}</span></p>)}
                      </div>
                    )}
                    {fare.benefits && (
                       <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                          <p className="font-semibold mb-1">{fare.benefits.title}</p>
                          {fare.benefits.details.map((detail, idx) => (
                            <p key={idx} className="flex items-center">
                              {detail.icon && <detail.icon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />}
                              <span>{detail.text}</span>
                            </p>
                          ))}
                       </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-3 md:p-4 flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs md:text-sm h-9">Lock Now</Button>
                    <Button onClick={() => onBook(flight, fare)} className="flex-1 text-xs md:text-sm h-9">Book Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
      <nav className="p-4 container mx-auto">
        <Link href="/" className="text-primary hover:text-primary/80 font-bold text-lg">
          &larr; Home
        </Link>
      </nav>

      <section className="py-6 bg-secondary shadow-md">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end p-4 bg-card rounded-lg shadow">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="from">From</Label>
              <Input id="from" placeholder="Enter origin city" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="to">To</Label>
              <Input id="to" placeholder="Enter destination city" value={toLocation} onChange={(e) => setToLocation(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="departure">Departure</Label>
              <Input id="departure" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="return">Return (Optional)</Label>
              <Input id="return" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
              <Label htmlFor="passengersClass">Passengers & Class</Label>
              <Select value={passengersClass} onValueChange={setPassengersClass}>
                <SelectTrigger id="passengersClass">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-Economy">1 Passenger, Economy</SelectItem>
                  <SelectItem value="2-Economy">2 Passengers, Economy</SelectItem>
                  <SelectItem value="1-Business">1 Passenger, Business</SelectItem>
                  <SelectItem value="2-Business">2 Passengers, Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <Button onClick={handleSearchFlights} className="w-full lg:w-auto lg:col-start-5 bg-primary hover:bg-primary/90 text-primary-foreground mt-4 lg:mt-0 h-10 px-6 py-2 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Search
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4 py-8">
        <aside className="w-full md:w-1/4 lg:w-1/5 p-6 bg-card rounded-lg shadow-lg self-start">
          <h2 className="text-2xl font-semibold mb-6 flex items-center"><Filter className="mr-2 h-6 w-6 text-primary" /> Filters</h2>
          
          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Fare Type</h3>
            <RadioGroup value={fareType} onValueChange={setFareType} className="space-y-2">
              {['Regular', 'Student', 'Senior Citizen', 'Armed Forces', 'Doctor and Nurses'].map(type => (
                <div key={type} className="flex items-center">
                  <RadioGroupItem value={type} id={`fare-${type}`} />
                  <Label htmlFor={`fare-${type}`} className="ml-2 cursor-pointer">{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Stops</h3>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox id="nonStop" checked={nonStop} onCheckedChange={(checked) => setNonStop(!!checked)} />
              <Label htmlFor="nonStop" className="cursor-pointer">Non-stop</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="oneStop" checked={oneStop} onCheckedChange={(checked) => setOneStop(!!checked)} />
              <Label htmlFor="oneStop" className="cursor-pointer">1 Stop</Label>
            </div>
          </div>

          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Airlines</h3>
            {['Air India', 'Indigo', 'Vistara'].map(airline => (
              <div key={airline} className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id={`airline-${airline.toLowerCase().replace(/\s+/g, '-')}`} 
                  checked={selectedAirlines.includes(airline)} 
                  onCheckedChange={() => handleAirlineChange(airline)}
                />
                <Label htmlFor={`airline-${airline.toLowerCase().replace(/\s+/g, '-')}`} className="cursor-pointer">{airline}</Label>
              </div>
            ))}
          </div>
          
          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Departure Time</h3>
            <p className="text-sm text-muted-foreground">(e.g., Before 6 AM, 6 AM - 12 PM)</p>
          </div>

          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Arrival Time</h3>
            <p className="text-sm text-muted-foreground">(e.g., Before 6 AM, 6 AM - 12 PM)</p>
          </div>

          <div className="filter-group">
            <h3 className="text-lg font-medium mb-3">One Way Price</h3>
            <p className="text-sm text-muted-foreground">(e.g., ₹0 - ₹10,000)</p>
          </div>
        </aside>

        <section className="flex-grow w-full md:w-3/4 lg:w-4/5">
          <h2 className="text-2xl font-semibold mb-6 flex items-center"><Plane className="mr-2 h-6 w-6 text-primary"/> Available Flights</h2>
          {isLoading && !flightResults.length && (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          )}
          {!isLoading && flightResults.length === 0 && (
            <div className="text-center py-10 bg-card rounded-lg shadow">
              <p className="text-muted-foreground">No flights found for your criteria. Please try adjusting your search or filters.</p>
            </div>
          )}
          {!isLoading && flightResults.length > 0 && (
            <div className="space-y-6">
              {flightResults.map((flight) => (
                <div key={flight.id} className="bg-card p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-center">
                  <div className="flight-card-info mb-4 sm:mb-0">
                    <h3 className="text-xl font-semibold text-primary">{flight.airlineName} <span className="text-sm text-muted-foreground font-normal">{flight.flightNumber}</span></h3>
                    <p className="text-muted-foreground">Dep: {flight.departureTime} ({flight.departureCity})</p>
                    <p className="text-muted-foreground">Arr: {flight.arrivalTime} ({flight.arrivalCity})</p>
                    <p className="text-xs text-muted-foreground">{flight.departureDateDisplay} • {flight.duration} • {flight.stops}</p>
                  </div>
                  <div className="flight-card-price text-center sm:text-right">
                    <h3 className="text-2xl font-bold text-accent mb-2">{flight.cheapestFare}</h3>
                    <Button onClick={() => handleViewFareOptions(flight)} variant="outline">View Fares</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Fare Options Modal */}
      <FareOptionsModal 
        flight={selectedFlightForFare} 
        isOpen={isFareOptionsModalOpen} 
        onClose={() => setIsFareOptionsModalOpen(false)}
        onBook={handleBookNowFromFareOption}
      />

      {/* Passenger Details Modal (existing logic) */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Flight: {selectedFlightForFare?.airlineName} ({selectedFlightForFare?.flightNumber}) - {selectedFareOption?.name}</DialogTitle>
            <DialogDescription>
              Fill in your details to book this flight for {selectedFareOption?.price}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBookingSubmit} className="space-y-4 py-4">
            <div>
              <Label htmlFor="passengerName">Full Name</Label>
              <Input id="passengerName" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="passengerEmail">Email Address</Label>
              <Input id="passengerEmail" type="email" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setIsBookingModalOpen(false); setSelectedFareOption(null); }}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm & Proceed to Pay
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Back to top"
        >
          <ArrowUp size={24} />
        </Button>
      )}
    </div>
  );
}
