
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { UserCircle, Sun, MoonStar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false); // Placeholder for theme settings
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/'); // Redirect to home if not authenticated
       toast({ title: "Access Denied", description: "Please log in to view your profile.", variant: "destructive"});
    }
  }, [isAuthenticated, isLoading, router, toast]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading settings...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="container mx-auto px-4 py-16 text-center">Please log in to view settings.</div>;
  }
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would implement actual theme switching logic
    toast({ title: "Theme Changed", description: `Dark mode ${isDarkMode ? 'disabled' : 'enabled'}. This is a placeholder.` });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <UserCircle size={64} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl">Settings</CardTitle>
          <CardDescription>Customize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
            <div className="space-y-1">
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle dark/light appearance.</p>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="flex items-center space-x-2">
                         {isDarkMode ? <MoonStar className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />} {isDarkMode ? 'Dark' : 'Light'}
                     </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={toggleTheme}>
                   {isDarkMode ? <Sun className="mr-2 h-4 w-4" /> : <MoonStar className="mr-2 h-4 w-4" />}  {isDarkMode ? 'Light' : 'Dark'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
          {/* Add more settings options here - e.g., notification preferences, privacy settings, etc. */}
        </CardContent>
      </Card>
    </div>
  );
}
