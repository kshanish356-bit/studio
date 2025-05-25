
"use client";

import { useAuth, type PartnerRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Car, UserCheck, Users, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function SelectPartnerRolePage() {
  const { user, isLoading, setPartnerSubRole, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Access Denied", description: "Please log in.", variant: "destructive" });
      router.push('/');
    } else if (!isLoading && isAuthenticated && user && (user.primaryRole !== 'partner' || user.partnerRole)) {
      // If user is not a partner, or is a partner but already has a role, redirect them appropriately
      toast({ title: "Role Already Set or Not Applicable", description: "Redirecting to your dashboard.", variant: "default" });
      if (user.primaryRole === 'user') {
        router.push('/dashboard');
      } else if (user.primaryRole === 'partner' && user.partnerRole) {
        router.push(`/dashboard/${user.partnerRole.toLowerCase().replace(/\s+/g, '-')}`);
      } else {
        router.push('/'); // Fallback
      }
    }
  }, [user, isLoading, isAuthenticated, router, toast]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  if (!user || user.primaryRole !== 'partner' || user.partnerRole) {
    // This case should ideally be caught by the useEffect, but as a fallback:
    return <div className="container mx-auto px-4 py-16 text-center">Accessing role selection page...</div>;
  }

  const handlePartnerTypeSelection = (partnerTypePath: string) => {
    // Instead of setting the role here, we redirect to the specific onboarding page
    router.push(partnerTypePath);
    toast({
      title: "Proceeding to Onboarding",
      description: `Please complete the specific onboarding for your chosen partner type.`,
    });
  };

  const partnerRoles = [
    { role: 'cabDriver' as PartnerRole, label: 'Cab Driver', icon: Car, path: '/partner/onboarding/cab-driver' },
    { role: 'agent' as PartnerRole, label: 'Travel Agent', icon: Briefcase, path: '/partner/onboarding/travel-agent' },
    { role: 'houseRent' as PartnerRole, label: 'House Rent Partner', icon: Building, path: '/partner/onboarding/house-rent' },
    { role: 'partnerAdmin' as PartnerRole, label: 'Partner Admin', icon: Users, path: '/partner/onboarding/partner-admin' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <UserCheck size={48} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl">Select Your Partner Role</CardTitle>
          <CardDescription>Choose the type of partnership you want to engage in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {partnerRoles.map(({ role, label, icon: Icon, path }) => (
            <Button
              key={role}
              variant="outline"
              className="w-full justify-start text-lg py-6"
              onClick={() => handlePartnerTypeSelection(path)}
              // disabled={isSubmitting} // Add isSubmitting if you have a loading state for this action
            >
              <Icon className="mr-3 h-6 w-6 text-primary" />
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
