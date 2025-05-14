
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TrainBookingForm() {
  const [fromStation, setFromStation] = useState('BPL');
  const [toStation, setToStation] = useState('NDLS');
  const [travelDate, setTravelDate] = useState('');
  const [travelClass, setTravelClass] = useState('ALL');
  const [bookingOption, setBookingOption] = useState('train');
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTravelDate(today);
  }, []);

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleSearchTrains = async () => {
    if (bookingOption !== 'train') {
      toast({ title: "Info", description: `Functionality for "${bookingOption}" is not yet implemented.`});
      return;
    }
    // Basic validation
    if (!fromStation || !toStation || !travelDate || !travelClass) {
        toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
        return;
    }
    toast({ title: "Searching Trains...", description: `From: ${fromStation}, To: ${toStation}, Date: ${travelDate}, Class: ${travelClass}` });
    // Placeholder for API call
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({ title: "Search Complete", description: "Train search functionality is a placeholder." });
  };

  const stationOptions = [
    { value: 'BPL', label: 'Bhopal (BPL)' },
    { value: 'NDLS', label: 'Delhi (NDLS)' },
    { value: 'CSTM', label: 'Mumbai (CSTM)' },
    { value: 'MAS', label: 'Chennai (MAS)' },
    { value: 'HWH', label: 'Howrah (HWH)' },
    { value: 'SBC', label: 'Bengaluru (SBC)' },
  ];

  const classOptions = [
    { value: 'ALL', label: 'All Classes' },
    { value: 'SL', label: 'Sleeper (SL)' },
    { value: '3A', label: 'AC 3-Tier (3A)' },
    { value: '2A', label: 'AC 2-Tier (2A)' },
    { value: '1A', label: 'AC First Class (1A)' },
  ];

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
          <div className="mb-6">
            <RadioGroup defaultValue="train" onValueChange={(value) => setBookingOption(value)} className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="train" id="opt-train" />
                <Label htmlFor="opt-train">Book Train Tickets</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pnr" id="opt-pnr" />
                <Label htmlFor="opt-pnr">Check PNR Status</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="status" id="opt-status" />
                <Label htmlFor="opt-status">Live Train Status</Label>
              </div>
            </RadioGroup>
            <h2 className="text-2xl font-semibold text-primary">
              Train Ticket Booking
              <span className="text-sm text-muted-foreground ml-2">IRCTC Authorized e-ticketing</span>
            </h2>
          </div>

          {bookingOption === 'train' && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-4 items-end mb-6">
                <div className="lg:col-span-2">
                    <Label htmlFor="fromStation">From</Label>
                    <Select value={fromStation} onValueChange={setFromStation}>
                    <SelectTrigger id="fromStation"><SelectValue placeholder="Select station" /></SelectTrigger>
                    <SelectContent>
                        {stationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-center items-center lg:col-span-1">
                    <Button variant="outline" size="icon" onClick={handleSwapStations} aria-label="Swap stations" className="mt-auto mb-[1px] h-10 w-10 md:mt-6">
                    <ArrowRightLeft className="h-5 w-5" />
                    </Button>
                </div>

                <div className="lg:col-span-2">
                    <Label htmlFor="toStation">To</Label>
                    <Select value={toStation} onValueChange={setToStation}>
                    <SelectTrigger id="toStation"><SelectValue placeholder="Select station" /></SelectTrigger>
                    <SelectContent>
                        {stationOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                
                <div className="lg:col-span-2">
                    <Label htmlFor="travelDate">Travel Date</Label>
                    <Input id="travelDate" type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                
                <div className="lg:col-span-2">
                    <Label htmlFor="travelClass">Class</Label>
                    <Select value={travelClass} onValueChange={setTravelClass}>
                    <SelectTrigger id="travelClass"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                        {classOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="text-center">
                <Button size="lg" onClick={handleSearchTrains} className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3">
                SEARCH TRAINS
                </Button>
            </div>
            </>
          )}
          {bookingOption === 'pnr' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">PNR Status checking functionality coming soon.</p>
              <Input type="text" placeholder="Enter PNR Number" className="max-w-sm mx-auto my-4" />
              <Button onClick={handleSearchTrains}>Check PNR</Button>
            </div>
          )}
          {bookingOption === 'status' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Live Train Status functionality coming soon.</p>
              <Input type="text" placeholder="Enter Train Number or Name" className="max-w-sm mx-auto my-4" />
              <Button onClick={handleSearchTrains}>Check Status</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
