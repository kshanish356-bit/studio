
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign, CalendarDays, Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock Data
const partnerStats = {
  listedProperties: 8,
  totalBookings: 32,
  monthlyEarnings: 185000,
};

const properties = [
  { id: 'PROP001', name: 'Seaside Villa', location: 'Goa', status: 'Listed', bookings: 12, imageUrl: 'https://placehold.co/150x100.png', aiHint: 'villa beach' },
  { id: 'PROP002', name: 'Mountain Chalet', location: 'Manali', status: 'Listed', bookings: 8, imageUrl: 'https://placehold.co/150x100.png', aiHint: 'mountain chalet' },
  { id: 'PROP003', name: 'City Center Apartment', location: 'Mumbai', status: 'Booked', bookings: 5, imageUrl: 'https://placehold.co/150x100.png', aiHint: 'city apartment' },
  { id: 'PROP004', name: 'Heritage Haveli', location: 'Jaipur', status: 'Under Maintenance', bookings: 7, imageUrl: 'https://placehold.co/150x100.png', aiHint: 'heritage building' },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export default function HouseRentDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.primaryRole !== 'partner' || user.partnerRole !== 'houseRent')) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">House Rent Dashboard</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Property
            </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listed Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerStats.listedProperties}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">+10 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(partnerStats.monthlyEarnings)}</div>
              <p className="text-xs text-muted-foreground">June 2024</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
              <CardDescription>Manage your property listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map(prop => (
                    <TableRow key={prop.id}>
                      <TableCell className="flex items-center gap-2">
                        <Image src={prop.imageUrl} width={80} height={50} alt={prop.name} className="rounded-md object-cover" data-ai-hint={prop.aiHint} />
                        <div className="font-medium">{prop.name}</div>
                      </TableCell>
                      <TableCell>{prop.location}</TableCell>
                      <TableCell>
                         <Badge variant={prop.status === 'Listed' ? 'default' : prop.status === 'Booked' ? 'destructive': 'secondary'}>{prop.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{prop.bookings}</TableCell>
                      <TableCell className="text-center space-x-1">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Booking Calendar</CardTitle>
              <CardDescription>Overview of your property bookings.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-2">
                <Image src="https://placehold.co/600x400.png" width={600} height={400} alt="Booking calendar placeholder" className="rounded-md" data-ai-hint="calendar illustration" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
