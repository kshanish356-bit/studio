
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, DollarSign, LineChart as LineChartIcon, Loader2, UserPlus, FileText, PlusCircle } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { toast } from '@/hooks/use-toast';

// Mock Data
const agentStats = {
  totalBookings: 128,
  commissionEarned: 156800, // in INR
  activeClients: 45,
};

const bookingTrendData = [
  { month: 'Jan', bookings: 15 },
  { month: 'Feb', bookings: 20 },
  { month: 'Mar', bookings: 18 },
  { month: 'Apr', bookings: 25 },
  { month: 'May', bookings: 30 },
  { month: 'Jun', bookings: 20 },
];

const recentBookings = [
  { id: 'BK001', client: 'Alice Johnson', service: 'Flight to Paris', amount: 85000, commission: 4250, status: 'Confirmed' },
  { id: 'BK002', client: 'Bob Williams', service: 'Bali Hotel Package', amount: 65000, commission: 3250, status: 'Confirmed' },
  { id: 'BK003', client: 'Charlie Brown', service: 'Train to Goa', amount: 5500, commission: 275, status: 'Pending' },
  { id: 'BK004', client: 'Diana Miller', service: 'NYC Tour Package', amount: 120000, commission: 6000, status: 'Completed' },
  { id: 'BK005', client: 'Ethan Davis', service: 'Cab Rental Delhi', amount: 3500, commission: 175, status: 'Completed' },
];

const bookingTrendChartConfig: ChartConfig = {
  bookings: { label: "Bookings", color: "hsl(var(--chart-1))" },
};

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export default function TravelAgentDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);
  const [packageTitle, setPackageTitle] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageDuration, setPackageDuration] = useState('');


  useEffect(() => {
    if (!isLoading && (!user || user.primaryRole !== 'partner' || user.partnerRole !== 'agent')) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageTitle || !packageDescription || !packagePrice || !packageDuration) {
      toast({ title: "Missing Information", description: "Please fill all fields to create a package.", variant: "destructive" });
      return;
    }
    setIsSubmittingPackage(true);
    try {
      const response = await fetch('/api/tour-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: packageTitle,
          description: packageDescription,
          price: Number(packagePrice),
          duration: packageDuration,
          createdBy: user?.name || 'Agent',
          creatorRole: 'agent'
        }),
      });
      if (!response.ok) throw new Error('Failed to create package');
      
      toast({ title: "Package Created!", description: "Your new tour package has been listed." });
      // Reset form
      setPackageTitle('');
      setPackageDescription('');
      setPackagePrice('');
      setPackageDuration('');

    } catch (error) {
       toast({ title: "Creation Failed", description: (error as Error).message, variant: 'destructive' });
    } finally {
        setIsSubmittingPackage(false);
    }
  };


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
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentStats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">+15 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(agentStats.commissionEarned)}</div>
              <p className="text-xs text-muted-foreground">+₹20,500 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentStats.activeClients}</div>
              <p className="text-xs text-muted-foreground">+5 new clients this month</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Booking Trends</CardTitle>
              <CardDescription>Your booking performance over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={bookingTrendChartConfig} className="h-[300px] w-full">
                <BarChart data={bookingTrendData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Legend />
                  <Bar dataKey="bookings" fill="var(--color-bookings)" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your clients and reports.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                <Button><UserPlus className="mr-2"/> Add New Client</Button>
                <Button variant="outline"><FileText className="mr-2"/> Generate Report</Button>
            </CardContent>
          </Card>
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>Recent Client Bookings</CardTitle>
              <CardDescription>A list of your most recent transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">{booking.client}</div>
                        <div className="text-sm text-muted-foreground">ID: {booking.id}</div>
                      </TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === 'Confirmed' || booking.status === 'Completed' ? 'default' : 'secondary'}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{formatCurrency(booking.commission)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
           <Card className="xl:col-span-3">
              <form onSubmit={handleCreatePackage}>
                  <CardHeader>
                      <CardTitle>Create New Tour Package</CardTitle>
                      <CardDescription>Add a new travel package to be displayed on the homepage.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="pkg-title">Package Title</Label>
                          <Input id="pkg-title" placeholder="e.g., Golden Triangle Tour" value={packageTitle} onChange={e => setPackageTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="pkg-duration">Duration</Label>
                          <Input id="pkg-duration" placeholder="e.g., 5 Days / 4 Nights" value={packageDuration} onChange={e => setPackageDuration(e.target.value)} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="pkg-desc">Description</Label>
                          <Textarea id="pkg-desc" placeholder="Describe the tour package..." value={packageDescription} onChange={e => setPackageDescription(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="pkg-price">Price (INR)</Label>
                          <Input id="pkg-price" type="number" placeholder="e.g., 25000" value={packagePrice} onChange={e => setPackagePrice(e.target.value)} />
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button type="submit" disabled={isSubmittingPackage}>
                          {isSubmittingPackage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                          Create Package
                      </Button>
                  </CardFooter>
              </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
