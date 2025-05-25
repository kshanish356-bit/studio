
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TravelAgentOnboardingPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    // This page is now a placeholder as the role is set at signup.
    // It can be used for future specific Travel Agent onboarding steps.

    useEffect(() => {
        if (!authLoading && (!user || user.primaryRole !== 'partner' || user.partnerRole !== 'agent')) {
            toast({ title: "Access Denied", description: "Redirecting...", variant: "destructive" });
            router.push(user && user.primaryRole === 'partner' && !user.partnerRole ? '/partner/select-role' : '/');
        } else if (!authLoading && user && user.partnerRole === 'agent') {
            // If already an agent, they should be on their dashboard
            // router.push('/dashboard/agent');
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
     if (user.partnerRole && user.partnerRole !== 'agent') {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <p>This onboarding is for Travel Agents. Your role is: {user.partnerRole}</p>
                <Button onClick={() => router.push(`/dashboard/${user.partnerRole}`)} className="mt-4">Go to Your Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="text-center">
                    <Briefcase size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">Travel Agent Details</CardTitle>
                     <CardDescription>
                        Welcome, Travel Agent! Your role is confirmed.
                        {user.partnerRole === 'agent' ? 
                            " You can proceed to your dashboard." : 
                            " Please complete any additional steps if required (future implementation)."
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-center text-muted-foreground">
                        This page can be used for further travel agent-specific onboarding steps in the future,
                        such as agency details, IATA number, etc. For now, your role is set.
                    </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={() => router.push('/dashboard/agent')} className="w-full">
                        Go to Travel Agent Dashboard
                    </Button>
                     <Button onClick={() => router.push('/')} className="w-full" variant="outline">
                        Go to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
