
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

export type PartnerRole = 'cabDriver' | 'agent' | 'houseRent' | '';


interface User {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  primaryRole?: 'user' | 'partner' | 'admin' | null;
  partnerRole?: PartnerRole | null;
  firebaseUser: FirebaseUser; // Expose the raw firebase user object
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string, intent?: 'user' | 'partner' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<Pick<User, 'name' | 'image'>>) => Promise<void>;
  signup: (email: string, pass: string, name: string, primaryRole: 'user' | 'partner' | 'admin', partnerRole?: PartnerRole) => Promise<User | null>;
  resetPassword: (email: string) => Promise<void>;
  setPartnerSubRole: (subRole: PartnerRole) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSubmitting: boolean; // For modal button states
  isPartnerRoleSelectionPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission loading state
  const router = useRouter();
  const { toast } = useToast();


  const fetchUserRoleData = useCallback(async (firebaseUser: FirebaseUser) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user-role/${firebaseUser.uid}`);
      if (response.ok) {
        const roleData = await response.json();
        setUser({
          id: firebaseUser.uid,
          name: roleData.name || firebaseUser.displayName,
          email: roleData.email || firebaseUser.email,
          image: firebaseUser.photoURL,
          primaryRole: roleData.primaryRole || 'user',
          partnerRole: roleData.partnerRole || null,
          firebaseUser,
        });
      } else {
        console.warn(`Failed to fetch role for ${firebaseUser.uid}: ${response.status}. Defaulting role.`);
        setUser({ 
            id: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            image: firebaseUser.photoURL,
            primaryRole: 'user', 
            partnerRole: null,
            firebaseUser
        });
      }
    } catch (error) {
      console.error("Error fetching user role data:", error);
      setUser({ 
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          image: firebaseUser.photoURL,
          primaryRole: 'user', // Default role on error
          partnerRole: null,
          firebaseUser
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        fetchUserRoleData(firebaseUser);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserRoleData]);

  const login = async (email: string, pass: string, intent: 'user' | 'partner' | 'admin' = 'user') => {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;
      
      const roleResponse = await fetch(`/api/user-role/${uid}`);
      if (!roleResponse.ok) {
        const errorData = await roleResponse.json();
        throw new Error(errorData.message || 'User profile not found. Please contact support.');
      }

      const roleData = await roleResponse.json();

      if (intent === 'admin' && roleData.primaryRole !== 'admin') {
          throw new Error('Access denied. Not an admin account.');
      }
      if (intent === 'partner' && roleData.primaryRole !== 'partner') {
          throw new Error('Access denied. Not a partner account.');
      }
       if (intent === 'user' && roleData.primaryRole !== 'user') {
          throw new Error(`This is a ${roleData.primaryRole} account. Please log in through the correct portal.`);
      }

      // onAuthStateChanged will handle setting the user state and redirection.
      // This function just needs to succeed or fail.
      toast({ title: "Login Successful", description: `Welcome back!` });
      
      // Let onAuthStateChanged handle setting user and subsequent logic
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
        ? "Invalid email or password."
        : error.message || "Login failed. Please try again.";
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
      throw error; // Re-throw to allow modal to handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  const signup = async (email: string, pass: string, name: string, primaryRole: 'user' | 'partner' | 'admin', partnerRole?: PartnerRole) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });

      const rolePayload: any = {
        name: name,
        email: email,
        primaryRole: primaryRole,
        partnerRole: primaryRole === 'partner' ? partnerRole || null : null,
      };

      const roleResponse = await fetch(`/api/user-role/${userCredential.user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolePayload),
      });

      if (!roleResponse.ok) {
        const errorData = await roleResponse.json();
        throw new Error(errorData.message || 'Failed to set user role after signup.');
      }
      
      // onAuthStateChanged will handle redirecting after state update
      // just return the created user object.
      return {
        id: userCredential.user.uid,
        name,
        email,
        primaryRole,
        partnerRole: rolePayload.partnerRole,
        firebaseUser: userCredential.user,
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? "This email is already registered."
        : error.message || "Signup failed. Please try again.";
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Password Reset Link Sent", description: "If an account exists for this email, a reset link has been sent." });
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({ title: "Password Reset Failed", description: error.message || "Could not send reset email.", variant: "destructive" });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUser = async (updatedData: Partial<Pick<User, 'name' | 'image'>>) => {
    if (!auth.currentUser) {
      toast({ title: "Not Authenticated", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: updatedData.name,
        photoURL: updatedData.image,
      });

      const response = await fetch(`/api/user-role/${auth.currentUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedData.name, image: updatedData.image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile on the server.');
      }
      
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedData, name: updatedData.name || prevUser.name, image: updatedData.image || prevUser.image } : null);
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Update Failed", description: error.message || "Could not update profile.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    setIsSubmitting(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/');
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({ title: "Logout Error", description: error.message || "Failed to log out.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPartnerSubRole = async (subRole: PartnerRole) => {
    if (!user || user.primaryRole !== 'partner' || !auth.currentUser) {
        throw new Error("User is not a partner or not authenticated.");
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/user-role/${auth.currentUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerRole: subRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update partner role.');
      }
      setUser(prev => prev ? { ...prev, partnerRole: subRole } : null);
      toast({ title: "Partner Role Set", description: `Your role has been set to ${subRole}.` });
    } catch (error: any) {
      console.error("Error setting partner sub-role:", error);
      toast({ title: "Role Update Failed", description: error.message, variant: "destructive" });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isPartnerRoleSelectionPending = !!(user && user.primaryRole === 'partner' && !user.partnerRole);

  return (
    <AuthContext.Provider value={{ 
        user, 
        login, 
        logout, 
        updateUser, 
        signup,
        resetPassword,
        setPartnerSubRole,
        isAuthenticated: !!user, 
        isLoading,
        isSubmitting,
        isPartnerRoleSelectionPending
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
