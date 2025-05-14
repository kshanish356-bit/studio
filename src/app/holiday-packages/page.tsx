
import { Briefcase } from 'lucide-react';

export default function HolidayPackagesPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Briefcase size={64} className="mx-auto mb-6 text-primary" />
      <h1 className="text-4xl font-bold mb-4">Holiday Packages</h1>
      <p className="text-xl text-muted-foreground">
        Curated holiday packages for your dream vacation. Coming soon!
      </p>
    </div>
  );
}
