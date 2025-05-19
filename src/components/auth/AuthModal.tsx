
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthFormType = 'login' | 'signup' | 'reset';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthFormType>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  // Form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [isPartnerSignup, setIsPartnerSignup] = useState(false); // For partner signup
  const [resetEmail, setResetEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('login'); // Reset to login tab when modal opens
      setLoginIdentifier('');
      setLoginPassword('');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setIsPartnerSignup(false);
      setResetEmail('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleSignupPasswordVisibility = () => setShowSignupPassword(!showSignupPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      toast({ title: "Error", description: "Please enter both email/phone and password.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.login(loginIdentifier, loginPassword);
      // Success toast and redirection are handled by AuthContext and AppHeader
      onClose();
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid credentials or server error.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({ title: "Error", description: "All fields are required for signup.", variant: "destructive" });
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const primaryRoleToSet = isPartnerSignup ? 'partner' : 'user';
      await auth.signup(signupEmail, signupPassword, signupName, primaryRoleToSet);
      toast({ title: "Signup Successful!", description: "Your account has been created. Redirecting..." });
      onClose(); // Close modal, redirection will be handled by AppHeader based on AuthContext
      // router.push('/'); // Explicitly go to home, AppHeader logic will then redirect
    } catch (error: any) {
      console.error("Signup error in modal:", error);
      toast({ title: "Signup Failed", description: error.message || "Could not create account.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "Error", description: "Please enter your email.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await auth.resetPassword(resetEmail);
      toast({ title: "Password Reset", description: "If this email is registered, a reset link has been sent." });
      setActiveTab('login');
    } catch (error: any) {
       toast({ title: "Password Reset Failed", description: error.message || "Could not send reset email.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl text-center">Welcome Back</DialogTitle>
      </DialogHeader>
      <div>
        <Label htmlFor="loginIdentifier">Email</Label>
        <Input id="loginIdentifier" type="email" placeholder="Enter your email" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="loginPassword">Password</Label>
        <div className="relative">
          <Input id="loginPassword" type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
          <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7" onClick={togglePasswordVisibility} tabIndex={-1}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting || auth.isLoading}>
        {(isSubmitting || auth.isLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Login
      </Button>
      <DialogFooter className="flex-col space-y-2 sm:flex-col sm:space-y-2 pt-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account? <Button variant="link" type="button" onClick={() => setActiveTab('signup')} className="p-0 h-auto">Sign up</Button>
        </p>
        <p className="text-sm text-muted-foreground">
          <Button variant="link" type="button" onClick={() => setActiveTab('reset')} className="p-0 h-auto">Forgot Password?</Button>
        </p>
      </DialogFooter>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSignupSubmit} className="space-y-4">
      {/* Removed DialogHeader for Create Account title */}
      <div>
        <Label htmlFor="signupName">Full Name</Label>
        <Input id="signupName" type="text" placeholder="Full Name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="signupEmail">Email</Label>
        <Input id="signupEmail" type="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="signupPassword">Password</Label>
        <div className="relative">
          <Input id="signupPassword" type={showSignupPassword ? 'text' : 'password'} placeholder="Password (min. 6 characters)" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
          <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7" onClick={toggleSignupPasswordVisibility} tabIndex={-1}>
            {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="signupConfirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input id="signupConfirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
           <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7" onClick={toggleConfirmPasswordVisibility} tabIndex={-1}>
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="partnerSignup" checked={isPartnerSignup} onCheckedChange={(checked) => setIsPartnerSignup(checked as boolean)} />
        <Label htmlFor="partnerSignup" className="text-sm font-normal">
          Sign up as a Partner (e.g., Cab Driver, Travel Agent)
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting || auth.isLoading}>
        {(isSubmitting || auth.isLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign Up
      </Button>
      <DialogFooter className="pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account? <Button variant="link" type="button" onClick={() => setActiveTab('login')} className="p-0 h-auto">Login</Button>
        </p>
      </DialogFooter>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handleResetSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl text-center">Reset Password</DialogTitle>
      </DialogHeader>
      <div>
        <Label htmlFor="resetEmail">Email</Label>
        <Input id="resetEmail" type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting || auth.isLoading}>
        {(isSubmitting || auth.isLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Send Reset Link
      </Button>
      <DialogFooter className="pt-4">
        <p className="text-sm text-muted-foreground">
          Remembered your password? <Button variant="link" type="button" onClick={() => setActiveTab('login')} className="p-0 h-auto">Login</Button>
        </p>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background/70">
        <div className="auth-tabs flex justify-center mb-6 border-b border-border/50">
          <button
            className={`tab-btn px-4 py-2 text-lg font-medium ${activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`tab-btn px-4 py-2 text-lg font-medium ${activeTab === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>
        {activeTab === 'login' && renderLoginForm()}
        {activeTab === 'signup' && renderSignupForm()}
        {activeTab === 'reset' && renderResetForm()}
      </DialogContent>
    </Dialog>
  );
}
