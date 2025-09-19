
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
import { Train, Search, Filter, Loader2, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

interface TrainResult {
  id: string;
  trainName: string;
  trainNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
}

export default function TrainsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Search form state
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengersClass, setPassengersClass] = useState('1-ALL');

  // Filter state
  const [quota, setQuota] = useState('General');
  const [selectedTrainTypes, setSelectedTrainTypes] = useState<string[]>([]);
  const [selectedDepTimes, setSelectedDepTimes] = useState<string[]>([]);
  const [selectedArrTimes, setSelectedArrTimes] = useState<string[]>([]);
  const [selectedFares, setSelectedFares] = useState<string[]>([]);

  // Loading and results
  const [isLoading, setIsLoading] = useState(false);
  const [trainResults, setTrainResults] = useState<TrainResult[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDepartureDate(today);
  }, []);
  
  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };


  const handleSearchTrains = async () => {
    setIsLoading(true);
    toast({ title: 'Searching Trains', description: `From: ${fromStation} To: ${toStation}` });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTrainResults([
      { id: '1', trainName: 'Shatabdi Express', trainNumber: '12001', departureTime: '06:00 AM', arrivalTime: '12:00 PM', price: '₹ 1200' },
      { id: '2', trainName: 'Rajdhani Express', trainNumber: '12301', departureTime: '17:00 PM', arrivalTime: '05:00 AM', price: '₹ 2500' },
      { id: '3', trainName: 'Duronto Express', trainNumber: '12259', departureTime: '20:00 PM', arrivalTime: '07:00 AM', price: '₹ 1800' },
    ]);
    setIsLoading(false);
    toast({ title: 'Search Complete', description: 'Displaying available trains.' });
  };
  
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleBookTrain = (train: TrainResult) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    toast({ title: 'Train Selected', description: `Booking ${train.trainName}. Proceeding to payment.` });
    router.push('/payment');
  };

  const trainTypeOptions = [
    { id: "express", label: "Express" },
    { id: "superfast", label: "Superfast" },
    { id: "shatabdi", label: "Shatabdi" },
    { id: "rajdhani", label: "Rajdhani" },
  ];

  const timeOptions = [
    { id: "before6", label: "Before 6 AM" },
    { id: "6to12", label: "6 AM to 12 PM" },
    { id: "12to18", label: "12 PM to 6 PM" },
    { id: "after18", label: "After 6 PM" },
  ];

  const fareOptions = [
    { id: "500", label: "Up to ₹500" },
    { id: "1000", label: "Up to ₹1000" },
    { id: "2000", label: "Up to ₹2000" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
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
              <Label htmlFor="fromStation">From Station</Label>
              <Input id="fromStation" placeholder="e.g. Mumbai" value={fromStation} onChange={(e) => setFromStation(e.target.value)} />
            </div>
            <div className="flex justify-center items-center">
                <Button variant="outline" size="icon" onClick={handleSwapStations} aria-label="Swap stations" className="mt-auto mb-[1px] h-10 w-10 md:mt-6">
                  <ArrowRightLeft className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="toStation">To Station</Label>
              <Input id="toStation" placeholder="e.g. Delhi" value={toStation} onChange={(e) => setToStation(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1">
              <Label htmlFor="departureDate">Departure Date</Label>
              <Input id="departureDate" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
            </div>
             <div className="flex flex-col space-y-1">
              <Label htmlFor="return">Return (Optional)</Label>
              <Input id="return" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1 col-span-1 md:col-span-2 lg:col-span-2">
              <Label htmlFor="passengersClass">Passengers & Class</Label>
              <Select value={passengersClass} onValueChange={setPassengersClass}>
                <SelectTrigger id="passengersClass"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-ALL">1 Passenger, All Classes</SelectItem>
                  <SelectItem value="1-SL">1 Passenger, Sleeper</SelectItem>
                  <SelectItem value="1-3A">1 Passenger, AC 3-Tier</SelectItem>
                  <SelectItem value="2-ALL">2 Passengers, All Classes</SelectItem>
                  <SelectItem value="2-SL">2 Passengers, Sleeper</SelectItem>
                  <SelectItem value="2-3A">2 Passengers, AC 3-Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearchTrains} className="w-full lg:col-start-5 bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 py-2 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />} Search
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto flex flex-col md:flex-row gap-8 px-4 py-8">
        <aside className="w-full md:w-1/4 lg:w-1/5 p-6 bg-card rounded-lg shadow-lg self-start">
          <h2 className="text-2xl font-semibold mb-6 flex items-center"><Filter className="mr-2 h-6 w-6 text-primary" /> Filters</h2>
          
          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Quota</h3>
            <RadioGroup value={quota} onValueChange={setQuota} className="space-y-2">
              {['General', 'Tatkal', 'Ladies', 'Senior Citizen'].map(type => (
                <div key={type} className="flex items-center">
                  <RadioGroupItem value={type} id={`quota-${type.toLowerCase().replace(/\s+/g, '-')}`} />
                  <Label htmlFor={`quota-${type.toLowerCase().replace(/\s+/g, '-')}`} className="ml-2 cursor-pointer">{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Train Type</h3>
            {trainTypeOptions.map(type => (
              <div key={type.id} className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id={`trainType-${type.id}`} 
                  checked={selectedTrainTypes.includes(type.id)} 
                  onCheckedChange={() => handleFilterChange(setSelectedTrainTypes, type.id)}
                />
                <Label htmlFor={`trainType-${type.id}`} className="cursor-pointer">{type.label}</Label>
              </div>
            ))}
          </div>

          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Departure Time</h3>
            {timeOptions.map(time => (
              <div key={`dep-${time.id}`} className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id={`depTime-${time.id}`} 
                  checked={selectedDepTimes.includes(time.id)} 
                  onCheckedChange={() => handleFilterChange(setSelectedDepTimes, time.id)}
                />
                <Label htmlFor={`depTime-${time.id}`} className="cursor-pointer">{time.label}</Label>
              </div>
            ))}
          </div>

          <div className="filter-group mb-6">
            <h3 className="text-lg font-medium mb-3">Arrival Time</h3>
            {timeOptions.map(time => (
              <div key={`arr-${time.id}`} className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id={`arrTime-${time.id}`} 
                  checked={selectedArrTimes.includes(time.id)} 
                  onCheckedChange={() => handleFilterChange(setSelectedArrTimes, time.id)}
                />
                <Label htmlFor={`arrTime-${time.id}`} className="cursor-pointer">{time.label}</Label>
              </div>
            ))}
          </div>
          
          <div className="filter-group">
            <h3 className="text-lg font-medium mb-3">Fare</h3>
            {fareOptions.map(fare => (
              <div key={fare.id} className="flex items-center space-x-2 mb-2">
                <Checkbox 
                  id={`fare-${fare.id}`} 
                  checked={selectedFares.includes(fare.id)} 
                  onCheckedChange={() => handleFilterChange(setSelectedFares, fare.id)}
                />
                <Label htmlFor={`fare-${fare.id}`} className="cursor-pointer">{fare.label}</Label>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-grow w-full md:w-3/4 lg:w-4/5">
          <h2 className="text-2xl font-semibold mb-6 flex items-center"><Train className="mr-2 h-6 w-6 text-primary"/> Available Trains</h2>
          {isLoading && !trainResults.length && (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          )}
          {!isLoading && trainResults.length === 0 && (
            <div className="text-center py-10 bg-card rounded-lg shadow">
              <p className="text-muted-foreground">No trains found for your criteria. Please try adjusting your search or filters.</p>
            </div>
          )}
          {!isLoading && trainResults.length > 0 && (
            <div className="space-y-6">
              {trainResults.map((train) => (
                <div key={train.id} className="bg-card p-6 rounded-lg shadow-lg flex flex-col sm:flex-row justify-between items-center">
                  <div className="train-card-info mb-4 sm:mb-0">
                    <h3 className="text-xl font-semibold text-primary">{train.trainName} <span className="text-sm text-muted-foreground font-normal">({train.trainNumber})</span></h3>
                    <p className="text-muted-foreground">Departure: {train.departureTime}</p>
                    <p className="text-muted-foreground">Arrival: {train.arrivalTime}</p>
                  </div>
                  <div className="train-card-price text-center sm:text-right">
                    <h3 className="text-2xl font-bold text-accent mb-2">{train.price}</h3>
                    <Button variant="outline" onClick={() => handleBookTrain(train)}>Book & Proceed to Pay</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

    