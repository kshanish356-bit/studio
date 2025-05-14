
import { Bus } from 'lucide-react';

export default function BusPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Bus size={64} className="mx-auto mb-6 text-primary" />
      <h1 className="text-4xl font-bold mb-4">Bus Tickets</h1>
      <p className="text-xl text-muted-foreground">
        Book bus tickets conveniently. Feature coming soon!
      </p>
    </div>
  );
}
