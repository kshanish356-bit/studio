
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star, StarHalf } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'New York, USA',
    text: 'Amazing service! Our vacation was perfectly planned and we got great deals on our hotel bookings.',
    rating: 5,
    image: 'https://placehold.co/100x100.png',
    aiHint: 'woman portrait'
  },
  {
    name: 'Raj Patel',
    location: 'Mumbai, India',
    text: 'The train booking was seamless and the customer support was very helpful when we needed to make changes.',
    rating: 4.5,
    image: 'https://placehold.co/100x100.png',
    aiHint: 'man portrait'
  },
];

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<Star key={i} className="text-yellow-400 fill-yellow-400 h-5 w-5" />);
    } else if (i - 0.5 === rating) {
      stars.push(<StarHalf key={i} className="text-yellow-400 fill-yellow-400 h-5 w-5" />);
    } else {
      stars.push(<Star key={i} className="text-gray-300 h-5 w-5" />);
    }
  }
  return stars;
};

export default function Testimonials() {
  return (
    <section className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex mb-3">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.text}&quot;</p>
                <div className="flex items-center">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full mr-4"
                    data-ai-hint={testimonial.aiHint}
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <small className="text-muted-foreground">{testimonial.location}</small>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

