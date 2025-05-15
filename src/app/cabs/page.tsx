
"use client";

import type React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UploadCloud, DownloadCloud, Trash2, Route, MapPin, Building, Navigation, Edit3, Loader2 } from 'lucide-react'; // Added Loader2

// Declare mapboxgl
declare global {
  interface Window {
    mapboxgl: any;
  }
}

type ActiveTab = 'cityTour' | 'cab' | 'multiCity';

interface TourStop {
  id: string; // Unique ID for React key
  name: string;
}

export default function CabAndTourPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('cityTour');

  // City Tour State
  const [tourStopInput, setTourStopInput] = useState('');
  const [tourStops, setTourStops] = useState<TourStop[]>([]);

  // Cab Booking State
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [bookingDateTime, setBookingDateTime] = useState('');

  // Multi-City State
  const [city1, setCity1] = useState('');
  const [city2, setCity2] = useState('');
  const [city3, setCity3] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null); // For Mapbox map instance
  const markersRef = useRef<any[]>([]); // For Mapbox marker instances
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2wxeGJlb2F4MDE3YzJubHVmZmJoYjB4OCJ9.3p0YO7nprdfRCVzmE-Ujgg'; // Replace with your actual token, ideally from env

  useEffect(() => {
    if (typeof window.mapboxgl !== 'undefined' && mapContainerRef.current && !mapInstanceRef.current) {
      window.mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
      const map = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [78.9629, 20.5937], // Default center (India)
        zoom: 4,
      });
      mapInstanceRef.current = map;

      map.on('load', () => {
        console.log("Map loaded successfully.");
      });

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, [MAPBOX_ACCESS_TOKEN]);

  const addMapMarker = useCallback(async (stopName: string) => {
    if (!mapInstanceRef.current || !window.mapboxgl) return;

    try {
      const geocodeURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(stopName)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(geocodeURL);
      const data = await response.json();
      const coordinates = data.features[0]?.geometry.coordinates;

      if (coordinates) {
        const marker = new window.mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(mapInstanceRef.current);
        markersRef.current.push(marker);
        mapInstanceRef.current.flyTo({ center: coordinates, zoom: 12 });
      } else {
        toast({ title: "Location not found", description: `Could not find coordinates for: ${stopName}`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding marker:", error);
      toast({ title: "Geocoding Error", description: `Failed to geocode: ${stopName}`, variant: "destructive" });
    }
  }, [MAPBOX_ACCESS_TOKEN, toast]);

  const handleAddStop = () => {
    const stopName = tourStopInput.trim();
    if (stopName) {
      setTourStops(prevStops => [...prevStops, { id: Date.now().toString(), name: stopName }]);
      addMapMarker(stopName);
      setTourStopInput('');
    } else {
      toast({ title: "Invalid Stop", description: "Please enter a valid tour stop.", variant: "destructive" });
    }
  };

  const loadPresetTour = (stops: string[]) => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    setTourStops(stops.map(s => ({ id: Date.now().toString() + s + Math.random(), name: s })));
    stops.forEach(stop => addMapMarker(stop));
    toast({ title: "Preset Tour Loaded", description: `${stops.length} stops added to your tour.` });
  };
  

  const handleClearList = () => {
    setTourStops([]);
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    toast({ title: "Tour Cleared", description: "All stops have been removed." });
  };

  const handleDownloadList = () => {
    if (tourStops.length === 0) {
      toast({ title: "Empty Tour", description: "No stops to download.", variant: "destructive"});
      return;
    }
    const blob = new Blob([JSON.stringify(tourStops.map(s => s.name))], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tour_stops.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download Started", description: "Your tour list is being downloaded." });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const uploadedStopNames = JSON.parse(e.target?.result as string);
          if (Array.isArray(uploadedStopNames) && uploadedStopNames.every(s => typeof s === 'string')) {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
            setTourStops(uploadedStopNames.map(name => ({ id: Date.now().toString() + name + Math.random(), name })));
            uploadedStopNames.forEach(name => addMapMarker(name));
            toast({ title: "Tour Uploaded", description: "Tour stops have been loaded from file." });
          } else {
            throw new Error("Invalid file format. Expected an array of strings.");
          }
        } catch (err) {
          toast({ title: "Upload Error", description: "Invalid JSON file or format.", variant: "destructive" });
          console.error(err);
        }
      };
      reader.readAsText(file);
      event.target.value = ''; // Reset file input
    }
  };
  
  const handleCabBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!pickupLocation || !dropoffLocation || !bookingDateTime) {
      toast({ title: "Missing Information", description: "Please fill all cab booking fields.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    toast({ title: "Cab Booking Submitted", description: `Booking from ${pickupLocation} to ${dropoffLocation} for ${bookingDateTime}. Proceeding to payment.` });
    setTimeout(() => {
      setIsLoading(false);
      router.push('/payment');
    }, 1500);
  };

  const handleMultiCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city1 || !city2) { 
      toast({
        title: 'Missing Information',
        description: 'Please enter at least City 1 and City 2 for multi-city booking.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    toast({
      title: 'Multi-City Search Submitted',
      description: `Searching for routes: ${city1} to ${city2}${city3 ? ` to ${city3}` : ''}. Proceeding to payment.`,
    });
    setTimeout(() => {
      setIsLoading(false);
      router.push('/payment');
    }, 1500);
  };

  const handlePayAndBookTour = () => {
    if (tourStops.length === 0) {
      toast({ title: "Empty Tour", description: "Please add stops to your tour before booking.", variant: "destructive" });
      return;
    }
    toast({ title: "Booking Tour", description: "Proceeding to payment for your custom tour." });
    router.push('/payment');
  };

  const presetTours = {
    "City Tour 1": ['India Gate, Delhi', 'Red Fort, Delhi', 'Qutub Minar, Delhi'],
    "City Tour 2": ['Gateway of India, Mumbai', 'Marine Drive, Mumbai', 'Elephanta Caves, Mumbai'],
    "City Tour 3": ['Taj Mahal, Agra', 'Agra Fort, Agra', 'Fatehpur Sikri, Agra'],
  };


  return (
    <>
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Mapbox GL JS script loaded.');
        }}
      />
      <nav className="p-4 container mx-auto">
        <Link href="/" className="text-primary hover:text-primary/80 font-bold text-lg inline-flex items-center">
          <Navigation className="mr-2 h-5 w-5 transform rotate-[-90deg]" /> Home
        </Link>
      </nav>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-[1000]">
          <div className="w-16 h-16 border-8 border-muted border-t-primary rounded-full animate-spin" />
          <div className="text-white mt-4 text-lg">Loading, please wait...</div>
        </div>
      )}

      <div className="container mx-auto mt-4 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel */}
          <div className="w-full md:w-1/3"> {/* Adjusted width for left panel */}
            <Card className="p-4 shadow-lg">
              <CardContent className="p-2 md:p-4">
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={activeTab === 'cab' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('cab')}
                    className="flex-1 rounded-full"
                  >
                    <Building className="mr-2 h-4 w-4" /> Book Cab
                  </Button>
                  <Button
                    variant={activeTab === 'cityTour' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('cityTour')}
                    className="flex-1 rounded-full"
                  >
                    <MapPin className="mr-2 h-4 w-4" /> City Tour
                  </Button>
                  <Button
                    variant={activeTab === 'multiCity' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('multiCity')}
                    className="flex-1 rounded-full"
                  >
                    <Route className="mr-2 h-4 w-4" /> Multi-City
                  </Button>
                </div>

                {activeTab === 'cityTour' && (
                  <div id="cityTourSection">
                    <h3 className="text-xl font-semibold mb-3 flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary"/> City Tours</h3>
                    <p className="font-medium">Select a Preset City Tour:</p>
                    <div className="mb-3 space-x-2">
                      {Object.entries(presetTours).map(([name, stops]) => (
                        <Button key={name} variant="outline" size="sm" onClick={() => loadPresetTour(stops)}>
                          {name}
                        </Button>
                      ))}
                    </div>

                    <h5 className="mt-4 text-lg font-medium">Create Your Tour</h5>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="tourStop"
                        value={tourStopInput}
                        onChange={(e) => setTourStopInput(e.target.value)}
                        placeholder="Enter tour stop (e.g., Eiffel Tower)"
                        className="flex-grow"
                      />
                      <Button variant="outline" onClick={handleAddStop} className="rounded-full">Add Stop</Button>
                    </div>
                    

                    <h6 className="mt-4 font-medium">Your Tour Stops:</h6>
                    {tourStops.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-2">No stops added yet.</p>
                    ) : (
                      <ul className="list-disc pl-5 mt-2 space-y-1 max-h-48 overflow-y-auto border rounded-md p-3 bg-secondary/30">
                        {tourStops.map((stop) => (
                          <li key={stop.id} className="text-sm flex justify-between items-center">
                            {stop.name}
                            <MapPin className="h-4 w-4 text-primary" />
                          </li>
                        ))}
                      </ul>
                    )}
                    

                    <div className="flex justify-between gap-2 mt-4">
                      <Button variant="outline" onClick={handleUploadClick} className="flex-1 rounded-full">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" style={{ display: 'none' }} />
                      <Button variant="outline" onClick={handleDownloadList} className="flex-1 rounded-full">
                        <DownloadCloud className="mr-2 h-4 w-4" /> Download
                      </Button>
                      <Button variant="destructive" onClick={handleClearList} className="flex-1 rounded-full">
                        <Trash2 className="mr-2 h-4 w-4" /> Clear
                      </Button>
                    </div>
                    <Button onClick={handlePayAndBookTour} className="w-full mt-3 rounded-full bg-primary text-primary-foreground">
                       💳 Pay via UPI & Book Tour
                    </Button>
                  </div>
                )}

                {activeTab === 'cab' && (
                  <div id="bookCabSection">
                    <h4 className="text-lg font-semibold mb-3 flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/> Book a Cab</h4>
                    <form onSubmit={handleCabBookingSubmit} className="space-y-3">
                      <div>
                        <Label htmlFor="pickupLoc">Pickup Location</Label>
                        <Input id="pickupLoc" value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} placeholder="Enter pickup location" required />
                      </div>
                      <div>
                        <Label htmlFor="dropoffLoc">Dropoff Location</Label>
                        <Input id="dropoffLoc" value={dropoffLocation} onChange={e => setDropoffLocation(e.target.value)} placeholder="Enter dropoff location" required />
                      </div>
                      <div>
                        <Label htmlFor="bookingDateTime">Date & Time</Label>
                        <Input id="bookingDateTime" type="datetime-local" value={bookingDateTime} onChange={e => setBookingDateTime(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full rounded-full bg-accent text-accent-foreground" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Book Now & Proceed to Pay
                      </Button>
                    </form>
                  </div>
                )}

                {activeTab === 'multiCity' && (
                  <div id="multiCitySection">
                    <h4 className="text-lg font-semibold mb-3 flex items-center"><Route className="mr-2 h-5 w-5 text-primary"/> Multi-City Tour</h4>
                    <form onSubmit={handleMultiCitySubmit} className="space-y-3">
                      <div>
                        <Label htmlFor="multiCity1">City 1</Label>
                        <Input id="multiCity1" value={city1} onChange={e => setCity1(e.target.value)} placeholder="Enter first city" required />
                      </div>
                      <div>
                        <Label htmlFor="multiCity2">City 2</Label>
                        <Input id="multiCity2" value={city2} onChange={e => setCity2(e.target.value)} placeholder="Enter second city" required />
                      </div>
                      <div>
                        <Label htmlFor="multiCity3">City 3 (Optional)</Label>
                        <Input id="multiCity3" value={city3} onChange={e => setCity3(e.target.value)} placeholder="Enter third city" />
                      </div>
                      <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground" disabled={isLoading}> {/* Changed color to primary */}
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                         Search Multi-City & Proceed to Pay
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Map */}
          <div className="w-full md:w-2/3"> {/* Adjusted width for right panel (map) */}
            <Card className="p-1 md:p-2 shadow-lg h-[520px] md:h-auto">
              <CardContent className="p-0 h-full">
                <div ref={mapContainerRef} className="w-full h-full rounded-md min-h-[500px] bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Map is loading...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
       <footer className="bg-muted py-8 text-center text-muted-foreground mt-12">
        &copy; {new Date().getFullYear()} City Tour Planner. All rights reserved.
      </footer>
    </>
  );
}
