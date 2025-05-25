
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Building, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HouseRentOnboardingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // This page is now a placeholder as the role is set at signup.
    // It can be used for future specific House Rent partner onboarding steps.

    useEffect(() => {
        if (!authLoading && (!user || user.primaryRole !== 'partner' || user.partnerRole !== 'houseRent')) {
            toast({ title: "Access Denied", description: "Redirecting...", variant: "destructive" });
            router.push(user && user.primaryRole === 'partner' && !user.partnerRole ? '/partner/select-role' : '/');
        } else if (!authLoading && user && user.partnerRole === 'houseRent') {
            // If already a houseRent partner, they should be on their dashboard
            // router.push('/dashboard/house-rent'); // Assuming a /dashboard/house-rent exists
        }
    }, [user, authLoading, router, toast]);

    if (authLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                Loading user data...
            </div>
        );
    }

    if (!user || user.primaryRole !== 'partner') {
         return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p>You must be a partner to access this page.</p>
                <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
            </div>
        );
    }
    if (user.partnerRole && user.partnerRole !== 'houseRent') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p>This onboarding is for House Rent Partners. Your role is: {user.partnerRole}</p>
                <Button onClick={() => router.push(`/dashboard/${user.partnerRole}`)} className="mt-4">Go to Your Dashboard</Button>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="text-center">
                    <Building size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">House Rent Partner Details</CardTitle>
                    <CardDescription>
                        Welcome, House Rent Partner! Your role is confirmed.
                         {user.partnerRole === 'houseRent' ? 
                            " You can proceed to your dashboard." : 
                            " Please complete any additional steps if required (future implementation)."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        This page can be used for further house rent partner-specific onboarding steps in the future,
                        such as property listings, verification, etc. For now, your role is set.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    {/* A generic dashboard for now, or create /dashboard/house-rent */}
                    <Button onClick={() => router.push('/dashboard')} className="w-full"> 
                        Go to Dashboard
                    </Button>
                     <Button onClick={() => router.push('/')} className="w-full" variant="outline">
                        Go to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
