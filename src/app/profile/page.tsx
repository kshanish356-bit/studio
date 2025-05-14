
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { UserCircle, Mail, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  // For avatar upload, a more complex solution is needed (e.g., uploading to a server)
  // For this example, we'll just allow changing the placeholder URL or a base64 string if desired.
  const [avatarUrl, setAvatarUrl] = useState(user?.image || ''); 
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/'); // Redirect to home if not authenticated
      toast({ title: "Access Denied", description: "Please log in to view your profile.", variant: "destructive"});
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.image || `https://placehold.co/128x128.png?text=${user.name?.substring(0,2).toUpperCase() || 'U'}`);
    }
  }, [user, isAuthenticated, isLoading, router, toast]);

  const handleSave = () => {
    if (!name.trim()) {
        toast({ title: "Error", description: "Name cannot be empty.", variant: "destructive"});
        return;
    }
    updateUser({ name, email, image: avatarUrl }); // Email update might need verification in a real app
    setIsEditing(false);
    toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
  };
  
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
     return <div className="container mx-auto px-4 py-16 text-center">Please log in to view your profile.</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <UserCircle size={64} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl">Your Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage src={avatarUrl} alt={user.name} data-ai-hint="avatar person" />
              <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="w-full max-w-xs">
                <Label htmlFor="avatarFile">Change Avatar (Upload)</Label>
                <Input id="avatarFile" type="file" accept="image/*" onChange={handleAvatarUpload} />
                 <Label htmlFor="avatarUrl" className="mt-2 block">Or enter Image URL</Label>
                <Input id="avatarUrl" type="text" placeholder="Image URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Email change might require verification in a real app.</p>
              </div>
              <div className="flex space-x-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-secondary rounded-md">
                <UserCircle className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-secondary rounded-md">
                <Mail className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
               <div className="flex items-center space-x-3 p-3 bg-secondary rounded-md">
                <UserCircle className="text-primary" /> {/* Placeholder for role or other info */}
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{user.role || 'User'}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="w-full mt-6">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
