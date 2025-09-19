
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Search, MapPin, Star, ArrowRight, Sun, Mountain, Waves, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Package {
  id: number;
  title: string;
  location: string;
  duration: string;
  price: number;
  image: string;
  aiHint: string;
  category: string;
  rating: number;
  includes: string[];
}

const initialPackages: Package[] = [
  {
    id: 1, title: 'Magical Kerala Backwaters', location: 'Kerala, India', duration: '6 Days / 5 Nights', price: 45000,
    image: 'https://placehold.co/600x400.png', aiHint: 'kerala backwaters', category: 'beach',
    rating: 4.8, includes: ['Flights', 'Hotels', 'Sightseeing', 'Transfers']
  },
  {
    id: 2, title: 'Royal Rajasthan Desert Safari', location: 'Rajasthan, India', duration: '7 Days / 6 Nights', price: 60000,
    image: 'https://placehold.co/600x400.png', aiHint: 'rajasthan desert', category: 'cultural',
    rating: 4.9, includes: ['Hotels', 'Safari', 'Meals', 'Guide']
  },
  {
    id: 3, title: 'Himalayan Adventure in Ladakh', location: 'Ladakh, India', duration: '8 Days / 7 Nights', price: 75000,
    image: 'https://placehold.co/600x400.png', aiHint: 'ladakh mountains', category: 'adventure',
    rating: 4.7, includes: ['Hotels', 'Trekking', 'Permits', 'Meals']
  },
  {
    id: 4, title: 'Enchanting Andaman Islands', location: 'Andaman & Nicobar, India', duration: '5 Days / 4 Nights', price: 55000,
    image: 'https://placehold.co/600x400.png', aiHint: 'andaman beach', category: 'beach',
    rating: 4.6, includes: ['Flights', 'Resort', 'Scuba Diving', 'Ferry']
  }
];

const categoryFilters = [
  { id: 'all', label: 'All', icon: MapPin },
  { id: 'beach', label: 'Beaches', icon: Waves },
  { id: 'mountain', label: 'Mountains', icon: Mountain },
  { id: 'cultural', label: 'Cultural', icon: Star },
  { id: 'adventure', label: 'Adventure', icon: Sun },
];


interface GeneratedImageState {
  [packageId: number]: {
    url: string | null;
    loading: boolean;
  };
}

export default function HolidayPackagesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [packages, setPackages] = useState(initialPackages);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageState>({});

  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleGenerateImages = async () => {
    setGeneratedImages(prev => {
        const newState: GeneratedImageState = {};
        packages.forEach(pkg => {
            newState[pkg.id] = { url: prev[pkg.id]?.url || null, loading: true };
        });
        return newState;
    });

    const imagePromises = packages.map(async (pkg) => {
        try {
            const result = await generateImage({ prompt: pkg.aiHint });
            if (result.imageUrl) {
                return { id: pkg.id, url: result.imageUrl };
            }
        } catch (error) {
            console.error(`Failed to generate image for ${pkg.title}:`, error);
        }
        return { id: pkg.id, url: null }; // Return null on error
    });

    const results = await Promise.all(imagePromises);

    setGeneratedImages(prev => {
        const newState = { ...prev };
        results.forEach(res => {
            if (res) {
                newState[res.id] = { url: res.url, loading: false };
            }
        });
        return newState;
    });
  };

  const handleBookNow = (pkg: Package) => {
    if (!isAuthenticated) {
        setIsAuthModalOpen(true);
        return;
    }
    toast({ title: "Booking Initiated", description: `Proceeding to payment for ${pkg.title}.` });
    router.push('/payment');
  }

  return (
    <div className="bg-secondary/30 min-h-screen">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <section 
        className="py-20 md:py-32 text-white relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')"}}
        data-ai-hint="beautiful landscape"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">Find Your Dream Vacation</h1>
          <p className="text-lg md:text-xl mb-8 drop-shadow-md">Explore curated packages for every type of traveler.</p>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white/20 backdrop-blur-md p-2 rounded-full">
              <Input placeholder="Search destination..." className="md:col-span-2 bg-transparent border-none text-white placeholder:text-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base" />
              <Button size="lg" className="w-full h-12 text-base rounded-full bg-primary hover:bg-primary/90"><Search className="mr-2 h-5 w-5"/>Search</Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
         <div className="text-center mb-12">
           <Button onClick={handleGenerateImages} size="lg" variant="outline">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Generate AI Images for Packages
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Click to replace placeholder images with unique AI-generated visuals.</p>
         </div>

        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 bg-background p-2 rounded-full shadow-md">
            {categoryFilters.map(filter => (
              <Button 
                key={filter.id} 
                variant={activeCategory === filter.id ? "default" : "ghost"}
                onClick={() => setActiveCategory(filter.id)}
                className="rounded-full px-4 py-2 h-auto"
              >
                <filter.icon className="mr-2 h-5 w-5" /> {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map(pkg => (
            <Card key={pkg.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col border-none rounded-xl">
              <CardHeader className="p-0 relative">
                {generatedImages[pkg.id]?.loading ? (
                    <Skeleton className="w-full h-56" />
                ) : (
                    <Image
                      src={generatedImages[pkg.id]?.url || pkg.image}
                      alt={pkg.title}
                      width={600}
                      height={400}
                      className="w-full h-56 object-cover"
                      data-ai-hint={pkg.aiHint}
                    />
                )}
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive" className="text-sm">{pkg.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{pkg.title}</CardTitle>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold">
                    <Star className="h-4 w-4 fill-current"/> {pkg.rating}
                  </div>
                </div>
                <CardDescription className="flex items-center text-sm mb-4"><MapPin className="h-4 w-4 mr-1"/>{pkg.location}</CardDescription>
                <div className="flex flex-wrap gap-2">
                  {pkg.includes.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}
                </div>
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
      </main>
    </div>
  );
}

    