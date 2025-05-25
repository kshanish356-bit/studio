
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type PartnerRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Car, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CabDriverOnboardingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // This page is now a placeholder as the role is set at signup.
    // It can be used for future specific Cab Driver onboarding steps if needed.

    useEffect(() => {
        if (!authLoading && (!user || user.primaryRole !== 'partner' || user.partnerRole !== 'cabDriver')) {
            // If not a cab driver or role not set yet (shouldn't happen if signup flow is direct)
            // or if trying to access directly without being a cab driver partner, redirect.
            toast({ title: "Access Denied", description: "Redirecting...", variant: "destructive" });
            router.push(user && user.primaryRole === 'partner' && !user.partnerRole ? '/partner/select-role' : '/');
        } else if (!authLoading && user && user.partnerRole === 'cabDriver') {
            // If already a cab driver, they should be on their dashboard
            // router.push('/dashboard/cab-driver'); 
            // Commenting out direct redirect to allow content to show if needed for future steps
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
    
    if (user.partnerRole && user.partnerRole !== 'cabDriver') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p>This onboarding is for Cab Drivers. Your role is: {user.partnerRole}</p>
                <Button onClick={() => router.push(`/dashboard/${user.partnerRole}`)} className="mt-4">Go to Your Dashboard</Button>
            </div>
        );
    }
    
    // If user is a partner and role is cabDriver (or not set yet, though it should be by now)
    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="text-center">
                    <Car size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">Cab Driver Details</CardTitle>
                    <CardDescription>
                        Welcome, Cab Driver! Your role is confirmed.
                        {user.partnerRole === 'cabDriver' ? 
                            " You can proceed to your dashboard." : 
                            " Please complete any additional steps if required (future implementation)."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        This page can be used for further cab-driver specific onboarding steps in the future,
                        such as vehicle details, document uploads, etc. For now, your role is set.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={() => router.push('/dashboard/cab-driver')} className="w-full">
                        Go to Cab Driver Dashboard
                    </Button>
                     <Button onClick={() => router.push('/')} className="w-full" variant="outline">
                        Go to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
