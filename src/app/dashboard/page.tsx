"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, User, Cog, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, isPartnerRoleSelectionPending } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // If not authenticated, redirect to home. The header will show login options.
        router.push('/');
      } else if (isPartnerRoleSelectionPending) {
        // If user is a partner but hasn't selected a role, redirect them.
        router.push('/partner/select-role');
      } else if (user?.primaryRole) {
        // Redirect to the specific dashboard based on their role
        switch(user.primaryRole) {
            case 'admin':
                router.push('/dashboard/admin');
                break;
            case 'partner':
                if(user.partnerRole) {
                    // This is the key change to ensure redirection
                    if (user.partnerRole === 'cabDriver') {
                        router.push('/dashboard/cab-driver');
                    } else if (user.partnerRole === 'houseRent'){
                        router.push('/dashboard/house-rent');
                    } else if (user.partnerRole === 'agent'){
                        router.push('/dashboard/agent');
                    } else {
                       router.push(`/dashboard/${user.partnerRole}`);
                    }
                }
                // If they are a partner but have no sub-role, the isPartnerRoleSelectionPending check should have already caught this.
                break;
            case 'user':
                // It's a regular user, so they stay on this generic dashboard page.
                break;
            default:
                 router.push('/');
        }
      }
    }
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
