"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, BarChart2, Settings, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.primaryRole !== 'admin')) {
      router.push('/'); // Redirect non-admins
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-6xl mx-auto shadow-lg">
        <CardHeader className="text-center border-b pb-6">
          <Shield size={48} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
          <CardDescription>System-wide management and overview.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Management</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">Total registered users</p>
                <Button asChild className="mt-4 w-full">
                  <Link href="/admin/users">Manage Users</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">New bookings this week</p>
                 <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href="/admin/activity">View Activity Logs</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Reports</div>
                <p className="text-xs text-muted-foreground">View detailed analytics</p>
                 <Button asChild className="mt-4 w-full">
                  <Link href="/admin/analytics">Go to Analytics</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Settings className="mr-2 h-5 w-5"/>
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage global application settings, API keys, and feature flags.</p>
                <Button asChild variant="destructive" className="mt-4">
                  <Link href="/admin/settings">Access System Settings</Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
