
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  Home, Plane, Train, Hotel, Bus, CarTaxiFront, Briefcase, Shield, Moon, User, ChevronDown, UserCircle, Settings, LogOut, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/flights', label: 'Flights', icon: Plane },
  { href: '/trains', label: 'Trains', icon: Train },
  { href: '/hotels', label: 'Hotels', icon: Hotel },
  { href: '/house-rent', label: 'House Rent', icon: Home }, // Using Home again, consider a different icon
  { href: '/bus', label: 'Bus', icon: Bus },
  { href: '/cabs', label: 'Cabs', icon: CarTaxiFront },
  { href: '/holiday-packages', label: 'Holiday Packages', icon: Briefcase },
  { href: '/insurance', label: 'Insurance', icon: Shield },
];

export default function AppHeader() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Placeholder for theme toggle
  const toggleTheme = () => {
    // In a real app, this would toggle dark/light mode
    console.log("Theme toggled");
    alert("Theme toggle functionality not implemented in this version.");
  };

  if (!isMounted) {
    // Render a placeholder or null during SSR to avoid hydration mismatch for auth state
    return (
      <header className="sticky-header p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image src="https://placehold.co/40x40.png?text=TE" alt="TravelEase Logo" width={40} height={40} data-ai-hint="logo travel" />
            <span className="text-xl font-bold text-primary">TravelEase</span>
          </div>
          <div className="animate-pulse flex items-center space-x-2">
            <div className="h-8 w-20 bg-muted rounded"></div>
            <div className="h-8 w-8 bg-muted rounded-full"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky-header p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="https://placehold.co/40x40.png?text=TE" alt="TravelEase Logo" width={40} height={40} data-ai-hint="logo travel" />
            <span className="text-xl font-bold text-primary">TravelEase</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="main-nav hidden lg:flex">
            <ul className="flex items-center space-x-1">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle Theme">
              <Moon />
            </Button>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Image
                      src={user.image || "https://placehold.co/32x32.png?text=U"}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                      data-ai-hint="avatar person"
                    />
                    <span>{user.name}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                     <Link href="/dashboard"><Briefcase className="mr-2 h-4 w-4" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)} className="btn-auth">
                <User className="mr-2 h-4 w-4" /> Login / Sign Up
              </Button>
            )}
          </div>
          
          {/* Mobile Navigation Trigger */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <hr className="my-4"/>
                  {isAuthenticated && user ? (
                    <>
                       <Link href="/profile" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <UserCircle size={20} /> <span>Profile</span>
                      </Link>
                       <Link href="/settings" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <Settings size={20} /> <span>Settings</span>
                      </Link>
                      <Link href="/dashboard" className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <Briefcase size={20} /> <span>Dashboard</span>
                      </Link>
                      <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} variant="ghost" className="w-full justify-start p-2">
                        <LogOut className="mr-2 h-5 w-5" /> Logout
                      </Button>
                    </>
                  ) : (
                     <Button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full justify-start p-2">
                       <User className="mr-2 h-5 w-5" /> Login / Sign Up
                     </Button>
                  )}
                  <Button variant="ghost" onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="w-full justify-start p-2">
                    <Moon className="mr-2 h-5 w-5" /> Toggle Theme
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
}
