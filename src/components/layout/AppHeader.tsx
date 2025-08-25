
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  Home, Plane, Train, Hotel, Bus, CarTaxiFront, Briefcase, Shield, Moon, User, ChevronDown, UserCircle, Settings, LogOut, Menu, Building, Users, Shield as ShieldIcon
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePathname, useRouter } from 'next/navigation';


const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/flights', label: 'Flights', icon: Plane },
  { href: '/trains', label: 'Trains', icon: Train },
  { href: '/hotels', label: 'Hotels', icon: Hotel },
  { href: '/house-rent', label: 'House Rent', icon: Building },
  { href: '/bus', label: 'Bus', icon: Bus },
  { href: '/cabs', label: 'Cabs', icon: CarTaxiFront },
  { href: '/holiday-packages', label: 'Holiday Packages', icon: Briefcase },
  { href: '/insurance', label: 'Insurance', icon: Shield },
];

export default function AppHeader() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'signup'>('login');
  const [loginIntent, setLoginIntent] = useState<'user' | 'partner' | 'admin'>('user');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isLoading, isPartnerRoleSelectionPending } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || !isMounted) return;

    const currentPath = pathname || "";

    // This block is now handled more robustly inside the AuthContext
    // to prevent redirection loops and ensure correct routing upon state change.
    // Keeping it could cause conflicts. AuthContext is the single source of truth for auth-based routing.

  }, [isAuthenticated, user, isLoading, router, pathname, isMounted, isPartnerRoleSelectionPending]);


  const handleLogout = () => {
    logout();
  };

  const openAuthModal = (tab: 'login' | 'signup', intent: 'user' | 'partner' | 'admin' = 'user') => {
    setAuthModalInitialTab(tab);
    setLoginIntent(intent);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    if (currentTheme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);


  if (!isMounted) {
    return (
      <header className="sticky top-0 z-50 p-4 border-b bg-background shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex flex-col items-center space-y-1">
             <span className="text-sm font-bold text-primary">My Apps</span>
            <Image src="https://placehold.co/40x40.png" alt="My Apps Logo" width={40} height={40} data-ai-hint="logo abstract" />
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
      <header className="sticky top-0 z-50 p-4 border-b bg-background shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col items-center space-y-1">
            <span className="text-sm font-bold text-primary">My Apps</span>
            <Image src="https://placehold.co/40x40.png" alt="My Apps Logo" width={40} height={40} data-ai-hint="logo abstract" />
          </Link>

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
                      src={user.image || "https://placehold.co/32x32.png"}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                      data-ai-hint="avatar person"
                    />
                    <span>{user.name || "User"}</span>
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
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <User className="mr-1 h-4 w-4" /> Login / Sign Up <ChevronDown size={16} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                   <DropdownMenuItem onClick={() => openAuthModal('login', 'user')}>
                    <UserCircle className="mr-2 h-4 w-4" /> As User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openAuthModal('login', 'partner')}>
                    <Users className="mr-2 h-4 w-4" /> As Partner
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => openAuthModal('login', 'admin')}>
                    <ShieldIcon className="mr-2 h-4 w-4" /> As Admin
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                 <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
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
                    <>
                     <Button onClick={() => openAuthModal('login', 'user')} className="w-full justify-start p-2">
                       <UserCircle className="mr-2 h-5 w-5" /> User Login / Sign Up
                     </Button>
                      <Button onClick={() => openAuthModal('login', 'partner')} className="w-full justify-start p-2">
                       <Users className="mr-2 h-5 w-5" /> Partner Login / Sign Up
                     </Button>
                     <Button onClick={() => openAuthModal('login', 'admin')} className="w-full justify-start p-2">
                       <ShieldIcon className="mr-2 h-5 w-5" /> Admin Login / Sign Up
                     </Button>
                    </>
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
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialTab={authModalInitialTab}
          loginIntent={loginIntent}
        />
      )}
    </>
  );
}
