
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; 
import { Route } from 'lucide-react'; // Added Route for icon

export default function CabBookingPage() {
  const { toast } = useToast();
  const router = useRouter(); 
  const [activeTab, setActiveTab] = useState<'cab' | 'tour'>('cab');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [listItem, setListItem] = useState('');
  const [userList, setUserList] = useState<string[]>([]);
  const [city1, setCity1] = useState('');
  const [city2, setCity2] = useState('');
  const [priceRange, setPriceRange] = useState(50);
  const [feedback, setFeedback] = useState('');
  const [savedRides, setSavedRides] = useState<string[]>(['Sample Ride 1: Home to Work', 'Sample Ride 2: Airport to Hotel']);
  const [newRide, setNewRide] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).mapboxgl) {
      (window as any).mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Replace with your actual token
      console.log("Mapbox GL JS loaded, map can be initialized.");
      toast({ title: "Map Placeholder", description: "Mapbox would be initialized here. Replace with your token." });
    }
  }, [toast]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({ title: "Booking Submitted", description: `Booking from ${pickupLocation} to ${dropoffLocation}. Proceeding to payment.` });
    setTimeout(() => {
      setIsLoading(false);
      router.push('/payment'); 
    }, 1500); 
  };

  const handleListFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listItem.trim()) {
      setUserList([...userList, listItem.trim()]);
      setListItem('');
      toast({ title: "Item Added", description: `${listItem.trim()} added to your list.` });
    }
  };

  const addSavedRide = () => {
    if (newRide.trim()) {
      setSavedRides([...savedRides, newRide.trim()]);
      setNewRide('');
      toast({ title: "Ride Saved", description: `${newRide.trim()} added to saved rides.` });
    }
  };

  const handleFeedbackSubmit = () => {
    toast({ title: "Feedback Submitted", description: "Thank you for your feedback! (Placeholder)" });
    setFeedback('');
  };
  
  const toggleDarkMode = () => {
    toast({ title: "Theme Toggle", description: "Dark mode toggle functionality would be implemented here." });
  };

  const handleMultiCitySubmit = () => {
    if (!city1.trim() || !city2.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both City 1 and City 2 for multi-city booking.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    toast({
      title: 'Multi-City Search Submitted',
      description: `Searching for routes: ${city1} to ${city2}. Proceeding to payment.`,
    });
    setTimeout(() => {
      setIsLoading(false);
      router.push('/payment');
    }, 1500);
  };

  return (
    <>
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v2.12.0/mapbox-gl.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Mapbox GL JS script loaded.');
        }}
      />
      <nav style={{ margin: '16px 0 0 16px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'hsl(var(--primary))', fontWeight: 'bold', fontSize: '1.1em' }}>
          &larr; Home
        </Link>
      </nav>

      {isLoading && (
        <div id="loading-spinner" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ 
            border: '8px solid #f3f3f3', borderRadius: '50%', borderTop: '8px solid hsl(var(--primary))', 
            width: '60px', height: '60px', animation: 'spin 2s linear infinite' 
          }} />
          <div style={{ color: 'white', marginTop: '20px', fontSize: '1.2em' }}>Loading, please wait...</div>
          <style jsx global>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <header className="text-center py-4">
        <h1 className="text-3xl font-bold">Cab Booking & City Tours</h1>
        <Button onClick={toggleDarkMode} variant="outline" className="mt-2">Toggle Dark Mode</Button>
      </header>

      <main className="container mx-auto px-4 py-8" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left Panel */}
        <section className="panel shadow-lg p-6 rounded-lg bg-card" style={{ flex: '1', minWidth: '350px' }}>
          <section className="toggle-group mb-6 flex gap-2">
            <Button type="button" onClick={() => setActiveTab('cab')} variant={activeTab === 'cab' ? 'default' : 'outline'}>🚖 Book Cab</Button>
            <Button type="button" onClick={() => setActiveTab('tour')} variant={activeTab === 'tour' ? 'default' : 'outline'}>🏙️ City Tour</Button>
          </section>

          {activeTab === 'cab' && (
            <section id="cabFields" className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">Book a Cab</h2>
              <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="pickup">Pickup Location:</Label>
                  <Input type="text" id="pickup" name="pickup" placeholder="Enter pickup location" required value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="dropoff">Dropoff Location:</Label>
                  <Input type="text" id="dropoff" name="dropoff" placeholder="Enter dropoff location" required value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Book Now & Proceed to Pay</Button>
              </form>
            </section>
          )}

          {activeTab === 'tour' && (
            <section id="tourFields" className="mb-6">
              <h2 className="text-2xl font-semibold mb-3">City Tours</h2>
              <Label htmlFor="tour">Select a City Tour:</Label>
              <ul id="tourList" className="list-disc pl-5 mt-2 space-y-1">
                <li>City Tour 1</li>
                <li>City Tour 2</li>
                <li>City Tour 3</li>
              </ul>
            </section>
          )}

          <section id="userListCreation" className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Create Your List</h2>
            <form id="listForm" onSubmit={handleListFormSubmit} className="flex gap-2 mb-3">
              <Input type="text" id="listItem" placeholder="Enter item" required value={listItem} onChange={(e) => setListItem(e.target.value)} className="flex-grow"/>
              <Button type="submit">Add</Button>
            </form>
            <h3 className="text-xl font-medium">Your List</h3>
            <ol id="userList" className="list-decimal pl-5 mt-2 space-y-1">
              {userList.map((item, index) => <li key={index}>{item}</li>)}
            </ol>
            <Button type="button" id="payUPIButton" className="mt-3 w-full bg-accent text-accent-foreground" onClick={() => router.push('/payment')}>Pay via UPI & Book</Button>
            <div id="message" className="message mt-2"></div>
          </section>

          <section className="multi-city-section mb-6">
            <div className="multi-city-container">
              <h2 className="text-2xl font-semibold mb-3">Multi-City Booking</h2>
              <div className="city-pair mb-2 space-y-2">
                <Label htmlFor="city1">City 1:</Label>
                <Input type="text" id="city1" name="city1" placeholder="Enter first city" value={city1} onChange={(e) => setCity1(e.target.value)} />
              </div>
              <div className="city-pair space-y-2">
                <Label htmlFor="city2">City 2:</Label>
                <Input type="text" id="city2" name="city2" placeholder="Enter second city" value={city2} onChange={(e) => setCity2(e.target.value)} />
              </div>
              <Button onClick={handleMultiCitySubmit} className="mt-4 w-full">
                <Route className="mr-2 h-4 w-4" /> Search Multi-City & Proceed to Pay
              </Button>
            </div>
          </section>

          <section className="filter-group mb-6">
            <Label htmlFor="price-range">Price Range:</Label>
            <input type="range" id="price-range" name="price-range" min="0" max="100" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full"/>
            <p className="text-sm">Estimated Price: <span id="price-value">${priceRange}</span></p>
          </section>

          <section className="promo-code-section mb-6">
            <h2 className="text-2xl font-semibold mb-3">Promo Code</h2>
            <Input type="text" id="promo-code-display" name="promo-code-display" placeholder="Enter promo code" disabled />
            <Button id="apply-promo-display" disabled className="mt-2">Apply Promo</Button>
            <small style={{ color: 'gray' }} className="block mt-1">Use the promo code field in the booking form if applicable.</small>
          </section>

          <section id="price-estimate" className="mb-6">
            <h3 className="text-xl font-semibold">Price Estimate</h3>
            <p>Your estimated fare will appear here.</p>
          </section>

          <section id="booking-history" style={{ marginTop: '32px' }} className="border-t pt-6">
             <h3 className="text-xl font-semibold mb-2">Booking History</h3>
             <p className="text-muted-foreground">Booking history will be shown here.</p>
          </section>
        </section>

        {/* Right Panel (Map) */}
        <section className="map-container" style={{ flex: '1', minWidth: '350px' }}>
          <div id="map" style={{ height: '500px', width: '100%', borderRadius: '8px', background: '#e9ecef', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ padding: '15px', textAlign: 'center', color: '#6c757d' }}>Mapbox map will be initialized here.</p>
          </div>
        </section>
      </main>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <section className="loyalty-program p-6 rounded-lg bg-card shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Loyalty Program</h2>
          <p className="mb-3">Join our loyalty program for exclusive benefits.</p>
          <Button id="join-loyalty" onClick={() => toast({title: "Loyalty Program", description: "Joined loyalty program! (Placeholder)"})}>Join Now</Button>
        </section>

        <section className="ride-history p-6 rounded-lg bg-card shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Ride History</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ride 1 - Details</li>
            <li>Ride 2 - Details</li>
            <li>Ride 3 - Details</li>
          </ul>
        </section>

        <section className="feedback-section p-6 rounded-lg bg-card shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Feedback</h2>
          <Textarea id="feedback" name="feedback" rows={4} placeholder="Your feedback..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          <Button id="submit-feedback" onClick={handleFeedbackSubmit} className="mt-3">Submit Feedback</Button>
        </section>

        <section className="contact-us p-6 rounded-lg bg-card shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p>Email: support@cabbooking.com</p>
          <p>Phone: +123456789</p>
        </section>

        <section id="saved-rides-section" className="p-6 rounded-lg bg-card shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">Saved Rides</h2>
          <div id="saved-rides" className="mb-3 space-y-1">
            {savedRides.map((ride, index) => <p key={index}>{ride}</p>)}
          </div>
          <div className="flex gap-2">
            <Input type="text" id="new-ride" placeholder="Enter ride details" value={newRide} onChange={(e) => setNewRide(e.target.value)} className="flex-grow"/>
            <Button onClick={addSavedRide}>Add Ride</Button>
          </div>
        </section>
      </div>

      <footer className="text-center py-6 mt-8 border-t">
        <p>&copy; {new Date().getFullYear()} Cab Booking. All rights reserved.</p>
        <div className="social-media space-x-3 mt-2">
          <Link href="#" className="text-primary hover:underline">Facebook</Link>
          <Link href="#" className="text-primary hover:underline">Twitter</Link>
          <Link href="#" className="text-primary hover:underline">Instagram</Link>
        </div>
      </footer>
    </>
  );
}
