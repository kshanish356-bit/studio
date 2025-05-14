
import { Hotel } from 'lucide-react';

export default function HotelsPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Hotel size={64} className="mx-auto mb-6 text-primary" />
      <h1 className="text-4xl font-bold mb-4">Hotels</h1>
      <p className="text-xl text-muted-foreground">
        Hotel booking feature coming soon. Explore amazing stays!
      </p>
    </div>
  );
}
