
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

const offers = [
  {
    title: 'Luxury Hotel Package',
    description: '5 nights with breakfast + airport transfer',
    originalPrice: '₹1,20,000',
    discountedPrice: '₹84,000',
    badge: '30% OFF',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'luxury hotel'
  },
  {
    title: 'Beach Resort Getaway',
    description: 'All-inclusive 7-day vacation for two',
    originalPrice: '₹1,50,000',
    discountedPrice: '₹99,900',
    badge: 'FLASH SALE',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'beach resort'
  },
];

export default function SpecialOffers() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Special Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <Card key={offer.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col sm:flex-row">
              <div className="relative sm:w-2/5">
                <Image
                  src={offer.image}
                  alt={offer.title}
                  width={800}
                  height={600}
                  className="w-full h-64 sm:h-full object-cover"
                  data-ai-hint={offer.aiHint}
                />
                <Badge variant="destructive" className="absolute top-4 left-4 text-sm px-3 py-1">
                  {offer.badge}
                </Badge>
              </div>
              <div className="flex flex-col sm:w-3/5">
                <CardHeader className="p-6">
                  <CardTitle className="text-xl">{offer.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-grow">
                  <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-gray-500 line-through">{offer.originalPrice}</span>
                    <span className="text-2xl font-bold text-accent">{offer.discountedPrice}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Book Now
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

