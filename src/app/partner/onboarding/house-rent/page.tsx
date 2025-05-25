
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type PartnerRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function HouseRentOnboardingPage() {
    const { user, setPartnerSubRole, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [propertyName, setPropertyName] = useState("");
    const [propertyLocation, setPropertyLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        } else if (!authLoading && user && user.primaryRole !== 'partner') {
             router.push('/dashboard');
        } else if (!authLoading && user && user.partnerRole) {
            // If role already set, and it's not houseRent, maybe redirect to their actual dashboard or generic one.
            // For now, let's assume if they somehow land here with a role, redirect to their partner dashboard.
            router.push(`/dashboard/${user.partnerRole.toLowerCase().replace(/\s+/g, '-')}`);
        }
    }, [user, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!propertyName || !propertyLocation) {
            toast({ title: "Missing Information", description: "Please fill all property details.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            // Placeholder: Save propertyName, propertyLocation to Firestore for the user
            toast({ title: "Saving House Rent Partner Details...", description: "This is a placeholder." });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            await setPartnerSubRole('houseRent' as PartnerRole);
            toast({ title: "House Rent Partner Role Confirmed!", description: "Redirecting to your dashboard." });
            // We need a dashboard for house-rent partners, e.g., /dashboard/house-rent
            // For now, let's redirect to a generic partner dashboard or create a specific placeholder
             router.push('/dashboard'); // Or /dashboard/house-rent if created
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
                    <Building size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">House Rent Partner Onboarding</CardTitle>
                    <CardDescription>Provide details about your rental property or services.</CardDescription>
                </CardHeader>
                 <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="propertyName">Property Name / Service Name</Label>
                            <Input id="propertyName" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="e.g., Cozy Beach House, City Apartments Management" required />
                        </div>
                        <div>
                            <Label htmlFor="propertyLocation">Primary Location of Service/Property</Label>
                            <Input id="propertyLocation" value={propertyLocation} onChange={(e) => setPropertyLocation(e.target.value)} placeholder="e.g., Goa, India or Mumbai City Area" required />
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

