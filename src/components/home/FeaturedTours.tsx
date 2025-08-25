
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Briefcase, Car, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
}

export default function FeaturedTours() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'agent' | 'cabDriver'>('all');

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tour-packages');
        if (!response.ok) throw new Error('Failed to fetch tour packages');
        const data: TourPackage[] = await response.json();
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    if (filter === 'all') {
      return packages;
    }
    return packages.filter(p => p.creatorRole === filter);
  }, [packages, filter]);

  return (
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
              <Card key={pkg.id} className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col border-none rounded-xl">
                <CardHeader className="p-0 relative">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    width={600}
                    height={400}
                    className="w-full h-56 object-cover"
                    data-ai-hint={pkg.aiHint}
                  />
                  <div className="absolute top-4 left-4">
                     <Badge variant={pkg.creatorRole === 'agent' ? 'default' : 'secondary'} className="text-sm">
                        {pkg.creatorRole === 'agent' ? <Briefcase className="mr-1.5 h-3 w-3" /> : <Car className="mr-1.5 h-3 w-3" />}
                        {pkg.creatorRole === 'agent' ? 'Agent Curated' : 'Driver Tour'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{pkg.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1 mb-3">
                    by {pkg.createdBy}
                  </CardDescription>
                  <p className="text-sm text-foreground/80 mb-4">{pkg.description}</p>
                   <Badge variant="outline">{pkg.duration}</Badge>
                </CardContent>
                <CardFooter className="p-6 pt-0 flex justify-between items-center bg-secondary/50">
                   <div>
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-2xl font-bold text-primary">₹{pkg.price.toLocaleString()}</p>
                   </div>
                  <Button asChild>
                    <Link href="#">View Details <ArrowRight className="ml-2 h-4 w-4"/></Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
