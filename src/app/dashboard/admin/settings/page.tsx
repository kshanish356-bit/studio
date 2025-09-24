
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Settings, Shield, ToggleRight, Palette, KeyRound, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function AdminSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Mock state for settings. In a real app, this would come from a backend/database.
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    aiItineraryPlanner: true,
    partnerSubmissions: true,
    primaryColor: '#007BFF',
    accentColor: '#20C997',
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // API Key Status (read-only for security)
  const [apiKeyStatus, setApiKeyStatus] = useState({
    mapMyIndia: process.env.NEXT_PUBLIC_MAP_MY_INDIA_API_KEY && !process.env.NEXT_PUBLIC_MAP_MY_INDIA_API_KEY.includes('YOUR_'),
    aviationStack: process.env.API_KEY && !process.env.API_KEY.includes('YOUR_'),
    firebase: process.env.NEXT_PUBLIC_FIREBASE_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('YOUR_'),
  });

  useEffect(() => {
    if (!authLoading && (!user || user.primaryRole !== 'admin')) {
      toast({ title: "Access Denied", description: "You are not authorized to view this page.", variant: "destructive" });
      router.push('/dashboard');
    }
  }, [user, authLoading, router, toast]);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate saving settings to a backend
    setTimeout(() => {
      setIsSaving(false);
      toast({ title: "Settings Saved", description: "Your changes have been saved successfully. (Mock action)" });
    }, 1500);
  };
  
  const ApiStatusIndicator = ({ isConfigured }: { isConfigured: boolean }) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {isConfigured ? 'Configured' : 'Not Configured'}
    </span>
  );


  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-semibold flex items-center"><Settings className="mr-2"/> System Settings</h1>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save All Changes
            </Button>
        </div>

        <div className="grid gap-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ToggleRight className="mr-2 text-primary"/> Feature Flags</CardTitle>
              <CardDescription>Enable or disable major features across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                  <span>Maintenance Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Temporarily disable access to the site for all non-admin users.
                  </span>
                </Label>
                <Switch id="maintenance-mode" checked={settings.maintenanceMode} onCheckedChange={(val) => handleSettingChange('maintenanceMode', val)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="ai-planner" className="flex flex-col space-y-1">
                  <span>AI Itinerary Planner</span>
                   <span className="font-normal leading-snug text-muted-foreground">
                    Allow users to access the AI-powered itinerary planning tool.
                  </span>
                </Label>
                <Switch id="ai-planner" checked={settings.aiItineraryPlanner} onCheckedChange={(val) => handleSettingChange('aiItineraryPlanner', val)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="partner-submissions" className="flex flex-col space-y-1">
                  <span>Partner Tour Submissions</span>
                   <span className="font-normal leading-snug text-muted-foreground">
                    Allow partners (agents, drivers) to create and list new tour packages.
                  </span>
                </Label>
                <Switch id="partner-submissions" checked={settings.partnerSubmissions} onCheckedChange={(val) => handleSettingChange('partnerSubmissions', val)} />
              </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><KeyRound className="mr-2 text-primary"/> API Key Status</CardTitle>
              <CardDescription>Check the configuration status of third-party API keys from environment variables.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-md">
                 <p className="font-medium">MapMyIndia API (Maps)</p>
                 <ApiStatusIndicator isConfigured={apiKeyStatus.mapMyIndia} />
              </div>
               <div className="flex justify-between items-center p-3 border rounded-md">
                 <p className="font-medium">AviationStack API (Flights)</p>
                 <ApiStatusIndicator isConfigured={apiKeyStatus.aviationStack} />
              </div>
               <div className="flex justify-between items-center p-3 border rounded-md">
                 <p className="font-medium">Firebase API (Auth & DB)</p>
                 <ApiStatusIndicator isConfigured={apiKeyStatus.firebase} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Palette className="mr-2 text-primary"/> Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application. (UI is a mock-up)</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <Label htmlFor="primary-color">Primary Color</Label>
                 <div className="flex items-center gap-2">
                    <Input id="primary-color" type="color" value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} className="w-12 h-10 p-1"/>
                    <Input value={settings.primaryColor} onChange={(e) => handleSettingChange('primaryColor', e.target.value)} />
                 </div>
                 <p className="text-xs text-muted-foreground">Changes the main color for buttons, links, and highlights.</p>
               </div>
                <div className="space-y-2">
                 <Label htmlFor="accent-color">Accent Color</Label>
                 <div className="flex items-center gap-2">
                    <Input id="accent-color" type="color" value={settings.accentColor} onChange={(e) => handleSettingChange('accentColor', e.target.value)} className="w-12 h-10 p-1"/>
                    <Input value={settings.accentColor} onChange={(e) => handleSettingChange('accentColor', e.target.value)} />
                 </div>
                 <p className="text-xs text-muted-foreground">Used for special offers and call-to-action elements.</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
