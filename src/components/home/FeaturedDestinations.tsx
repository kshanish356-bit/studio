
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const destinations = [
  {
    name: 'Paris, France',
    description: 'Experience the city of love with iconic landmarks and romantic ambiance.',
    price: '$599',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'paris city'
  },
  {
    name: 'Bali, Indonesia',
    description: 'Tropical paradise with stunning beaches and vibrant culture.',
    price: '$799',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'bali beach'
  },
  {
    name: 'Tokyo, Japan',
    description: 'Where futuristic technology meets ancient traditions.',
    price: '$899',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'tokyo city'
  },
  {
    name: 'New York, USA',
    description: 'The city that never sleeps with iconic skyscrapers and Broadway shows.',
    price: '$699',
    image: 'https://placehold.co/800x600.png',
    aiHint: 'newyork city'
  },
];

export default function FeaturedDestinations() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Popular Destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((dest) => (
            <Card key={dest.name} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  width={800}
                  height={600}
                  className="w-full h-56 object-cover"
                  data-ai-hint={dest.aiHint}
                />
              </CardHeader>
              <CardContent className="p-6 flex-grow">
                <CardTitle className="text-xl mb-2">{dest.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mb-3">{dest.description}</CardDescription>
                <div className="text-lg font-semibold text-primary mb-4">From {dest.price}</div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                 <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <MapPin className="mr-2 h-4 w-4" /> Explore
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

