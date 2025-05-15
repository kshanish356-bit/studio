
import { Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center border-b pb-6">
          <Briefcase size={48} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl">User Dashboard</CardTitle>
          <CardDescription>Manage your bookings, profile, and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">View and manage your past and upcoming trips.</p>
                <p className="mt-4 font-semibold">Feature coming soon!</p>
                {/* Placeholder for booking list or link */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Update your personal details and contact information.</p>
                <Button asChild className="mt-4">
                  <Link href="/profile">Go to Profile</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Customize your travel preferences for better suggestions.</p>
                 <p className="mt-4 font-semibold">Feature coming soon!</p>
                {/* Placeholder for preferences settings or link */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage your account settings and notification preferences.</p>
                 <Button asChild className="mt-4">
                  <Link href="/settings">Go to Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
