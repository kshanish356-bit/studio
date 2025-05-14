
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string; // Example: 'admin' or 'user'
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('userInfo');
      const sessionExpiry = localStorage.getItem('sessionExpiry');

      if (storedUser && sessionExpiry && Date.now() < parseInt(sessionExpiry, 10)) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('sessionExpiry');
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load user from storage", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userInfo' || event.key === 'sessionExpiry') {
        loadUserFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const intervalId = setInterval(() => {
      const sessionExpiry = localStorage.getItem('sessionExpiry');
      if (sessionExpiry && Date.now() >= parseInt(sessionExpiry, 10)) {
        toast({ title: "Session Expired", description: "Please log in again." });
        logout();
      }
    }, 60 * 1000); // Check every minute


    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [loadUserFromStorage, toast]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    localStorage.setItem('sessionExpiry', (Date.now() + SESSION_EXPIRY_MS).toString());
    toast({ title: "Login Successful", description: `Welcome back, ${userData.name}!` });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('sessionExpiry');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/'); // Redirect to home page or login page
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const newUser = { ...prevUser, ...updatedData };
        localStorage.setItem('userInfo', JSON.stringify(newUser));
        return newUser;
      }
      return null;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
