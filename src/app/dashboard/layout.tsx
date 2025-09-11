"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import DashboardSidebarNav from '@/components/layout/DashboardSidebarNav';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

function getDashboardTitle(user: any, pathname: string): string {
    if (!user) return "Dashboard";

    // Specific titles for sub-pages
    if (pathname.includes('/dashboard/admin/users')) return "User Management";
    if (pathname.includes('/dashboard/admin/partners')) return "Partner Management";
    if (pathname.includes('/dashboard/admin/settings')) return "System Settings";


    // General titles for main dashboard pages
    switch (user.primaryRole) {
        case 'admin':
            return 'Admin Dashboard';
        case 'partner':
            if (user.partnerRole === 'agent') return 'Travel Agent Dashboard';
            if (user.partnerRole === 'cabDriver') return 'Cab Driver Dashboard';
            if (user.partnerRole === 'houseRent') return 'House Rent Dashboard';
            return 'Partner Dashboard';
        case 'user':
            return 'User Dashboard';
        default:
            return 'Dashboard';
    }
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dashboardTitle = getDashboardTitle(user, pathname);

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                 <Link href="/" className="flex items-center gap-2">
                    <Image src="https://placehold.co/40x40.png" alt="My Apps Logo" width={32} height={32} data-ai-hint="logo abstract" />
                    <span className="font-semibold text-lg">My Apps</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <DashboardSidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t">
                 {/* Can add user profile quick access here later */}
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between p-4 border-b h-16">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">{dashboardTitle}</h1>
                <div className="w-8"></div>
            </header>
            <div className="p-4 md:p-8 bg-muted/40 flex-grow">
              {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
