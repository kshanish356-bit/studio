
import HeroSection from '@/components/home/HeroSection';
import TrainBookingForm from '@/components/home/TrainBookingForm';
import FeaturedDestinations from '@/components/home/FeaturedDestinations';
import SpecialOffers from '@/components/home/SpecialOffers';
import Testimonials from '@/components/home/Testimonials';
import NewsletterSubscription from '@/components/home/NewsletterSubscription';
import PersonalizedSuggestions from '@/components/home/PersonalizedSuggestions';
import DailyInspiration from '@/components/home/DailyInspiration';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrainBookingForm />
      <DailyInspiration />
      <PersonalizedSuggestions />
      <FeaturedDestinations />
      <SpecialOffers />
      <Testimonials />
      <NewsletterSubscription />
    </>
  );
}
