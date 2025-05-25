
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, type PartnerRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function PartnerAdminOnboardingPage() {
    const { user, setPartnerSubRole, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
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

    const handleConfirmAdminRole = async () => {
        setIsSubmitting(true);
        try {
            await setPartnerSubRole('partnerAdmin' as PartnerRole);
            toast({ title: "Partner Admin Role Confirmed!", description: "Redirecting to your admin dashboard." });
            router.push('/dashboard/partner-admin');
        } catch (error: any) {
            toast({ title: "Role Confirmation Failed", description: error.message || "Could not set admin role.", variant: "destructive" });
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
                    <Users size={48} className="mx-auto mb-4 text-primary" />
                    <CardTitle className="text-3xl">Partner Admin Confirmation</CardTitle>
                    <CardDescription>Confirm to proceed as a Partner Administrator.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">
                        As a Partner Admin, you will have access to manage other partners and platform settings.
                        This role typically requires prior approval.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleConfirmAdminRole} className="w-full" disabled={isSubmitting}>
                         {isSubmitting ? "Confirming..." : "Confirm & Proceed to Admin Dashboard"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

