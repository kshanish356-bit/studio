
import TrainBookingForm from '@/components/home/TrainBookingForm';
import { Train } from 'lucide-react';

export default function TrainsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Train size={48} className="mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold">Train Bookings</h1>
        <p className="text-muted-foreground">Find and book your train tickets easily.</p>
      </div>
      <TrainBookingForm />
      {/* Additional content related to trains can be added here */}
    </div>
  );
}
