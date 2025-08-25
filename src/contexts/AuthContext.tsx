
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


  const fetchUserRoleData = useCallback(async (uid: string, basicUserContext: Omit<User, 'primaryRole' | 'partnerRole'>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user-role/${uid}`);
      if (response.ok) {
        const roleData = await response.json();
        setUser({
          ...basicUserContext,
          name: roleData.name || basicUserContext.name, // Prioritize Firestore name
          email: roleData.email || basicUserContext.email, // Prioritize Firestore email
          primaryRole: roleData.primaryRole || 'user',
          partnerRole: roleData.partnerRole || null,
        });
      } else {
        // If fetching role fails (e.g., new user, document not yet created or other error)
        // We still set the user with basic info and default role. The signup process should create the role doc.
        console.warn(`Failed to fetch role for ${uid}: ${response.status}. Defaulting role.`);
        setUser({ 
            ...basicUserContext, 
            primaryRole: 'user', 
            partnerRole: null 
        });
      }
    } catch (error) {
      console.error("Error fetching user role data:", error);
      setUser({ 
          ...basicUserContext, 
          primaryRole: 'user', // Default role on error
          partnerRole: null 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const defaultName = firebaseUser.displayName || 
                            (firebaseUser.email ? firebaseUser.email.split('@')[0] : "User");
        const basicUserContextData = {
          id: firebaseUser.uid,
          name: defaultName,
          email: firebaseUser.email,
          image: firebaseUser.photoURL,
        };
        fetchUserRoleData(firebaseUser.uid, basicUserContextData);
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
      
      // Manually fetch role after login to ensure immediate redirection logic is correct
      const roleResponse = await fetch(`/api/user-role/${uid}`);
      if (!roleResponse.ok) {
        // This case handles when a user exists in Firebase Auth but not in our Firestore `users` collection.
        // This can happen if Firestore entry creation failed during signup.
        // We should treat this as a login error, as the user profile is incomplete.
        const errorData = await roleResponse.json();
        throw new Error(errorData.message || 'User profile not found. Please contact support.');
      }

      const roleData = await roleResponse.json();

      // Check if the login intent matches the user's actual role
      if (intent === 'admin' && roleData.primaryRole !== 'admin') {
          throw new Error('Access denied. Not an admin account.');
      }
      if (intent === 'partner' && roleData.primaryRole !== 'partner') {
          throw new Error('Access denied. Not a partner account.');
      }
       if (intent === 'user' && roleData.primaryRole !== 'user') {
          throw new Error(`This is a ${roleData.primaryRole} account. Please log in through the correct portal.`);
      }


      // Update user state immediately after fetching role
      setUser({
        id: uid,
        name: roleData.name || userCredential.user.displayName,
        email: roleData.email || userCredential.user.email,
        image: userCredential.user.photoURL,
        primaryRole: roleData.primaryRole,
        partnerRole: roleData.partnerRole,
      });

      toast({ title: "Login Successful", description: `Welcome back!` });
      
      // Redirection logic
      if (roleData.primaryRole === 'admin') {
          router.push('/dashboard/admin');
      } else if (roleData.primaryRole === 'partner') {
          if (roleData.partnerRole) {
              switch (roleData.partnerRole) {
                  case 'cabDriver':
                      router.push('/dashboard/cab-driver');
                      break;
                  case 'houseRent':
                      router.push('/dashboard/house-rent');
                      break;
                  case 'agent':
                      router.push('/dashboard/agent');
                      break;
                  default:
                      router.push('/partner/select-role');
              }
          } else {
              router.push('/partner/select-role');
          }
      } else {
          router.push('/dashboard');
      }

    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
        ? "Invalid email or password."
        : error.message || "Login failed. Please try again.";
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
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
      };
      if (primaryRole === 'partner' && partnerRole) {
        rolePayload.partnerRole = partnerRole;
      } else {
        rolePayload.partnerRole = null;
      }
       if (primaryRole === 'admin') {
        rolePayload.primaryRole = 'admin';
        rolePayload.partnerRole = null; // Admins don't have a partner sub-role
      }


      const roleResponse = await fetch(`/api/user-role/${userCredential.user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rolePayload),
      });

      if (!roleResponse.ok) {
        const errorData = await roleResponse.json();
        throw new Error(errorData.message || 'Failed to set user role after signup.');
      }
      
      // After signup, onAuthStateChanged will set the user state.
      // Now, redirect based on the role they signed up with.
      if (primaryRole === 'admin') {
        router.push('/dashboard/admin');
      } else if (primaryRole === 'partner') {
        if (partnerRole) {
          switch (partnerRole) {
              case 'cabDriver':
                  router.push('/dashboard/cab-driver');
                  break;
              case 'houseRent':
                  router.push('/dashboard/house-rent');
                  break;
              case 'agent':
                  router.push('/dashboard/agent');
                  break;
              default:
                  router.push('/partner/select-role'); // Fallback to role selection
          }
        } else {
          router.push('/partner/select-role');
        }
      } else { // 'user'
        router.push('/dashboard');
      }

      // Return a basic user object, full context update comes from onAuthStateChanged
      return {
        id: userCredential.user.uid,
        name,
        email,
        primaryRole,
        partnerRole: rolePayload.partnerRole,
      };
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? "This email is already registered."
        : error.message || "Signup failed. Please try again.";
      toast({ title: "Signup Failed", description: errorMessage, variant: "destructive" });
      throw error; // Re-throw to be caught by AuthModal
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
      // Update Firebase Auth profile (client-side)
      await updateProfile(auth.currentUser, {
        displayName: updatedData.name,
        photoURL: updatedData.image,
      });

      // Update Firestore profile data (backend)
      const response = await fetch(`/api/user-role/${auth.currentUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: updatedData.name, image: updatedData.image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile on the server.');
      }
      
      // Optimistically update local state or re-fetch
      setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
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
      setUser(null); // onAuthStateChanged will also set user to null
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
    if (!user || user.primaryRole !== 'partner') {
      toast({ title: "Error", description: "User is not a partner.", variant: "destructive" });
      return;
    }
    if (!auth.currentUser) {
        toast({ title: "Error", description: "No authenticated user found.", variant: "destructive"});
        return;
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
      // Update local user state
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
