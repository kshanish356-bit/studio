
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, User, Cog, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, isPartnerRoleSelectionPending } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until authentication state is resolved
    }
    if (!isAuthenticated) {
      // If not authenticated, redirect to home. The header will show login options.
      router.push('/');
    } else if (isPartnerRoleSelectionPending) {
      // If user is a partner but hasn't selected a role, redirect them.
      router.push('/partner/select-role');
    } else if (user?.primaryRole === 'admin') {
      router.push('/dashboard/admin');
    } else if (user?.primaryRole === 'partner' && user.partnerRole) {
       // Redirect partners to their specific dashboard
       switch (user.partnerRole) {
          case 'agent':
            router.push('/dashboard/agent');
            break;
          case 'cabDriver':
            router.push('/dashboard/cab-driver');
            break;
          case 'houseRent':
            router.push('/dashboard/house-rent');
            break;
          default:
            // Fallback for any other partner roles, though it shouldn't be hit with current setup
            break; 
       }
    }
    // If the user is a regular 'user', they will stay on this page.
  }, [user, isLoading, isAuthenticated, router, isPartnerRoleSelectionPending]);

  if (isLoading || !user || user.primaryRole !== 'user') {
    // Show a loading state or a blank screen while redirecting
    // to avoid flashing the user dashboard to non-user roles.
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // This content is specifically for regular 'user' roles.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><BookMarked className="mr-2" /> My Bookings</CardTitle>
          <CardDescription>View and manage your past and upcoming trips.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Feature coming soon!</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><User className="mr-2" /> Profile Information</CardTitle>
          <CardDescription>Update your personal details and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button asChild><Link href="/profile">Go to Profile</Link></Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Cog className="mr-2" /> Preferences</CardTitle>
          <CardDescription>Customize your travel preferences for better suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Feature coming soon!</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Settings className="mr-2" /> Account Settings</CardTitle>
          <CardDescription>Manage your account settings and notification preferences.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button asChild><Link href="/settings">Go to Settings</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
