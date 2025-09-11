"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, Loader2, DollarSign, Briefcase, Map, Wand2, UserPlus, Plane, Hotel as HotelIcon, Train } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { toast } from '@/hooks/use-toast';

// Mock Data for Charts and Tables
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 78000 },
  { month: 'Apr', revenue: 65000 },
  { month: 'May', revenue: 89000 },
  { month: 'Jun', revenue: 95000 },
];

const userGrowthData = [
    { date: '2023-01-01', users: 200 },
    { date: '2023-02-01', users: 240 },
    { date: '2023-03-01', users: 278 },
    { date: '2023-04-01', users: 189 },
    { date: '2023-05-01', users: 239 },
    { date: '2023-06-01', users: 349 },
];

const bookingsData = [
  { service: 'Flights', value: 400, fill: 'hsl(var(--chart-1))' },
  { service: 'Hotels', value: 300, fill: 'hsl(var(--chart-2))' },
  { service: 'Trains', value: 300, fill: 'hsl(var(--chart-3))' },
  { service: 'Cabs', value: 200, fill: 'hsl(var(--chart-4))' },
];

const recentSales = [
    { id: 'sale01', user: 'John Doe', email: 'john@example.com', amount: '₹12,500', service: 'Flight' },
    { id: 'sale02', user: 'Jane Smith', email: 'jane@example.com', amount: '₹8,200', service: 'Hotel' },
    { id: 'sale03', user: 'Raj Patel', email: 'raj@example.com', amount: '₹1,800', service: 'Train' },
    { id: 'sale04', user: 'Emily White', email: 'emily@example.com', amount: '₹22,000', service: 'Package' },
    { id: 'sale05', user: 'Michael Brown', email: 'michael@example.com', amount: '₹750', service: 'Cab' },
];

const activityFeed = [
    { id: 1, icon: UserPlus, description: 'New user registered: sarah@example.com', time: '2m ago' },
    { id: 2, icon: Plane, description: 'New flight booking (#FL7890) for ₹15,200', time: '5m ago' },
    { id: 3, icon: Briefcase, description: 'New partner signed up: Global Travels', time: '1h ago' },
    { id: 4, icon: HotelIcon, description: 'New hotel booking (#HTL456) for ₹9,800', time: '3h ago' },
    { id: 5, icon: Train, description: 'New train booking (#TRN123) for ₹2,100', time: '5h ago' },
];

const revenueChartConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
};

const userGrowthChartConfig: ChartConfig = {
    users: { label: "New Users", color: "hsl(var(--chart-2))" }
}

const bookingChartConfig: ChartConfig = {
  value: { label: "Bookings" },
  flights: { label: "Flights", color: "hsl(var(--chart-1))" },
  hotels: { label: "Hotels", color: "hsl(var(--chart-2))" },
  trains: { label: "Trains", color: "hsl(var(--chart-3))" },
  cabs: { label: "Cabs", color: "hsl(var(--chart-4))" },
}


export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.primaryRole !== 'admin')) {
      toast({ title: "Access Denied", description: "You do not have permission to view this page.", variant: "destructive" });
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.primaryRole !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
        <main className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹4,52,31,890</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.9% Uptime</div>
                        <p className="text-xs text-muted-foreground">No active incidents</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                 <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue for the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={revenueChartConfig} className="h-[300px] w-full">
                          <BarChart data={revenueData} accessibilityLayer>
                             <CartesianGrid vertical={false} />
                             <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                             <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                             <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                             <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
                          </BarChart>
                       </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings by Service</CardTitle>
                         <CardDescription>Distribution of bookings across different services.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         <ChartContainer config={bookingChartConfig} className="h-[300px] w-full">
                            <PieChart>
                               <Tooltip content={<ChartTooltipContent nameKey="service" hideLabel />} />
                               <Pie data={bookingsData} dataKey="value" nameKey="service" innerRadius={60} strokeWidth={5}>
                                {bookingsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                               </Pie>
                                <Legend content={<ChartTooltipContent nameKey="service" hideLabel hideIndicator />} />
                            </PieChart>
                         </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="xl:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>A list of the most recent transactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSales.map(sale => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <div className="font-medium">{sale.user}</div>
                                            <div className="text-sm text-muted-foreground">{sale.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{sale.service}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{sale.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="xl:col-span-3">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>New users registered over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={userGrowthChartConfig} className="h-[300px] w-full">
                            <LineChart data={userGrowthData} accessibilityLayer margin={{ left: 12, right: 12 }}>
                               <CartesianGrid vertical={false} />
                               <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })} />
                               <YAxis tickLine={false} axisLine={false} />
                               <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                               <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={true} />
                            </LineChart>
                       </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Wand2 className="mr-2 h-5 w-5 text-primary" /> AI-Powered Insights</CardTitle>
                        <CardDescription>Actionable suggestions based on current data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><strong>Suggestion:</strong> Flight bookings to Goa are up 25% this month. Consider launching a targeted hotel promotion for Goa to maximize revenue.</p>
                        <p><strong>Alert:</strong> User registrations have slowed down by 10% this week. A new sign-up bonus could re-engage potential customers.</p>
                    </CardContent>
                </Card>
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle>Real-time Activity Feed</CardTitle>
                        <CardDescription>A live feed of important events on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activityFeed.map(activity => (
                                    <TableRow key={activity.id}>
                                        <TableCell className="flex items-center gap-2">
                                            <activity.icon className="h-4 w-4 text-muted-foreground" />
                                            <span>{activity.description}</span>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="xl:col-span-3">
                    <CardHeader>
                       <CardTitle className="flex items-center"><Map className="mr-2 h-5 w-5 text-primary" /> Geographic Booking Hotspots</CardTitle>
                       <CardDescription>Top booking locations visualized on a map.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-2">
                        <Image src="https://placehold.co/1200x600.png" width={1200} height={600} alt="Map of booking hotspots" className="rounded-md" data-ai-hint="world map" />
                    </CardContent>
                </Card>
            </div>
        </main>
  );
}
