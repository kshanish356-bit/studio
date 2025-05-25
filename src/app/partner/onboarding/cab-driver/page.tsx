
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type PartnerRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CabDriverOnboardingPage() {
    const { user, setPartnerSubRole, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [vehicleModel, setVehicleModel] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/'); // Redirect if not logged in
        } else if (!authLoading && user && user.primaryRole !== 'partner') {
             router.push('/dashboard'); // Redirect if not a partner
        } else if (!authLoading && user && user.partnerRole) {
            router.push(`/dashboard/${user.partnerRole}`); // Redirect if role already set
        }
    }, [user, authLoading, router]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vehicleModel || !licenseNumber) {
            toast({ title: "Missing Information", description: "Please fill all fields.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            // Here you would typically save vehicleModel, licenseNumber, etc., to Firestore
            // For example, by calling an API route that updates the user's partner profile
            toast({ title: "Saving Cab Driver Details...", description: "This is a placeholder." });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            // After saving details, set the partner sub-role
            await setPartnerSubRole('cabDriver' as PartnerRole);
            toast({ title: "Cab Driver Role Confirmed!", description: "Redirecting to your dashboard." });
            router.push('/dashboard/cab-driver');
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
                    <Car size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">Cab Driver Onboarding</CardTitle>
                    <CardDescription>Please provide your vehicle and license details to get started.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="vehicleModel">Vehicle Model</Label>
                            <Input id="vehicleModel" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="e.g., Toyota Camry" required />
                        </div>
                        <div>
                            <Label htmlFor="licenseNumber">Driving License Number</Label>
                            <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g., DL12345XYZ" required />
                        </div>
                        {/* Add more fields as needed: Vehicle Registration, Insurance, etc. */}
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
