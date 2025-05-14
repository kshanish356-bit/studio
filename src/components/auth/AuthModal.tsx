
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  const { login } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('login'); // Reset to login tab when modal opens
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, you would call your backend API here
    // For demo, let's assume login is successful with any non-empty credentials
    const mockUser = { id: '1', name: signupName || loginIdentifier.split('@')[0] || "Demo User", email: loginIdentifier, image: `https://placehold.co/100x100.png?text=${(signupName || loginIdentifier.split('@')[0] || "DU").substring(0,2).toUpperCase()}` };
    login(mockUser);
    setIsSubmitting(false);
    onClose();
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, you would call your backend API here
    toast({ title: "Signup Successful", description: "Please login with your new account." });
    setActiveTab('login');
    setIsSubmitting(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "Error", description: "Please enter your email.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Password Reset", description: "If this email is registered, a reset link will be sent." });
    setActiveTab('login');
    setIsSubmitting(false);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-2xl text-center">Welcome Back</DialogTitle>
      </DialogHeader>
      <div>
        <Label htmlFor="loginIdentifier">Email or Phone Number</Label>
        <Input id="loginIdentifier" type="text" placeholder="Enter email or phone number" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="loginPassword">Password</Label>
        <div className="relative">
          <Input id="loginPassword" type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
          <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7" onClick={togglePasswordVisibility}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</Button>
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
      <DialogHeader>
        <DialogTitle className="text-2xl text-center">Create Account</DialogTitle>
      </DialogHeader>
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
          <Input id="signupPassword" type={showSignupPassword ? 'text' : 'password'} placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
          <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7" onClick={toggleSignupPasswordVisibility}>
            {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="signupConfirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input id="signupConfirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
           <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 transform -translate-y-1/2 h-7 w-7" onClick={toggleConfirmPasswordVisibility}>
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing up...' : 'Sign Up'}</Button>
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
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
      <DialogFooter className="pt-4">
        <p className="text-sm text-muted-foreground">
          Remembered your password? <Button variant="link" type="button" onClick={() => setActiveTab('login')} className="p-0 h-auto">Login</Button>
        </p>
      </DialogFooter>
    </form>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="auth-tabs flex justify-center mb-6 border-b">
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
