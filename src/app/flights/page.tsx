
import { Plane } from 'lucide-react';

export default function FlightsPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Plane size={64} className="mx-auto mb-6 text-primary" />
      <h1 className="text-4xl font-bold mb-4">Flights</h1>
      <p className="text-xl text-muted-foreground">
        Flight booking feature coming soon. Stay tuned!
      </p>
    </div>
  );
}
