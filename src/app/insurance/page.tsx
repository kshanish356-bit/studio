
import { Shield } from 'lucide-react';

export default function InsurancePage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Shield size={64} className="mx-auto mb-6 text-primary" />
      <h1 className="text-4xl font-bold mb-4">Travel Insurance</h1>
      <p className="text-xl text-muted-foreground">
        Secure your travels with our comprehensive insurance plans. Coming soon!
      </p>
    </div>
  );
}
