
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // DialogClose removed as not explicitly used
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, Search, Plane, Filter, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Added useRouter

interface Flight {
  id: string;
  airlineName: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
}

export default function FlightsPage() {
  const { toast } = useToast();
  const router = useRouter(); // Initialized useRouter

  // Search form state
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengersClass, setPassengersClass] = useState('1-Economy');

  // Filter state
  const [fareType, setFareType] = useState('Regular');
  const [nonStop, setNonStop] = useState(false);
  const [oneStop, setOneStop] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // Kept for potential future use
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [confirmationDetails, setConfirmationDetails] = useState(''); // Kept for potential future use

  // Loading and results
  const [isLoading, setIsLoading] = useState(false);
  const [flightResults, setFlightResults] = useState<Flight[]>([]);

  // Back to top button
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const today = new Date().toISOString().split('T')[0];
    setDepartureDate(today);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFlights = async () => {
    setIsLoading(true);
    toast({ title: 'Searching Flights', description: `From: ${fromLocation}, To: ${toLocation}` });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFlightResults([
      { id: '1', airlineName: 'Air India', flightNumber: 'AI-101', departureTime: '08:00 AM', arrivalTime: '10:00 AM', price: '₹ 7,500' },
      { id: '2', airlineName: 'Indigo', flightNumber: '6E-202', departureTime: '09:30 AM', arrivalTime: '11:45 AM', price: '₹ 6,800' },
    ]);
    setIsLoading(false);
    toast({ title: 'Search Complete', description: 'Displaying available flights.' });
  };

  const handleViewFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({ title: 'Processing Booking...', description: `Booking flight ${selectedFlight?.flightNumber} for ${passengerName}.` });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful booking
    // In a real app, here you would get a booking ID or confirmation
    // For now, we assume success and navigate to payment
    
    setConfirmationDetails(`Booking confirmed for ${passengerName} on flight ${selectedFlight?.flightNumber}. Email: ${passengerEmail}`); // Store details if needed
    
    setIsBookingModalOpen(false); 
    // setIsConfirmationModalOpen(true); // Confirmation modal might be shown after payment
    
    setPassengerName('');
    setPassengerEmail('');
    setIsLoading(false);
    toast({ title: 'Booking Processed!', description: 'Proceeding to payment.' });
    router.push('/payment'); // Navigate to payment page
  };

  const handleAirlineChange = (airline: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
    );
  };


  return (
    <div className="bg-background min-h-screen">
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
                    <p className="text-muted-foreground">Departure: {flight.departureTime}</p>
                    <p className="text-muted-foreground">Arrival: {flight.arrivalTime}</p>
                  </div>
                  <div className="flight-card-price text-center sm:text-right">
                    <h3 className="text-2xl font-bold text-accent mb-2">{flight.price}</h3>
                    <Button onClick={() => handleViewFlight(flight)} variant="outline">View Details & Book</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Flight: {selectedFlight?.airlineName} ({selectedFlight?.flightNumber})</DialogTitle>
            <DialogDescription>
              Fill in your details to book this flight from {selectedFlight?.departureTime} to {selectedFlight?.arrivalTime} for {selectedFlight?.price}.
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
              <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm & Proceed to Pay
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmationModalOpen} onOpenChange={setIsConfirmationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Confirmed!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{confirmationDetails}</p>
            <p className="mt-2 text-sm text-muted-foreground">A confirmation email has been sent to you (simulated).</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsConfirmationModalOpen(false)}>Close</Button>
          </DialogFooter>
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
