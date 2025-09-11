
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import DashboardSidebarNav from '@/components/layout/DashboardSidebarNav';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

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

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader className="border-b">
                 <Link href="/" className="flex flex-col items-center space-y-1">
                    <span className="text-sm font-bold text-primary">My Apps</span>
                    <Image src="https://placehold.co/40x40.png" alt="My Apps Logo" width={40} height={40} data-ai-hint="logo abstract" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <DashboardSidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 border-t">
                 {/* Footer content if any */}
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold capitalize">{user.primaryRole} Dashboard</h1>
            </header>
            <div className="p-4 md:p-8">
              {children}
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
