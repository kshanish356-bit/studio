
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config'; // Import Firebase auth
import type { User as FirebaseUser } from 'firebase/auth'; // Firebase User type
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

interface User {
  id: string; // Corresponds to Firebase uid
  name: string | null;
  email: string | null;
  image?: string | null; // Corresponds to Firebase photoURL
  role?: string; 
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void; // Will be updated to use Firebase email/password login
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void; // Will be updated
  signup: (email: string, pass: string, name: string) => Promise<User | null>; // Placeholder for Firebase signup
  resetPassword: (email: string) => Promise<void>; // Placeholder for Firebase password reset
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // True while checking Firebase auth state
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          image: firebaseUser.photoURL,
          // role: fetch role from Firestore if needed
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Placeholder for login - to be replaced with Firebase email/password login
  const login = (userData: User) => {
    // This will be replaced by actual Firebase signInWithEmailAndPassword
    console.warn("Mock login called. Implement Firebase login.");
    setUser(userData); 
    toast({ title: "Login Successful (Mock)", description: `Welcome back, ${userData.name}!` });
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/'); 
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({ title: "Logout Error", description: error.message || "Failed to log out.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Placeholder for signup - to be implemented with createUserWithEmailAndPassword
  const signup = async (email: string, pass: string, name: string): Promise<User | null> => {
    console.warn("Mock signup called. Implement Firebase signup.");
    // This will be replaced by actual Firebase createUserWithEmailAndPassword
    // and then updateProfile for displayName
    toast({ title: "Signup (Mock)", description: "Account created (mock)." });
    return null; 
  };

  // Placeholder for password reset - to be implemented with sendPasswordResetEmail
  const resetPassword = async (email: string): Promise<void> => {
    console.warn("Mock password reset called. Implement Firebase password reset.");
    // This will be replaced by actual Firebase sendPasswordResetEmail
    toast({ title: "Password Reset (Mock)", description: "If email exists, a reset link is sent (mock)." });
  };

  // Placeholder for updateUser - will be updated to interact with Firebase Auth / Firestore
  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const newUser = { ...prevUser, ...updatedData };
        // In a real Firebase app, you'd call updateProfile (Auth) or updateDoc (Firestore)
        console.warn("Mock updateUser called. Implement Firebase profile/Firestore update.");
        toast({ title: "Profile Updated (Mock)" });
        return newUser;
      }
      return null;
    });
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        login, 
        logout, 
        updateUser, 
        signup,
        resetPassword,
        isAuthenticated: !!user, 
        isLoading 
    }}>
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
