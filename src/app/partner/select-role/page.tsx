
"use client";

import { useAuth, type PartnerRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Car, UserCheck, Users, Building } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export default function SelectPartnerRolePage() {
  const { user, isLoading, setPartnerSubRole, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Access Denied", description: "Please log in.", variant: "destructive" });
      router.push('/');
    } else if (!isLoading && isAuthenticated && user && (user.primaryRole !== 'partner' || user.partnerRole)) {
      toast({ title: "Role Already Set or Not Applicable", description: "Redirecting to your dashboard.", variant: "default" });
      if (user.primaryRole === 'user' || user.primaryRole === 'admin') {
        const dashboardPath = `/dashboard${user.primaryRole === 'admin' ? '/admin' : '' }`
        router.push(dashboardPath);
      } else if (user.primaryRole === 'partner' && user.partnerRole) {
        let dashboardPath = '/dashboard'; // Fallback
          switch (user.partnerRole) {
            case 'cabDriver': dashboardPath = '/dashboard/cab-driver'; break;
            case 'agent': dashboardPath = '/dashboard/agent'; break;
            case 'houseRent': dashboardPath = '/dashboard/house-rent'; break;
          }
        router.push(dashboardPath);
      } else {
        router.push('/'); 
      }
    }
  }, [user, isLoading, isAuthenticated, router, toast]);

  const handlePartnerTypeSelection = async (partnerType: PartnerRole, dashboardPath: string) => {
    if (!user || user.primaryRole !== 'partner') {
      toast({ title: "Error", description: "Invalid user state for role selection.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await setPartnerSubRole(partnerType);
      toast({
        title: "Partner Role Confirmed!",
        description: `You are now set as a ${partnerType}. Redirecting...`,
      });
      router.push(dashboardPath);
    } catch (error: any) {
      toast({
        title: 'Role Selection Failed',
        description: error.message || `Could not set role to ${partnerType}.`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  if (!user || user.primaryRole !== 'partner' || user.partnerRole) {
    return <div className="container mx-auto px-4 py-16 text-center">Verifying partner status...</div>;
  }

  const partnerRoles = [
    { role: 'cabDriver' as PartnerRole, label: 'Cab Driver', icon: Car, dashboardPath: '/dashboard/cab-driver' },
    { role: 'agent' as PartnerRole, label: 'Travel Agent', icon: Briefcase, dashboardPath: '/dashboard/agent' },
    { role: 'houseRent' as PartnerRole, label: 'House Rent Partner', icon: Building, dashboardPath: '/dashboard/house-rent' },
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
          {partnerRoles.map(({ role, label, icon: Icon, dashboardPath }) => (
            <Button
              key={role}
              variant="outline"
              className="w-full justify-start text-lg py-6"
              onClick={() => handlePartnerTypeSelection(role, dashboardPath)}
              disabled={isSubmitting}
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
