
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
import { UploadCloud, DownloadCloud, Trash2, Route, MapPin, Building, Navigation, Edit3, Loader2 } from 'lucide-react';

// Declare mappls for MapmyIndia
declare global {
  interface Window {
    mappls: any;
  }
}

type ActiveTab = 'cityTour' | 'cab' | 'multiCity';

interface TourStop {
  id: string; // Unique ID for React key
  name: string;
  coords?: [number, number]; // [latitude, longitude]
}

interface MapplsLatLng {
  lat: number;
  lng: number;
}

const MAP_MY_INDIA_API_KEY = 'b8558b6a01dd83cc4de527d1a5948af8'; // Extracted from the script URL

// Polyline decoding function (standard algorithm)
function decodeMMIPolyline(encoded: string): MapplsLatLng[] {
  let points: MapplsLatLng[] = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
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
  const [pickupCoordsCab, setPickupCoordsCab] = useState<MapplsLatLng | null>(null);
  const [dropoffCoordsCab, setDropoffCoordsCab] = useState<MapplsLatLng | null>(null);
  const [isCabRouteLoading, setIsCabRouteLoading] = useState(false);

  // Multi-City State
  const [city1, setCity1] = useState('');
  const [city2, setCity2] = useState('');
  const [city3, setCity3] = useState('');

  const [isLoading, setIsLoading] = useState(false); // General loading state

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null); // For MapmyIndia map instance
  const cityTourMarkersRef = useRef<any[]>([]);
  const pickupMarkerRefCab = useRef<any>(null);
  const dropoffMarkerRefCab = useRef<any>(null);
  const cabRoutePolylineRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window.mappls !== 'undefined' && mapContainerRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.mappls.Map(mapContainerRef.current, {
        center: [20.5937, 78.9629], // Default center (India - Lat, Lon)
        zoom: 4,
      });
      
      mapInstanceRef.current.addListener('load', () => {
        // console.log("MapmyIndia Map loaded successfully.");
      });

      return () => {
        if (mapInstanceRef.current && typeof mapInstanceRef.current.destroy === 'function') {
            mapInstanceRef.current.destroy();
            mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  const addMapMarkerCityTour = useCallback(async (stopName: string, stopId: string) => {
    if (!mapInstanceRef.current || !window.mappls) return;

    try {
      const geocodeURL = `https://atlas.mapmyindia.com/api/places/geocode?address=${encodeURIComponent(stopName)}&key=${MAP_MY_INDIA_API_KEY}`;
      const response = await fetch(geocodeURL);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Geocoding API error for ${stopName}: ${response.status} ${response.statusText}`);
        toast({ title: "Geocoding Error", description: `Failed to geocode: ${stopName}. Server: ${response.status}. ${errorText.substring(0,100)}`, variant: "destructive" });
        return;
      }

      const data = await response.json();
      const bestResult = data.copResults && data.copResults.length > 0 ? data.copResults[0] : null;

      if (bestResult && bestResult.latitude && bestResult.longitude) {
        const coordinates: MapplsLatLng = { lat: parseFloat(bestResult.latitude), lng: parseFloat(bestResult.longitude) };
        const marker = new window.mappls.Marker({
          map: mapInstanceRef.current,
          position: coordinates,
          title: stopName
        });
        cityTourMarkersRef.current.push(marker);
        mapInstanceRef.current.setCenter(coordinates);
        mapInstanceRef.current.setZoom(12);
        
        setTourStops(prevStops => prevStops.map(s => s.id === stopId ? {...s, coords: [coordinates.lat, coordinates.lng]} : s));

      } else {
        toast({ title: "Location not found", description: `Could not find coordinates for: ${stopName}`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding city tour marker (MapmyIndia):", error);
      toast({ title: "Geocoding Error", description: `Failed to geocode: ${stopName}. ${(error as Error).message}`, variant: "destructive" });
    }
  }, [toast]);

  const geocodeAndSetMarkerCab = useCallback(async (address: string, type: 'pickup' | 'dropoff'): Promise<MapplsLatLng | null> => {
    if (!mapInstanceRef.current || !window.mappls || !address.trim()) return null;
    
    let wasLoading = isCabRouteLoading;
    if(type === 'pickup' && !pickupLocation) wasLoading = false; // prevent premature loader if only pickup is geocoding
    if(type === 'dropoff' && !dropoffLocation) wasLoading = false;

    if(!wasLoading) setIsCabRouteLoading(true);

    try {
      const geocodeURL = `https://atlas.mapmyindia.com/api/places/geocode?address=${encodeURIComponent(address)}&key=${MAP_MY_INDIA_API_KEY}`;
      const response = await fetch(geocodeURL);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Geocoding API error for ${address} (${type}): ${response.status} ${response.statusText}`);
        toast({ title: "Geocoding Error", description: `Failed to geocode: ${address}. Server: ${response.status}. ${errorText.substring(0,100)}`, variant: "destructive" });
        if (type === 'pickup') setPickupCoordsCab(null); else setDropoffCoordsCab(null);
        return null;
      }

      const data = await response.json();
      const bestResult = data.copResults && data.copResults.length > 0 ? data.copResults[0] : null;

      if (bestResult && bestResult.latitude && bestResult.longitude) {
        const coordinates: MapplsLatLng = { lat: parseFloat(bestResult.latitude), lng: parseFloat(bestResult.longitude) };
        
        const existingMarkerRef = type === 'pickup' ? pickupMarkerRefCab : dropoffMarkerRefCab;
        if (existingMarkerRef.current) {
          existingMarkerRef.current.remove();
        }
        
        const newMarker = new window.mappls.Marker({
          map: mapInstanceRef.current,
          position: coordinates,
          title: address,
        });
        
        if (type === 'pickup') {
          pickupMarkerRefCab.current = newMarker;
          setPickupCoordsCab(coordinates);
        } else {
          dropoffMarkerRefCab.current = newMarker;
          setDropoffCoordsCab(coordinates);
        }
        mapInstanceRef.current.setCenter(coordinates);
        mapInstanceRef.current.setZoom(12);
        return coordinates;
      } else {
        toast({ title: "Location not found", description: `Could not find coordinates for: ${address}`, variant: "destructive" });
        if (type === 'pickup') setPickupCoordsCab(null); else setDropoffCoordsCab(null);
        return null;
      }
    } catch (error) {
      console.error(`Error geocoding ${type} for cab (MapmyIndia):`, error);
      toast({ title: "Geocoding Error", description: `Failed to geocode: ${address}. ${(error as Error).message}`, variant: "destructive" });
      if (type === 'pickup') setPickupCoordsCab(null); else setDropoffCoordsCab(null);
      return null;
    } finally {
       if (!wasLoading) { // Only stop loading if this call started it
         if ((type === 'pickup' && dropoffLocation.trim() === '' ) || type === 'dropoff') { // if it's pickup and no dropoff, or it is dropoff
            setIsCabRouteLoading(false);
         }
       }
    }
  }, [toast, pickupLocation, dropoffLocation, isCabRouteLoading]);

  const fetchAndDrawCabRoute = useCallback(async (start: MapplsLatLng, end: MapplsLatLng) => {
    if (!mapInstanceRef.current || !window.mappls) return;
    setIsCabRouteLoading(true);
    try {
      const directionsURL = `https://atlas.mapmyindia.com/api/routemon/vector/driving/${start.lng},${start.lat};${end.lng},${end.lat}?key=${MAP_MY_INDIA_API_KEY}&alternatives=false&overview=full&geometries=polyline&steps=false`;
      const response = await fetch(directionsURL);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Routing API error: ${response.status} ${response.statusText}`);
        toast({ title: "Routing Error", description: `Failed to fetch route. Server: ${response.status}. ${errorText.substring(0,100)}`, variant: "destructive" });
        return;
      }
      
      const data = await response.json();

      if (data.routes && data.routes.length > 0 && data.routes[0].geometry) {
        const encodedPolyline = data.routes[0].geometry;
        const decodedPath = decodeMMIPolyline(encodedPolyline);

        if (cabRoutePolylineRef.current) {
          cabRoutePolylineRef.current.remove();
        }

        cabRoutePolylineRef.current = new window.mappls.Polyline({
          map: mapInstanceRef.current,
          path: decodedPath,
          color: '#007BFF', 
          opacity: 0.8,
          weight: 5
        });
        
        const bounds = new window.mappls.Bounds();
        decodedPath.forEach((point: MapplsLatLng) => bounds.extend(point));
        mapInstanceRef.current.fitBounds(bounds, { padding: 50 });

      } else {
        toast({ title: "Route not found", description: "Could not find a route between the locations.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching cab route (MapmyIndia):", error);
      toast({ title: "Routing Error", description: `Failed to fetch route. ${(error as Error).message}`, variant: "destructive" });
    } finally {
      setIsCabRouteLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (pickupCoordsCab && dropoffCoordsCab) {
      fetchAndDrawCabRoute(pickupCoordsCab, dropoffCoordsCab);
    }
  }, [pickupCoordsCab, dropoffCoordsCab, fetchAndDrawCabRoute]);


  const handleAddStop = () => {
    const stopName = tourStopInput.trim();
    if (stopName) {
      const newStopId = Date.now().toString();
      setTourStops(prevStops => [...prevStops, { id: newStopId, name: stopName }]);
      addMapMarkerCityTour(stopName, newStopId);
      setTourStopInput('');
    } else {
      toast({ title: "Invalid Stop", description: "Please enter a valid tour stop.", variant: "destructive" });
    }
  };

  const loadPresetTour = (stops: string[]) => {
    cityTourMarkersRef.current.forEach(marker => marker.remove());
    cityTourMarkersRef.current = [];
    const newTourStops = stops.map(s => ({ id: Date.now().toString() + s + Math.random(), name: s }));
    setTourStops(newTourStops);
    newTourStops.forEach(stop => addMapMarkerCityTour(stop.name, stop.id));
    toast({ title: "Preset Tour Loaded", description: `${stops.length} stops added to your tour.` });
  };
  
  const handleClearList = () => {
    setTourStops([]);
    cityTourMarkersRef.current.forEach(marker => marker.remove());
    cityTourMarkersRef.current = [];
    if (cabRoutePolylineRef.current) {
        cabRoutePolylineRef.current.remove();
        cabRoutePolylineRef.current = null;
    }
    if(pickupMarkerRefCab.current) {
      pickupMarkerRefCab.current.remove();
      pickupMarkerRefCab.current = null;
    }
    if(dropoffMarkerRefCab.current) {
      dropoffMarkerRefCab.current.remove();
      dropoffMarkerRefCab.current = null;
    }
    setPickupCoordsCab(null);
    setDropoffCoordsCab(null);
    setPickupLocation('');
    setDropoffLocation('');
    toast({ title: "Map and Lists Cleared", description: "All stops and routes have been removed." });
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
            cityTourMarkersRef.current.forEach(marker => marker.remove());
            cityTourMarkersRef.current = [];
            const newTourStops = uploadedStopNames.map(name => ({ id: Date.now().toString() + name + Math.random(), name }));
            setTourStops(newTourStops);
            newTourStops.forEach(stop => addMapMarkerCityTour(stop.name, stop.id));
            toast({ title: "Tour Uploaded", description: "Tour stops have been loaded from file." });
          } else {
            throw new Error("Invalid file format. Expected an array of strings.");
          }
        } catch (err: any) {
          toast({ title: "Upload Error", description: err.message || "Invalid JSON file or format.", variant: "destructive" });
          console.error(err);
        }
      };
      reader.readAsText(file);
      event.target.value = ''; 
    }
  };
  
  const handleCabBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!pickupLocation || !dropoffLocation || !bookingDateTime) {
      toast({ title: "Missing Information", description: "Please fill all cab booking fields.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    let currentPickupCoords = pickupCoordsCab;
    let currentDropoffCoords = dropoffCoordsCab;

    if (!currentPickupCoords && pickupLocation) {
      currentPickupCoords = await geocodeAndSetMarkerCab(pickupLocation, 'pickup');
    }
    if (!currentDropoffCoords && dropoffLocation) {
      currentDropoffCoords = await geocodeAndSetMarkerCab(dropoffLocation, 'dropoff');
    }

    if (!currentPickupCoords || !currentDropoffCoords) {
      toast({ title: "Location Error", description: "Please ensure both pickup and dropoff locations are geocoded successfully.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    
    toast({ title: "Cab Booking Submitted", description: `Booking from ${pickupLocation} to ${dropoffLocation} for ${bookingDateTime}. Proceeding to payment.` });
    // Simulate API call or further processing
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
    setIsLoading(true);
    toast({ title: "Booking Tour", description: "Proceeding to payment for your custom tour." });
    setTimeout(() => {
      setIsLoading(false);
      router.push('/payment');
    }, 1500);
  };

  const presetTours = {
    "Delhi Darshan": ['India Gate, Delhi', 'Red Fort, Delhi', 'Qutub Minar, Delhi'],
    "Mumbai Magic": ['Gateway of India, Mumbai', 'Marine Drive, Mumbai', 'Elephanta Caves, Mumbai'],
    "Agra Wonders": ['Taj Mahal, Agra', 'Agra Fort, Agra', 'Fatehpur Sikri, Agra'],
  };

  return (
    <>
      <Script
        src={`https://apis.mapmyindia.com/advancedmaps/v1/${MAP_MY_INDIA_API_KEY}/map_sdk.js`}
        strategy="afterInteractive"
        onLoad={() => {
          // console.log('MapmyIndia SDK script loaded.');
        }}
      />
      <nav className="p-4 container mx-auto">
        <Link href="/" className="text-primary hover:text-primary/80 font-bold text-lg inline-flex items-center">
          <Navigation className="mr-2 h-5 w-5 transform rotate-[-90deg]" /> Home
        </Link>
      </nav>

      {(isLoading || isCabRouteLoading) && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-[1000]">
          <div className="w-16 h-16 border-8 border-muted border-t-primary rounded-full animate-spin" />
          <div className="text-white mt-4 text-lg">Loading, please wait...</div>
        </div>
      )}

      <div className="container mx-auto mt-4 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel */}
          <div className="w-full md:w-1/3">
            <Card>
              <CardContent className="p-2 md:p-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={activeTab === 'cab' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('cab')}
                    className="flex-1 rounded-full min-w-0"
                  >
                    <Building className="mr-2 h-4 w-4" /> Book Cab
                  </Button>
                  <Button
                    variant={activeTab === 'cityTour' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('cityTour')}
                    className="flex-1 rounded-full min-w-0"
                  >
                    <MapPin className="mr-2 h-4 w-4" /> City Tour
                  </Button>
                  <Button
                    variant={activeTab === 'multiCity' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('multiCity')}
                    className="flex-1 rounded-full min-w-0"
                  >
                    <Route className="mr-2 h-4 w-4" /> Multi-City
                  </Button>
                </div>

                {activeTab === 'cityTour' && (
                  <div id="cityTourSection">
                    <h3 className="text-xl font-semibold mb-3 flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary"/> City Tours</h3>
                    <p className="font-medium">Select a Preset City Tour:</p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {Object.entries(presetTours).map(([name, stops]) => (
                        <Button key={name} variant="outline" size="sm" onClick={() => loadPresetTour(stops)} className="rounded-full">
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
                        placeholder="Enter tour stop (e.g., India Gate)"
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
                      <Button variant="outline" onClick={handleUploadClick} className="flex-1 rounded-full min-w-0">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" style={{ display: 'none' }} />
                      <Button variant="outline" onClick={handleDownloadList} className="flex-1 rounded-full min-w-0">
                        <DownloadCloud className="mr-2 h-4 w-4" /> Download
                      </Button>
                      <Button variant="destructive" onClick={handleClearList} className="flex-1 rounded-full min-w-0">
                        <Trash2 className="mr-2 h-4 w-4" /> Clear All
                      </Button>
                    </div>
                    <Button onClick={handlePayAndBookTour} className="w-full mt-3 rounded-full bg-primary text-primary-foreground" disabled={isLoading && activeTab === 'cityTour'}>
                       {(isLoading && activeTab === 'cityTour') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "💳"} Pay via UPI & Book Tour
                    </Button>
                  </div>
                )}

                {activeTab === 'cab' && (
                  <div id="bookCabSection">
                    <h4 className="text-lg font-semibold mb-3 flex items-center"><Building className="mr-2 h-5 w-5 text-primary"/> Book a Cab</h4>
                    <form onSubmit={handleCabBookingSubmit} className="space-y-3">
                      <div>
                        <Label htmlFor="pickupLoc">Pickup Location</Label>
                        <Input 
                          id="pickupLoc" 
                          value={pickupLocation} 
                          onChange={e => { setPickupLocation(e.target.value); setPickupCoordsCab(null); }}
                          onBlur={() => pickupLocation.trim() && geocodeAndSetMarkerCab(pickupLocation, 'pickup')}
                          placeholder="Enter pickup location" 
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="dropoffLoc">Dropoff Location</Label>
                        <Input 
                          id="dropoffLoc" 
                          value={dropoffLocation} 
                          onChange={e => { setDropoffLocation(e.target.value); setDropoffCoordsCab(null);}}
                          onBlur={() => dropoffLocation.trim() && geocodeAndSetMarkerCab(dropoffLocation, 'dropoff')}
                          placeholder="Enter dropoff location" 
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="bookingDateTime">Date & Time</Label>
                        <Input id="bookingDateTime" type="datetime-local" value={bookingDateTime} onChange={e => setBookingDateTime(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full rounded-full bg-accent text-accent-foreground" disabled={isLoading && activeTab === 'cab' || isCabRouteLoading}>
                        {(isLoading && activeTab === 'cab' || isCabRouteLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Book Now & Proceed to Pay
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
                      <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground" disabled={isLoading && activeTab === 'multiCity'}>
                         {(isLoading && activeTab === 'multiCity') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                         Search Multi-City & Proceed to Pay
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Map */}
          <div className="w-full md:w-2/3">
            <Card className="p-1 md:p-2 shadow-lg h-[520px] md:h-auto">
              <CardContent className="p-0 h-full">
                <div ref={mapContainerRef} className="w-full h-full rounded-md min-h-[500px] bg-muted flex items-center justify-center">
                  {typeof window !== 'undefined' && !window.mappls && <p className="text-muted-foreground">Initializing map...</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
