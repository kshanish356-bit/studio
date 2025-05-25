
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PartnerAdminOnboardingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // This page is now a placeholder as the role is set at signup.
    // It can be used for future specific Partner Admin onboarding steps.

    useEffect(() => {
         if (!authLoading && (!user || user.primaryRole !== 'partner' || user.partnerRole !== 'partnerAdmin')) {
            toast({ title: "Access Denied", description: "Redirecting...", variant: "destructive" });
            router.push(user && user.primaryRole === 'partner' && !user.partnerRole ? '/partner/select-role' : '/');
        } else if (!authLoading && user && user.partnerRole === 'partnerAdmin') {
            // If already a partnerAdmin, they should be on their dashboard
            // router.push('/dashboard/partner-admin');
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

    if (user.partnerRole && user.partnerRole !== 'partnerAdmin') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p>This onboarding is for Partner Admins. Your role is: {user.partnerRole}</p>
                <Button onClick={() => router.push(`/dashboard/${user.partnerRole}`)} className="mt-4">Go to Your Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="text-center">
                    <Users size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">Partner Admin Confirmation</CardTitle>
                     <CardDescription>
                        Welcome, Partner Admin! Your role is confirmed.
                         {user.partnerRole === 'partnerAdmin' ? 
                            " You can proceed to your admin dashboard." : 
                            " Please complete any additional steps if required (future implementation)."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-center text-muted-foreground">
                        This page can be used for further Partner Admin specific onboarding steps or information.
                        For now, your role as Partner Admin is set.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                     <Button onClick={() => router.push('/dashboard/partner-admin')} className="w-full">
                        Go to Partner Admin Dashboard
                    </Button>
                     <Button onClick={() => router.push('/')} className="w-full" variant="outline">
                        Go to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
