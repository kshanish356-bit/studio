
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import {
  Car, Star, CalendarDays, Wallet, History, Cog, Mic,
  Search, LocateFixed, Plus, Minus, Volume2, MapPin, FlagCheckered,
  DollarSign, Info, MessageSquare, Phone, X, Bell, Check, Ban, Route, Loader2, PlusCircle, Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { generatePackageDetails } from '@/ai/flows/generate-package-details-flow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

declare global {
  interface Window {
    mappls: any;
  }
}

const MAP_MY_INDIA_API_KEY = process.env.NEXT_PUBLIC_MAP_MY_INDIA_API_KEY;

interface MapplsLatLng {
  lat: number;
  lng: number;
}

interface Ride {
  id: string;
  from: string;
  to:string;
  time: string;
  status: 'Pending' | 'Accepted' | 'Ongoing' | 'Completed' | 'Cancelled';
  fare?: string;
  pickupCoords?: MapplsLatLng;
  dropoffCoords?: MapplsLatLng;
}

// Polyline decoding function
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

const interpolate = (start: number, end: number, step: number, total: number) =>
  start + ((end - start) * (step / total));

export default function CabDriverDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isOnline, setIsOnline] = useState(false);
  const [driverLocation, setDriverLocation] = useState<MapplsLatLng>({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isLoadingRides, setIsLoadingRides] = useState(false);

  // State for creating tour packages
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
  const [packageTitle, setPackageTitle] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageDuration, setPackageDuration] = useState('');
  const [packageItinerary, setPackageItinerary] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [aiImageHint, setAiImageHint] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const routePathRef = useRef<MapplsLatLng[]>([]);


  useEffect(() => {
    if (!authLoading && (!user || user.primaryRole !== 'partner' || user.partnerRole !== 'cabDriver')) {
      toast({ title: "Access Denied", description: "You are not authorized for this page.", variant: "destructive" });
      router.push('/');
    }
  }, [user, authLoading, router, toast]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && (!MAP_MY_INDIA_API_KEY || MAP_MY_INDIA_API_KEY.includes('YOUR_'))) {
        console.warn("Missing MapMyIndia API Key. Some features may not work.");
    }
  }, []);

  const fetchRides = useCallback(async () => {
    setIsLoadingRides(true);
    try {
      const response = await fetch('/api/driver/rides');
      if (!response.ok) throw new Error('Failed to fetch rides');
      let rides: Ride[] = await response.json();
      
      rides = rides.map(ride => ({
        ...ride,
        // Add mock coords if not present for demo
        pickupCoords: ride.pickupCoords || { lat: 28.6304, lng: 77.2177 }, // Connaught Place
        dropoffCoords: ride.dropoffCoords || { lat: 28.5562, lng: 77.1000 } // IGI Airport
      }));

      const pendingRides = rides.filter(r => r.status === 'Pending');
      const acceptedRide = rides.find(r => ['Accepted', 'Ongoing'].includes(r.status));
      
      setAvailableRides(pendingRides);
      setCurrentRide(acceptedRide || null);
    } catch (error) {
      toast({ title: "Error Fetching Rides", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingRides(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (isOnline) {
      fetchRides();
    } else {
      setAvailableRides([]);
      setCurrentRide(null);
    }
  }, [isOnline, fetchRides]);

  // Map Initialization
  useEffect(() => {
    const tryInitMap = () => {
      if (!window.mappls?.Map) {
        setTimeout(tryInitMap, 200); // Retry if script not loaded yet
        return;
      }
      if (mapContainerRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new window.mappls.Map(mapContainerRef.current, {
          center: driverLocation,
          zoom: 12,
        });
        mapInstanceRef.current.addListener('load', () => {
          if (mapInstanceRef.current && !driverMarkerRef.current) {
            driverMarkerRef.current = new window.mappls.Marker({
              map: mapInstanceRef.current,
              position: driverLocation,
              icon_options: { html: '<div style="font-size:24px;">🚕</div>', width: 30, height: 30 }
            });
          }
        });
      }
    };
    
    if (MAP_MY_INDIA_API_KEY && !MAP_MY_INDIA_API_KEY.includes('YOUR_')) {
      tryInitMap();
    }

    return () => {
      if (mapInstanceRef.current?.destroy) mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position on map
  useEffect(() => {
    if (driverMarkerRef.current?.setLngLat && mapInstanceRef.current) {
      driverMarkerRef.current.setLngLat(driverLocation);
    }
  }, [driverLocation]);


  const fetchAndDrawRoute = useCallback(async (start: MapplsLatLng, end: MapplsLatLng) => {
    if (!mapInstanceRef.current || !window.mappls) return;
    try {
      const directionsURL = `https://atlas.mapmyindia.com/api/routemon/vector/driving/${start.lng},${start.lat};${end.lng},${end.lat}?key=${MAP_MY_INDIA_API_KEY}&alternatives=false&overview=full&geometries=polyline&steps=false`;
      const response = await fetch(directionsURL);

      if (!response.ok) throw new Error('Routing API error');
      const data = await response.json();

      if (data.routes && data.routes[0].geometry) {
        const decodedPath = decodeMMIPolyline(data.routes[0].geometry);
        routePathRef.current = decodedPath; // Store the path for animation

        if (routePolylineRef.current) routePolylineRef.current.remove();
        routePolylineRef.current = new window.mappls.Polyline({
          map: mapInstanceRef.current,
          path: decodedPath,
          color: '#007BFF', opacity: 0.7, weight: 5
        });

        const bounds = new window.mappls.Bounds();
        decodedPath.forEach((point: MapplsLatLng) => bounds.extend(point));
        mapInstanceRef.current.fitBounds(bounds, { padding: 50 });

      } else {
        toast({ title: "Route not found", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Routing Error", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast]);
  
  // Animate driver along the route
  const startTripAnimation = useCallback(() => {
    if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
  
    const route = routePathRef.current;
    if (!route || route.length === 0) return;
  
    let step = 0;
    const totalSteps = 200; // Increase for smoother but slower animation
    const duration = 10000; // 10 seconds total animation
    
    animationIntervalRef.current = setInterval(() => {
      if (step > totalSteps) {
        if(animationIntervalRef.current) clearInterval(animationIntervalRef.current);
        // Optionally auto-complete the ride
        if (currentRide) {
             handleRideUpdate(currentRide.id, 'Completed');
        }
        return;
      }
  
      // This logic finds the correct segment of the polyline to interpolate on.
      const progress = step / totalSteps;
      const pathIndex = Math.min(Math.floor(progress * (route.length - 1)), route.length - 2);
      
      const segmentStart = route[pathIndex];
      const segmentEnd = route[pathIndex + 1];

      // Calculate how far along we are in the *current segment*
      const segmentTotalSteps = 1 / (route.length - 1);
      const segmentProgress = (progress - (pathIndex * segmentTotalSteps)) / segmentTotalSteps;

      const lat = interpolate(segmentStart.lat, segmentEnd.lat, segmentProgress, 1);
      const lng = interpolate(segmentStart.lng, segmentEnd.lng, segmentProgress, 1);
      
      setDriverLocation({ lat, lng });
  
      step++;
    }, duration / totalSteps);
  
  }, [currentRide]);


  // Update ride markers and polyline
  useEffect(() => {
    if (mapInstanceRef.current && window.mappls) {
      if (pickupMarkerRef.current) pickupMarkerRef.current.remove();
      if (dropoffMarkerRef.current) dropoffMarkerRef.current.remove();
      if (routePolylineRef.current) routePolylineRef.current.remove();
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      routePathRef.current = [];

      if (currentRide && currentRide.pickupCoords && currentRide.dropoffCoords) {
        // Set initial driver position to pickup point when trip is accepted
        if(currentRide.status === 'Accepted') {
            setDriverLocation(currentRide.pickupCoords);
        }

        pickupMarkerRef.current = new window.mappls.Marker({
          map: mapInstanceRef.current, position: currentRide.pickupCoords,
          icon_options: { html: '<div style="font-size:20px; color:green;">📍</div>', width:24, height:24 },
          title: "Pickup"
        });
        dropoffMarkerRef.current = new window.mappls.Marker({
          map: mapInstanceRef.current, position: currentRide.dropoffCoords,
          icon_options: { html: '<div style="font-size:20px; color:red;">🏁</div>', width:24, height:24 },
          title: "Dropoff"
        });
        
        fetchAndDrawRoute(currentRide.pickupCoords, currentRide.dropoffCoords);

        if (currentRide.status === 'Ongoing') {
          startTripAnimation();
        }

      } else {
        mapInstanceRef.current.setCenter(driverLocation);
        mapInstanceRef.current.setZoom(12);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRide, fetchAndDrawRoute, startTripAnimation]);


  const handleStatusToggle = (checked: boolean) => {
    setIsOnline(checked);
    toast({ title: "Status Updated", description: `You are now ${checked ? 'Online' : 'Offline'}.` });
  };
  
  const handleRideUpdate = async (rideId: string, newStatus: Ride['status']) => {
    try {
      const response = await fetch('/api/driver/rides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId, newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update ride status');
      
      toast({ title: 'Ride Updated', description: `Ride has been ${newStatus}.` });
      fetchRides(); // Re-fetch all rides to update state
    } catch (error) {
       toast({ title: 'Update Failed', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleAiAssist = async () => {
    if (!packageTitle) {
      toast({ title: "Title Required", description: "Please enter a package title to get AI assistance.", variant: "destructive" });
      return;
    }
    if (packageDescription || packageItinerary) {
      toast({ title: "Already Generated", description: "You’ve already generated content. Edit manually or clear to regenerate." });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generatePackageDetails({ title: packageTitle });
      if (result.description) setPackageDescription(result.description);
      if (result.itinerary) setPackageItinerary(result.itinerary);
      if (result.aiImageHint) setAiImageHint(result.aiImageHint);
      toast({ title: "AI Assistance Complete", description: "Content has been generated for your package." });
    } catch (error) {
      toast({ title: "AI Assist Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageTitle || !packageDescription || !packagePrice || !packageDuration || !packageItinerary) {
      toast({ title: "Missing Information", description: "Please fill all fields to create a package.", variant: "destructive" });
      return;
    }
    setIsSubmittingPackage(true);
    
    let imageUrl = 'https://placehold.co/600x400.png';
    const finalAiHint = aiImageHint || packageTitle;
    try {
      toast({ title: "Generating Package Image...", description: "Please wait, this may take a moment." });
      const imageResult = await generateImage({ prompt: finalAiHint });
      if (imageResult.imageUrl) {
        imageUrl = imageResult.imageUrl;
      }
    } catch (error) {
      toast({ title: "AI Image Failed", description: "Could not generate an image, using a placeholder.", variant: "default" });
    }

    try {
      const response = await fetch('/api/tour-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: packageTitle,
          description: packageDescription,
          price: Number(packagePrice),
          duration: packageDuration,
          createdBy: user?.name || 'Driver',
          creatorRole: 'cabDriver',
          itinerary: packageItinerary,
          isFeatured: isFeatured,
          image: imageUrl,
          aiHint: finalAiHint,
        }),
      });
      if (!response.ok) throw new Error('Failed to create package');
      
      toast({ title: "Package Created!", description: "Your new city tour package has been listed." });
      // Reset form
      setPackageTitle('');
      setPackageDescription('');
      setPackagePrice('');
      setPackageDuration('');
      setPackageItinerary('');
      setIsFeatured(false);
      setAiImageHint('');

    } catch (error) {
       toast({ title: "Creation Failed", description: (error as Error).message, variant: 'destructive' });
    } finally {
        setIsSubmittingPackage(false);
    }
  };


  if (authLoading || !user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!MAP_MY_INDIA_API_KEY || MAP_MY_INDIA_API_KEY.includes('YOUR_')) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-8 text-center bg-destructive/10 border-destructive">
          <h2 className="text-2xl font-bold text-destructive">Map API Key Not Configured</h2>
          <p className="mt-2 text-destructive-foreground">
            The interactive map functionality is disabled. Please set the <code>NEXT_PUBLIC_MAP_MY_INDIA_API_KEY</code> in your environment variables to continue.
          </p>
          <Button asChild className="mt-4"><Link href="/">Go Back Home</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Script src={`https://apis.mapmyindia.com/advancedmaps/v1/${MAP_MY_INDIA_API_KEY}/map_sdk.js`} strategy="beforeInteractive" />
      <div className="flex flex-col md:flex-row h-screen max-w-[1920px] mx-auto bg-gray-100 overflow-hidden text-gray-800">
        
        {/* Left Panel - Ride Info */}
        <aside className="w-full md:w-[420px] bg-white p-4 flex flex-col gap-4 shadow-lg z-10 overflow-y-auto">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Driver Status</CardTitle>
              <Switch checked={isOnline} onCheckedChange={handleStatusToggle} />
            </CardHeader>
            <CardContent>
              <p className={`text-lg font-semibold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                You are currently {isOnline ? 'Online' : 'Offline'}
              </p>
            </CardContent>
          </Card>

          {isOnline && currentRide && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Current Ride: {currentRide.status}</CardTitle>
                <CardDescription>From: {currentRide.from}</CardDescription>
                <CardDescription>To: {currentRide.to}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                 <p><strong>Fare:</strong> {currentRide.fare}</p>
                 <div className="flex gap-2">
                    {currentRide.status === 'Accepted' && (
                        <Button onClick={() => handleRideUpdate(currentRide.id, 'Ongoing')} className="flex-1 bg-blue-500 hover:bg-blue-600">Start Trip</Button>
                    )}
                    {currentRide.status === 'Ongoing' && (
                        <Button onClick={() => handleRideUpdate(currentRide.id, 'Completed')} className="flex-1 bg-green-500 hover:bg-green-600">Complete Trip</Button>
                    )}
                    {(currentRide.status === 'Accepted' || currentRide.status === 'Ongoing') && (
                        <Button onClick={() => handleRideUpdate(currentRide.id, 'Cancelled')} variant="destructive" className="flex-1">Cancel</Button>
                    )}
                 </div>
              </CardContent>
            </Card>
          )}

          {isOnline && !currentRide && (
            <Card>
              <CardHeader>
                <CardTitle>Ride Requests</CardTitle>
                <CardDescription>Available rides nearby.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[50vh] overflow-y-auto">
                {isLoadingRides && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin"/></div>}
                {!isLoadingRides && availableRides.length === 0 && <p className="text-muted-foreground text-center">No pending rides found.</p>}
                {availableRides.map(ride => (
                    <div key={ride.id} className="p-3 border rounded-lg bg-secondary/30 space-y-2">
                        <div>
                            <p><strong>From:</strong> {ride.from}</p>
                            <p><strong>To:</strong> {ride.to}</p>
                        </div>
                        <p><strong>Fare:</strong> <Badge variant="secondary">{ride.fare}</Badge></p>
                        <div className="flex gap-2">
                            <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => handleRideUpdate(ride.id, 'Accepted')}>
                                <Check className="mr-2 h-3 w-3" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleRideUpdate(ride.id, 'Cancelled')}>
                                <Ban className="mr-2 h-3 w-3" /> Decline
                            </Button>
                        </div>
                    </div>
                ))}
              </CardContent>
            </Card>
          )}

           <Card>
              <form onSubmit={handleCreatePackage}>
                  <CardHeader>
                      <CardTitle>Create City Tour Package</CardTitle>
                      <CardDescription>Offer a fixed-rate tour package to customers.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1">
                          <AccordionTrigger>Step 1: Basic Details & AI</AccordionTrigger>
                          <AccordionContent className="p-2">
                              <div className="space-y-1">
                                <Label htmlFor="pkg-title-cab">Package Title</Label>
                                <div className="flex gap-2">
                                  <Input id="pkg-title-cab" placeholder="e.g., Delhi Sightseeing Tour" value={packageTitle} onChange={e => setPackageTitle(e.target.value)} />
                                  <Button type="button" variant="outline" onClick={handleAiAssist} disabled={isAiLoading}>
                                      {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-primary" />}
                                  </Button>
                                </div>
                              </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>Step 2: Content</AccordionTrigger>
                          <AccordionContent className="p-2 space-y-4">
                              <div className="space-y-1">
                                <Label htmlFor="pkg-desc-cab">Description</Label>
                                <Textarea id="pkg-desc-cab" placeholder="Describe the tour package..." value={packageDescription} onChange={e => setPackageDescription(e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="pkg-itinerary-cab">Itinerary</Label>
                                <Textarea id="pkg-itinerary-cab" placeholder="AI will generate this, or you can write your own." value={packageItinerary} onChange={e => setPackageItinerary(e.target.value)} />
                              </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger>Step 3: Pricing & Duration</AccordionTrigger>
                          <AccordionContent className="p-2 grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <Label htmlFor="pkg-duration-cab">Duration</Label>
                                  <Input id="pkg-duration-cab" placeholder="e.g., 8 Hours" value={packageDuration} onChange={e => setPackageDuration(e.target.value)} />
                              </div>
                              <div className="space-y-1">
                                  <Label htmlFor="pkg-price-cab">Price (INR)</Label>
                                  <Input id="pkg-price-cab" type="number" placeholder="e.g., 2500" value={packagePrice} onChange={e => setPackagePrice(e.target.value)} />
                              </div>
                          </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-4">
                          <AccordionTrigger>Step 4: Final Touches</AccordionTrigger>
                          <AccordionContent className="p-2 space-y-4">
                              <div className="space-y-1">
                                <Label htmlFor="ai-hint-cab">AI Image Hint (Optional)</Label>
                                <Input id="ai-hint-cab" placeholder="e.g., india gate sunset" value={aiImageHint} onChange={e => setAiImageHint(e.target.value)} />
                              </div>
                              <div className="flex items-center space-x-2">
                                  <Checkbox id="isFeatured-cab" checked={isFeatured} onCheckedChange={(checked) => setIsFeatured(!!checked)} />
                                  <Label htmlFor="isFeatured-cab">Mark as Featured Package</Label>
                              </div>
                          </AccordionContent>
                        </AccordionItem>
                     </Accordion>
                  </CardContent>
                  <CardFooter>
                      <Button type="submit" disabled={isSubmittingPackage}>
                          {isSubmittingPackage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                          Create Package
                      </Button>
                  </CardFooter>
              </form>
          </Card>
        </aside>

        {/* Main Panel - Map */}
        <main className="flex-1 relative bg-gray-200">
           <div ref={mapContainerRef} className="h-full w-full"></div>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button onClick={() => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() + 1)} size="icon"><Plus/></Button>
                <Button onClick={() => mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom() - 1)} size="icon"><Minus/></Button>
                <Button onClick={() => mapInstanceRef.current?.setCenter(driverLocation)} size="icon"><LocateFixed/></Button>
            </div>
        </main>
      </div>
    </>
  );
}

    
