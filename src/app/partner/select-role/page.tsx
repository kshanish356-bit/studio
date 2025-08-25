
"use client";

import { useAuth, type PartnerRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Car, UserCheck, Users, Building, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export default function SelectPartnerRolePage() {
  const { user, isLoading, setPartnerSubRole, isAuthenticated, isPartnerRoleSelectionPending } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({ title: "Access Denied", description: "Please log in.", variant: "destructive" });
      router.push('/');
    } else if (!isLoading && isAuthenticated && !isPartnerRoleSelectionPending) {
        toast({ title: "Role Already Set or Not Applicable", description: "Redirecting...", variant: "default" });
        if (user?.primaryRole === 'partner' && user?.partnerRole) {
            let dashboardPath = '/dashboard';
            switch (user.partnerRole) {
                case 'cabDriver': dashboardPath = '/dashboard/cab-driver'; break;
                case 'agent': dashboardPath = '/dashboard/agent'; break;
                case 'houseRent': dashboardPath = '/dashboard/house-rent'; break;
            }
            router.push(dashboardPath);
        } else {
             router.push('/dashboard');
        }
    }
  }, [user, isLoading, isAuthenticated, router, toast, isPartnerRoleSelectionPending]);

  const handlePartnerTypeSelection = async (partnerType: PartnerRole) => {
    if (!user || user.primaryRole !== 'partner') {
      toast({ title: "Error", description: "Invalid user state for role selection.", variant: "destructive" });
      return;
    }

    let dashboardPath = '/dashboard';
    switch (partnerType) {
        case 'cabDriver': dashboardPath = '/dashboard/cab-driver'; break;
        case 'agent': dashboardPath = '/dashboard/agent'; break;
        case 'houseRent': dashboardPath = '/dashboard/house-rent'; break;
        default: dashboardPath = '/dashboard'; // Fallback
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

  if (isLoading || !user) {
    return (
        <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Verifying partner status...</p>
        </div>
    );
  }

  if (!isPartnerRoleSelectionPending) {
     return (
        <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Redirecting to your dashboard...</p>
        </div>
    );
  }


  const partnerRoles = [
    { role: 'cabDriver' as PartnerRole, label: 'Cab Driver', icon: Car },
    { role: 'agent' as PartnerRole, label: 'Travel Agent', icon: Briefcase },
    { role: 'houseRent' as PartnerRole, label: 'House Rent Partner', icon: Building },
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
          {partnerRoles.map(({ role, label, icon: Icon }) => (
            <Button
              key={role}
              variant="outline"
              className="w-full justify-start text-lg py-6"
              onClick={() => handlePartnerTypeSelection(role)}
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
