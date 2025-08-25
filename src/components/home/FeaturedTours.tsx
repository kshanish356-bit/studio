
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Briefcase, Car, Loader2, ArrowRight, Star, Award, MessageSquare, PenSquare, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface Review {
  user: string;
  comment: string;
  stars: number;
}

interface TourPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  createdBy: string;
  creatorRole: 'agent' | 'cabDriver';
  image: string;
  aiHint: string;
  isFeatured: boolean;
  rating: number;
  reviews: Review[];
  itinerary: string;
}

export default function FeaturedTours() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'agent' | 'cabDriver'>('all');
  const { toast } = useToast();
  
  // State for modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);
  
  // State for review form
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStars, setReviewStars] = useState(5);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tour-packages');
      if (!response.ok) throw new Error('Failed to fetch tour packages');
      const data: TourPackage[] = await response.json();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast({ title: "Error", description: "Could not load tour packages.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPackages();
  }, [toast]);

  const filteredPackages = useMemo(() => {
    if (filter === 'all') {
      return packages;
    }
    return packages.filter(p => p.creatorRole === filter);
  }, [packages, filter]);

  const handleBookNow = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
  };
  
  const confirmBooking = () => {
    if (!selectedPackage) return;
    toast({
      title: "Booking Request Sent!",
      description: `Your request for "${selectedPackage.title}" has been sent to ${selectedPackage.createdBy}.`,
      action: <ToastAction altText="OK">OK</ToastAction>,
    });
    setIsBookingModalOpen(false);
    setSelectedPackage(null);
  };
  
  const handleLeaveReview = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !reviewComment) {
      toast({ title: "Error", description: "Please write a comment.", variant: "destructive" });
      return;
    }
    
    try {
        const response = await fetch(`/api/tour-packages?packageId=${selectedPackage.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: 'Guest User', comment: reviewComment, stars: reviewStars }),
        });
        if (!response.ok) throw new Error('Failed to submit review');
        
        toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
        setIsReviewModalOpen(false);
        setReviewComment('');
        setReviewStars(5);
        fetchPackages(); // Re-fetch packages to show new review and rating
    } catch (error) {
        toast({ title: "Submission Failed", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1 text-yellow-500">
      <Star className="h-4 w-4 fill-current"/>
      <span className="font-bold text-sm">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
      <span className="text-xs text-muted-foreground">({packages.find(p => p.rating === rating)?.reviews.length || 0} reviews)</span>
    </div>
  );


  return (
    <>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Featured Tours by Our Partners</h2>
            <p className="text-muted-foreground mt-2">Unique experiences curated by our trusted travel agents and cab drivers.</p>
          </div>

          <div className="flex justify-center mb-8 gap-2">
              <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All Tours</Button>
              <Button variant={filter === 'agent' ? 'default' : 'outline'} onClick={() => setFilter('agent')}>
                  <Briefcase className="mr-2 h-4 w-4"/> Agent Packages
              </Button>
              <Button variant={filter === 'cabDriver' ? 'default' : 'outline'} onClick={() => setFilter('cabDriver')}>
                  <Car className="mr-2 h-4 w-4"/> Driver City Tours
              </Button>
          </div>

          {isLoading && (
              <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
          )}

          {!isLoading && filteredPackages.length === 0 && (
               <div className="text-center py-10 bg-card rounded-lg shadow">
                <p className="text-muted-foreground">No tours found for this category. Check back soon!</p>
              </div>
          )}

          {!isLoading && filteredPackages.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map(pkg => (
                <Card key={pkg.id} className={`overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col border-2 rounded-xl ${pkg.isFeatured ? 'border-primary' : 'border-transparent'}`}>
                  <CardHeader className="p-0 relative">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      width={600}
                      height={400}
                      className="w-full h-56 object-cover"
                      data-ai-hint={pkg.aiHint}
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       <Badge variant={pkg.creatorRole === 'agent' ? 'default' : 'secondary'} className="text-sm">
                          {pkg.creatorRole === 'agent' ? <Briefcase className="mr-1.5 h-3 w-3" /> : <Car className="mr-1.5 h-3 w-3" />}
                          {pkg.creatorRole === 'agent' ? 'Agent Curated' : 'Driver Tour'}
                      </Badge>
                       {pkg.isFeatured && (
                          <Badge variant="destructive" className="text-sm animate-pulse">
                              <Award className="mr-1.5 h-3 w-3" /> Featured
                          </Badge>
                       )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{pkg.title}</CardTitle>
                      <StarRating rating={pkg.rating} />
                    </div>

                    <CardDescription className="text-sm text-muted-foreground mt-1 mb-3">
                      by {pkg.createdBy}
                    </CardDescription>
                    <p className="text-sm text-foreground/80 mb-4">{pkg.description}</p>
                     <Badge variant="outline">{pkg.duration}</Badge>
                     <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary" onClick={() => handleLeaveReview(pkg)}>
                       <PenSquare className="mr-2 h-4 w-4"/> Leave a review
                     </Button>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex justify-between items-center bg-secondary/50">
                     <div>
                        <p className="text-sm text-muted-foreground">Starting from</p>
                        <p className="text-2xl font-bold text-primary">₹{pkg.price.toLocaleString()}</p>
                     </div>
                    <Button onClick={() => handleBookNow(pkg)}>
                      Book Now <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Confirmation Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              You are about to send a booking request for "{selectedPackage?.title}" to {selectedPackage?.createdBy}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmBooking}><CheckCircle className="mr-2 h-4 w-4"/>Confirm Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Review Submission Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Leave a Review for "{selectedPackage?.title}"</DialogTitle>
                  <DialogDescription>Share your experience to help others and provide feedback to the partner.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReviewSubmit}>
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="review-stars" className="text-right">Rating</Label>
                          <div className="col-span-3 flex items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} className={`h-6 w-6 cursor-pointer ${reviewStars >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} onClick={() => setReviewStars(star)} />
                            ))}
                          </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="review-comment" className="text-right">Comment</Label>
                          <Textarea id="review-comment" value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="col-span-3" required />
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsReviewModalOpen(false)}>Cancel</Button>
                      <Button type="submit">Submit Review</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>

    </>
  );
}

