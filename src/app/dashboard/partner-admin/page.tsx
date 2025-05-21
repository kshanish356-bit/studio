
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Briefcase, Car, BarChart2, Settings as SettingsIcon, LogOut, Bell, Sun, Moon, UserCircle, Search, ShieldCheck, CheckCircle, Clock, AlertTriangle, Users2, UserCheck, UserX, FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data (replace with actual data fetching)
const mockUsers = [
  { id: 'usr_001', name: 'Alice Wonderland', email: 'alice@example.com', role: 'User', joined: '2023-01-15', status: 'Active' },
  { id: 'usr_002', name: 'Bob The Builder', email: 'bob@example.com', role: 'User', joined: '2023-02-20', status: 'Active' },
  { id: 'usr_003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', joined: '2023-03-10', status: 'Suspended' },
];

const mockPartners = [
  { id: 'prt_001', name: 'Speedy Cabs Inc.', type: 'Cab Driver Provider', since: '2023-01-20', status: 'Active', verification: 'Verified' },
  { id: 'prt_002', name: 'Global Travel Agents', type: 'Travel Agent', since: '2023-04-05', status: 'Pending Approval', verification: 'Not Verified' },
  { id: 'prt_003', name: 'John Doe Driving', type: 'Cab Driver', since: '2023-05-01', status: 'Active', verification: 'Verified' },
];

const mockBookings = [
    { id: 'bk_001', user: 'Alice Wonderland', type: 'Flight', destination: 'Paris', date: '2024-08-15', amount: '₹75,000', status: 'Confirmed' },
    { id: 'bk_002', user: 'Bob The Builder', type: 'Cab', destination: 'Local City Tour', date: '2024-07-20', amount: '₹2,500', status: 'Completed' },
    { id: 'bk_003', user: 'Charlie Brown', type: 'Hotel', destination: 'The Grand Hotel', date: '2024-09-01', amount: '₹12,000', status: 'Cancelled' },
];


export default function PartnerAdminDashboardPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(true); // Conceptual admin status

  useEffect(() => {
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

  const handleAdminStatusChange = (checked: boolean) => {
    setIsAdminOnline(checked);
    toast({
      title: 'Admin Status Updated',
      description: `Admin is now ${checked ? 'Online' : 'Offline'}. (Conceptual)`,
    });
  };

  return (
    <div className="flex min-h-screen bg-secondary/50 dark:bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card text-card-foreground p-6 shadow-lg flex flex-col space-y-6 fixed h-full">
        <Link href="/" className="flex items-center space-x-2 mb-6">
          <Image src="/my-apps-logo.png" alt="My Apps Logo" width={40} height={40} data-ai-hint="logo abstract" />
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </Link>

        <div className="text-center">
          <Avatar className="w-24 h-24 mx-auto mb-3 border-2 border-primary">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Admin User" data-ai-hint="admin avatar" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold">Admin User</h3> {/* TODO: Dynamic name */}
          <p className="text-xs text-muted-foreground">Super Administrator</p>
        </div>

        <nav className="flex-grow">
          <ul className="space-y-1">
            <li><Button variant="ghost" className="w-full justify-start"><BarChart2 className="mr-2 h-4 w-4" /> Dashboard</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><Users2 className="mr-2 h-4 w-4" /> User Management</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><Briefcase className="mr-2 h-4 w-4" /> Partner Management</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><Car className="mr-2 h-4 w-4" /> Booking Management</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Content Management</Button></li>
            <li><Button variant="ghost" className="w-full justify-start"><SettingsIcon className="mr-2 h-4 w-4" /> Platform Settings</Button></li>
          </ul>
        </nav>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="toggle-admin-status" checked={isAdminOnline} onCheckedChange={handleAdminStatusChange} />
            <Label htmlFor="toggle-admin-status" className="text-sm">Admin Online</Label>
            <CheckCircle className={`h-5 w-5 ${isAdminOnline ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <Button variant="outline" className="w-full"><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 ml-64 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative w-full max-w-xs">
              <Input type="search" placeholder="Search anything..." className="pl-10" />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-10 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/32x32.png" alt="Admin User" data-ai-hint="admin avatar" />
                    <AvatarFallback>AU</AvatarFallback>
                  </Avatar>
                  <span>Admin User</span> {/* TODO: Dynamic name */}
                  <UserCircle className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,678</div>
              <p className="text-xs text-muted-foreground">+15.2% from last month</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers/Partners</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">230</div>
              <p className="text-xs text-muted-foreground">+5 since last week</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-300">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-200">12</div>
              <p className="text-xs text-orange-500 dark:text-orange-400">Partner applications</p>
            </CardContent>
          </Card>
        </section>

        {/* User Management Section */}
        <section className="mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Users2 className="mr-2 text-primary" /> User Management</CardTitle>
              <CardDescription>View, edit, and manage platform users.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.joined}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><SettingsIcon className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* Partner Management Section */}
        <section className="mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Briefcase className="mr-2 text-primary" /> Partner Management</CardTitle>
              <CardDescription>Oversee cab drivers, travel agents, and other partners.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPartners.map(partner => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.type}</TableCell>
                      <TableCell>{partner.since}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            partner.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                            partner.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-100'
                          }`}>
                            {partner.status}
                        </span>
                      </TableCell>
                       <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${partner.verification === 'Verified' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100' : 'bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100'}`}>
                          {partner.verification === 'Verified' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                          {partner.verification}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {partner.status === 'Pending Approval' && <Button variant="outline" size="sm" className="mr-1"><UserCheck className="h-4 w-4 mr-1"/>Approve</Button>}
                        <Button variant="ghost" size="sm"><SettingsIcon className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

         {/* Booking Management Section */}
        <section className="mb-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Car className="mr-2 text-primary" /> Booking Overview</CardTitle>
              <CardDescription>Monitor recent bookings and their statuses.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details/Destination</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                      <TableCell>{booking.user}</TableCell>
                      <TableCell>{booking.type}</TableCell>
                      <TableCell>{booking.destination}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.amount}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100' :
                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100' // Pending
                          }`}>
                            {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"><Search className="h-4 w-4" /></Button>
                      </TableCell>
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

    