
"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Bell, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon, DollarSign, Briefcase, FileText, CheckCircle, Download, Loader2 } from 'lucide-react';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Ride {
  id: string;
  from: string;
  to: string;
  time: string;
  status: 'Pending' | 'Accepted' | 'Ongoing' | 'Completed' | 'Cancelled';
  fare?: string;
}

export default function CabDriverDashboardPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [rideHistory, setRideHistory] = useState<Ride[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState(true);
  const [errorRides, setErrorRides] = useState<string | null>(null);
  const [isUpdatingRide, setIsUpdatingRide] = useState<string | null>(null); // Stores ID of ride being updated

  const fetchDriverRides = useCallback(async () => {
    setIsLoadingRides(true);
    setErrorRides(null);
    try {
      const response = await fetch('/api/driver/rides');
      if (!response.ok) {
        throw new Error(`Failed to fetch rides: ${response.statusText}`);
      }
      const data: Ride[] = await response.json();
      
      const activeStatuses: Ride['status'][] = ['Pending', 'Accepted', 'Ongoing'];
      setUpcomingRides(data.filter(ride => activeStatuses.includes(ride.status)).sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime() || a.time.localeCompare(b.time) )); // Basic sort
      setRideHistory(data.filter(ride => !activeStatuses.includes(ride.status)).sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime() || b.time.localeCompare(a.time) )); // Basic sort
      
    } catch (error) {
      console.error("Error fetching rides:", error);
      setErrorRides((error as Error).message);
      toast({ title: "Error Loading Rides", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingRides(false);
    }
  }, [toast]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    fetchDriverRides();
  }, [fetchDriverRides]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newThemeIsDark = !prev;
      if (newThemeIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      toast({ title: 'Theme Changed', description: `Switched to ${newThemeIsDark ? 'Dark' : 'Light'} Mode` });
      return newThemeIsDark;
    });
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setIsAvailable(checked);
    toast({
      title: 'Availability Updated',
      description: `You are now ${checked ? 'Online' : 'Offline'}.`,
    });
  };

  const handleUpdateRideStatus = async (rideId: string, newStatus: Ride['status']) => {
    setIsUpdatingRide(rideId);
    try {
      const response = await fetch('/api/driver/rides', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId, newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update ride status: ${response.statusText}`);
      }
      toast({ title: "Ride Status Updated", description: `Ride ${rideId} is now ${newStatus}.` });
      fetchDriverRides(); // Refresh ride lists
    } catch (error) {
      console.error("Error updating ride status:", error);
      toast({ title: "Update Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsUpdatingRide(null);
    }
  };

  const getButtonForRideStatus = (ride: Ride) => {
    const isUpdatingThisRide = isUpdatingRide === ride.id;
    switch (ride.status) {
      case 'Pending':
        return <Button variant="secondary" size="sm" onClick={() => handleUpdateRideStatus(ride.id, 'Accepted')} disabled={isUpdatingThisRide}>{isUpdatingThisRide ? <Loader2 className="animate-spin" /> : "Accept"}</Button>;
      case 'Accepted':
        return <Button variant="default" size="sm" onClick={() => handleUpdateRideStatus(ride.id, 'Ongoing')} disabled={isUpdatingThisRide}>{isUpdatingThisRide ? <Loader2 className="animate-spin" /> : "Start Ride"}</Button>;
      case 'Ongoing':
        return <Button variant="destructive" size="sm" onClick={() => handleUpdateRideStatus(ride.id, 'Completed')} disabled={isUpdatingThisRide}>{isUpdatingThisRide ? <Loader2 className="animate-spin" /> : "End Ride"}</Button>;
      default:
        return null;
    }
  };
  
  const dataForDownload = upcomingRides.length > 0 ? upcomingRides : rideHistory; // Or combine them

  const handleDownloadPDF = () => {
    if (dataForDownload.length === 0) {
      toast({ title: 'No Data', description: 'No rides available to download.', variant: 'destructive' });
      return;
    }
    const doc = new jsPDF();
    doc.text("Driver Rides", 14, 16);
    doc.autoTable({
      head: [['From', 'To', 'Time', 'Status', 'Fare']],
      body: dataForDownload.map(ride => [ride.from, ride.to, ride.time, ride.status, ride.fare || 'N/A']),
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133] },
    });
    doc.save('driver_rides.pdf');
    toast({ title: 'PDF Downloaded', description: 'Rides PDF has been generated.' });
  };

  const handleDownloadExcel = () => {
     if (dataForDownload.length === 0) {
      toast({ title: 'No Data', description: 'No rides available to download.', variant: 'destructive' });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dataForDownload.map(ride => ({
      From: ride.from,
      To: ride.to,
      Time: ride.time,
      Status: ride.status,
      Fare: ride.fare || 'N/A',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Driver Rides");
    XLSX.writeFile(workbook, "driver_rides.xlsx");
    toast({ title: 'Excel Downloaded', description: 'Rides Excel file has been generated.' });
  };

  return (
    <div className="flex min-h-screen bg-secondary/50 dark:bg-background">
      <aside className="w-64 bg-card text-card-foreground p-6 shadow-lg flex flex-col space-y-6 fixed h-full">
        <div className="text-center">
          <Image
            src="https://placehold.co/100x100.png"
            alt="Driver"
            width={100}
            height={100}
            className="rounded-full mx-auto mb-3 border-2 border-primary"
            data-ai-hint="driver avatar"
          />
          <h3 className="text-xl font-semibold">John Doe</h3> {/* TODO: Dynamic name */}
          <p className="text-sm text-muted-foreground">Cab Driver</p>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-2">
            <li><Button variant="ghost" className="w-full justify-start"><Briefcase className="mr-2 h-4 w-4" /> Dashboard</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><DollarSign className="mr-2 h-4 w-4" /> Earnings</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Documents</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><SettingsIcon className="mr-2 h-4 w-4" /> Settings</Button></li>
          </ul>
        </nav>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="toggle-availability" checked={isAvailable} onCheckedChange={handleAvailabilityChange} />
            <Label htmlFor="toggle-availability" className="text-sm">Availability</Label>
            <CheckCircle className={`h-5 w-5 ${isAvailable ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <Button variant="outline" className="w-full"><LogOut className="mr-2 h-4 w-4" /> Logout</Button> {/* TODO: Logout action */}
        </div>
      </aside>

      <main className="flex-grow p-8 ml-64 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            {/* TODO: Replace with actual DropdownMenu from ShadCN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>John Doe</span> {/* TODO: Dynamic name */}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem> {/* TODO: Logout action */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Static cards for now, can be made dynamic */}
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rideHistory.length + upcomingRides.filter(r => r.status === 'Ongoing').length}</div>
              <p className="text-xs text-muted-foreground">Completed & Ongoing</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings Today</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1,200</div> {/* Placeholder */}
              <p className="text-xs text-muted-foreground">+5% from yesterday</p>
            </CardContent>
          </Card>
           <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹7,500</div> {/* Placeholder */}
              <p className="text-xs text-muted-foreground">Target: ₹10,000</p>
            </CardContent>
          </Card>
           <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Docs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div> {/* Placeholder */}
              <p className="text-xs text-muted-foreground">RC Book Expiring</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div id="driver-map" className="h-[350px] bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Map integration placeholder</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming & Active Rides</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRides ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2">Loading rides...</p>
                </div>
              ) : errorRides ? (
                <p className="text-destructive text-center py-10">Error loading rides: {errorRides}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingRides.length > 0 ? upcomingRides.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell>{ride.from}</TableCell>
                        <TableCell>{ride.to}</TableCell>
                        <TableCell>{ride.time}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            ride.status === 'Accepted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100' :
                            ride.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100' :
                            ride.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                            ride.status === 'Completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-100' :
                            'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'
                          }`}>
                            {ride.status}
                          </span>
                        </TableCell>
                        <TableCell>{ride.fare}</TableCell>
                        <TableCell className="text-right">
                          {getButtonForRideStatus(ride)}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">No upcoming or active rides.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Ride History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingRides ? (
                    <div className="flex justify-center items-center py-10">
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                       <p className="ml-2">Loading ride history...</p>
                    </div>
                  ) : errorRides ? (
                    <p className="text-destructive text-center py-10">Error loading ride history: {errorRides}</p>
                  ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fare</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rideHistory.length > 0 ? rideHistory.map((ride) => (
                                <TableRow key={ride.id}>
                                    <TableCell>{ride.from}</TableCell>
                                    <TableCell>{ride.to}</TableCell>
                                    <TableCell>{ride.time}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          ride.status === 'Completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-100' :
                                          'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' // Cancelled
                                        }`}>
                                            {ride.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{ride.fare}</TableCell>
                                </TableRow>
                            )) : (
                               <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">No ride history found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                  )}
                </CardContent>
            </Card>
        </section>
      </main>
    </div>
  );
}

// Placeholder DropdownMenu components for type-checking if not fully set up globally
// In a real setup, these would be imported from '@/components/ui/dropdown-menu'
const DropdownMenu: React.FC<{children: React.ReactNode}> = ({children}) => <div>{children}</div>;
const DropdownMenuTrigger: React.FC<{children: React.ReactNode, asChild?: boolean}> = ({children}) => <div>{children}</div>;
const DropdownMenuContent: React.FC<{children: React.ReactNode, align?: string}> = ({children}) => <div style={{position: 'absolute', right: 0, background: 'var(--card)', border: '1px solid var(--border)', padding: '5px', zIndex: 50, display:'none'}}>{children}</div>;
const DropdownMenuItem: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{padding: '5px', cursor: 'pointer'}}>{children}</div>;
const DropdownMenuSeparator: React.FC = () => <hr />;
