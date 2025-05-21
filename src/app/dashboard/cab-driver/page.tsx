
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Bell, ChevronDown, LogOut, Settings as SettingsIcon, User as UserIcon, DollarSign, Briefcase, FileText, CheckCircle, Download } from 'lucide-react';

// Import for file downloads
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import for the autoTable plugin
import * as XLSX from 'xlsx';

// Extend jsPDF with autoTable - this is a common way to type it for TypeScript
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}


interface Ride {
  from: string;
  to: string;
  time: string;
  status: 'Pending' | 'Accepted' | 'Ongoing' | 'Completed' | 'Cancelled';
  fare?: string;
}

const upcomingRidesData: Ride[] = [
  { from: 'Bhopal New Market', to: 'Indore Airport', time: '10:00 AM', status: 'Accepted', fare: '₹1800' },
  { from: 'MP Nagar Zone 2', to: 'Bhopal Railway Station', time: '12:30 PM', status: 'Pending', fare: '₹250' },
  { from: 'Airport Road', to: 'City Center Mall', time: '03:15 PM', status: 'Ongoing', fare: '₹300' },
  { from: 'Van Vihar National Park', to: 'Upper Lake View Point', time: '05:00 PM', status: 'Completed', fare: '₹150' },
];

const rideHistoryData: Ride[] = [
 { from: 'Lake View', to: 'DB Mall', time: 'Yesterday 08:00 PM', status: 'Completed', fare: '₹220' },
 { from: 'ISBT Bhopal', to: 'Kolar Road', time: 'Two days ago 11:00 AM', status: 'Completed', fare: '₹450' },
];


export default function CabDriverDashboardPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Upcoming Rides", 14, 16);
    doc.autoTable({
      head: [['From', 'To', 'Time', 'Status', 'Fare']],
      body: upcomingRidesData.map(ride => [ride.from, ride.to, ride.time, ride.status, ride.fare || 'N/A']),
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [22, 160, 133] }, // Example primary color
    });
    doc.save('upcoming_rides.pdf');
    toast({ title: 'PDF Downloaded', description: 'Upcoming rides PDF has been generated.' });
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(upcomingRidesData.map(ride => ({
      From: ride.from,
      To: ride.to,
      Time: ride.time,
      Status: ride.status,
      Fare: ride.fare || 'N/A',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Upcoming Rides");
    XLSX.writeFile(workbook, "upcoming_rides.xlsx");
    toast({ title: 'Excel Downloaded', description: 'Upcoming rides Excel file has been generated.' });
  };


  return (
    <div className="flex min-h-screen bg-secondary/50 dark:bg-background">
      {/* Sidebar */}
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
          <h3 className="text-xl font-semibold">John Doe</h3>
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
          <Button variant="outline" className="w-full"><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-grow p-8 ml-64 overflow-y-auto"> {/* Added ml-64 for fixed sidebar */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>John Doe</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">+2 since last week</p>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings Today</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1,200</div>
              <p className="text-xs text-muted-foreground">+5% from yesterday</p>
            </CardContent>
          </Card>
           <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹7,500</div>
              <p className="text-xs text-muted-foreground">Target: ₹10,000</p>
            </CardContent>
          </Card>
           <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Docs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div>
              <p className="text-xs text-muted-foreground">RC Book Expiring</p>
            </CardContent>
          </Card>
        </section>

        {/* Map Section */}
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

        {/* Rides Table Section */}
        <section>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Rides</CardTitle>
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
                  {upcomingRidesData.length > 0 ? upcomingRidesData.map((ride, index) => (
                    <TableRow key={index}>
                      <TableCell>{ride.from}</TableCell>
                      <TableCell>{ride.to}</TableCell>
                      <TableCell>{ride.time}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          ride.status === 'Accepted' ? 'bg-blue-100 text-blue-700' :
                          ride.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          ride.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                          ride.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700' // Cancelled
                        }`}>
                          {ride.status}
                        </span>
                      </TableCell>
                      <TableCell>{ride.fare}</TableCell>
                      <TableCell className="text-right">
                        {ride.status === 'Accepted' && <Button variant="default" size="sm">Start Ride</Button>}
                        {ride.status === 'Pending' && <Button variant="secondary" size="sm">Accept</Button>}
                         {ride.status === 'Ongoing' && <Button variant="destructive" size="sm">End Ride</Button>}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">No upcoming rides.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
         {/* Ride History Section - Placeholder */}
        <section className="mt-8">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Ride History</CardTitle>
                </CardHeader>
                <CardContent>
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
                            {rideHistoryData.map((ride, index) => (
                                <TableRow key={index}>
                                    <TableCell>{ride.from}</TableCell>
                                    <TableCell>{ride.to}</TableCell>
                                    <TableCell>{ride.time}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                            {ride.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{ride.fare}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
      </main>
    </div>
  );
}


// Helper for DropdownMenu - replace with actual ShadCN if needed later or integrate into main component
const DropdownMenu: React.FC<{children: React.ReactNode}> = ({children}) => <div>{children}</div>;
const DropdownMenuTrigger: React.FC<{children: React.ReactNode, asChild?: boolean}> = ({children}) => <div>{children}</div>;
const DropdownMenuContent: React.FC<{children: React.ReactNode, align?: string}> = ({children}) => <div style={{position: 'absolute', background: 'white', border: '1px solid #ccc', padding: '5px', display:'none'}}>{children}</div>; // basic placeholder
const DropdownMenuItem: React.FC<{children: React.ReactNode}> = ({children}) => <div style={{padding: '5px', cursor: 'pointer'}}>{children}</div>;
const DropdownMenuSeparator: React.FC = () => <hr />;

