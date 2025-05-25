
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type PartnerRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function TravelAgentOnboardingPage() {
    const { user, setPartnerSubRole, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [agencyName, setAgencyName] = useState("");
    const [iataNumber, setIataNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/'); 
        } else if (!authLoading && user && user.primaryRole !== 'partner') {
             router.push('/dashboard');
        } else if (!authLoading && user && user.partnerRole) {
            router.push(`/dashboard/${user.partnerRole}`);
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agencyName) {
            toast({ title: "Missing Information", description: "Agency name is required.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            // Placeholder: Save agencyName and iataNumber to Firestore for the user
            toast({ title: "Saving Travel Agent Details...", description: "This is a placeholder." });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            await setPartnerSubRole('agent' as PartnerRole);
            toast({ title: "Travel Agent Role Confirmed!", description: "Redirecting to your dashboard." });
            router.push('/dashboard/agent');
        } catch (error: any) {
            toast({ title: "Onboarding Failed", description: error.message || "Could not complete onboarding.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || !user || user.primaryRole !== 'partner' || user.partnerRole) {
        return <div className="container mx-auto px-4 py-16 text-center">Loading or redirecting...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-lg shadow-xl">
                <CardHeader className="text-center">
                    <Briefcase size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">Travel Agent Onboarding</CardTitle>
                    <CardDescription>Please provide your agency details to get started.</CardDescription>
                </CardHeader>
                 <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="agencyName">Agency Name</Label>
                            <Input id="agencyName" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="e.g., Globe Trotters Inc." required />
                        </div>
                        <div>
                            <Label htmlFor="iataNumber">IATA Number (Optional)</Label>
                            <Input id="iataNumber" value={iataNumber} onChange={(e) => setIataNumber(e.target.value)} placeholder="e.g., 12345678" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                             {isSubmitting ? "Submitting..." : "Complete Onboarding & Continue"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
