
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { UserCircle, Mail, Edit3, LogOutIcon, Users, Settings2, TrainFront, Trash2, UserPlus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface SavedTraveller {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
}

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated, isLoading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.image || '');
  const { toast } = useToast();
  const router = useRouter();

  // State for new sections
  const [savedTravellers, setSavedTravellers] = useState<SavedTraveller[]>([
    { id: '1', name: 'Jane Doe', age: 30, gender: 'Female' },
    { id: '2', name: 'John Jr.', age: 5, gender: 'Male' },
  ]);
  const [mealPreference, setMealPreference] = useState('any');
  const [seatPreference, setSeatPreference] = useState('any');
  const [specialAssistance, setSpecialAssistance] = useState(false);
  const [irctcUsername, setIrctcUsername] = useState('');


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      toast({ title: "Access Denied", description: "Please log in to view your profile.", variant: "destructive" });
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.image || 'https://placehold.co/128x128.png');
      // In a real app, fetch savedTravellers, preferences, and IRCTC username from backend
    }
  }, [user, isAuthenticated, isLoading, router, toast]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Name cannot be empty.", variant: "destructive" });
      return;
    }
    updateUser({ name, email, image: avatarUrl });
    setIsEditing(false);
    toast({ title: "Profile Updated", description: "Your personal information has been updated." });
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

  const handleLogout = () => {
    logout();
  };

  const handleAddTraveller = () => {
    // Placeholder: In a real app, this would open a form/modal
    toast({ title: "Add Traveller", description: "Functionality to add a new traveller will be implemented here." });
    // Example of adding a mock traveller:
    // setSavedTravellers([...savedTravellers, {id: Date.now().toString(), name: "New Traveller", age: 0, gender: "Other"}]);
  };

  const handleRemoveTraveller = (travellerId: string) => {
    // Placeholder
    setSavedTravellers(savedTravellers.filter(t => t.id !== travellerId));
    toast({ title: "Traveller Removed", description: "Traveller has been removed (mock action)." });
  };
  
  const handleSavePreferences = () => {
     // Placeholder: In a real app, save to backend
    toast({ title: "Preferences Saved", description: "Your travel preferences have been saved (mock action)." });
  }

  const handleSaveIrctcUsername = () => {
    // Placeholder: In a real app, save to backend
    if (!irctcUsername.trim()) {
      toast({ title: "IRCTC Username Required", description: "Please enter your IRCTC username.", variant: "destructive" });
      return;
    }
    toast({ title: "IRCTC Username Saved", description: `Username ${irctcUsername} linked (mock action).` });
  }


  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="container mx-auto px-4 py-16 text-center">Please log in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8">
      {/* Personal Information Card */}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <UserCircle size={64} className="mx-auto mb-4 text-primary" />
          <CardTitle className="text-3xl">Your Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32 border-4 border-primary">
              <AvatarImage src={avatarUrl} alt={user.name || "User"} data-ai-hint="avatar person" />
              <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="w-full max-w-xs">
                <Label htmlFor="avatarFile">Change Avatar (Upload)</Label>
                <Input id="avatarFile" type="file" accept="image/*" onChange={handleAvatarUpload} />
                <Label htmlFor="avatarUrl" className="mt-2 block">Or enter Image URL</Label>
                <Input id="avatarUrl" type="text" placeholder="Image URL" value={avatarUrl.startsWith('https://placehold.co') ? '' : avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
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
              <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md">
                <UserCircle className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md">
                <Mail className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md">
                <UserCircle className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{user.primaryRole || 'User'} {user.partnerRole ? `(${user.partnerRole})` : ''}</p>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)} className="w-full mt-6">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            <LogOutIcon className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </CardFooter>
      </Card>

      {/* Saved Travellers Card */}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><Users className="mr-3 text-primary" /> Saved Travellers</CardTitle>
          <CardDescription>Manage your list of frequent travellers for faster bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {savedTravellers.length > 0 ? (
            <ul className="space-y-3">
              {savedTravellers.map(traveller => (
                <li key={traveller.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                  <div>
                    <p className="font-medium">{traveller.name}</p>
                    <p className="text-sm text-muted-foreground">{traveller.age} years, {traveller.gender}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => toast({title: "Edit Traveller", description: "Edit functionality placeholder."})}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTraveller(traveller.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No saved travellers yet. Add one for faster bookings!</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddTraveller} className="w-full">
            <UserPlus className="mr-2 h-4 w-4" /> Add New Traveller
          </Button>
        </CardFooter>
      </Card>

      {/* Travel Preferences Card */}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><Settings2 className="mr-3 text-primary" /> Travel Preferences</CardTitle>
          <CardDescription>Customize your general travel preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mealPreference">Meal Preference</Label>
            <Select value={mealPreference} onValueChange={setMealPreference}>
              <SelectTrigger id="mealPreference">
                <SelectValue placeholder="Select meal preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="veg">Vegetarian</SelectItem>
                <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="jain">Jain Meal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="seatPreference">Seat Preference (Flights/Trains)</Label>
            <Select value={seatPreference} onValueChange={setSeatPreference}>
              <SelectTrigger id="seatPreference">
                <SelectValue placeholder="Select seat preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="window">Window</SelectItem>
                <SelectItem value="aisle">Aisle</SelectItem>
                <SelectItem value="lower">Lower Berth (Trains)</SelectItem>
                <SelectItem value="upper">Upper Berth (Trains)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="specialAssistance" checked={specialAssistance} onCheckedChange={(checked) => setSpecialAssistance(!!checked)} />
            <Label htmlFor="specialAssistance">Require Special Assistance (e.g., wheelchair)</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSavePreferences} className="w-full">
             <Save className="mr-2 h-4 w-4" /> Save Preferences
          </Button>
        </CardFooter>
      </Card>

      {/* IRCTC Account Details Card */}
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl"><TrainFront className="mr-3 text-primary" /> IRCTC Account Details</CardTitle>
          <CardDescription>Link your IRCTC account for faster train bookings in India.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="irctcUsername">IRCTC Username</Label>
            <Input 
              id="irctcUsername" 
              value={irctcUsername} 
              onChange={(e) => setIrctcUsername(e.target.value)} 
              placeholder="Enter your IRCTC username" 
            />
             <p className="text-xs text-muted-foreground mt-1">We will never ask for your IRCTC password.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveIrctcUsername} className="w-full">
            Link IRCTC Account
          </Button>
        </CardFooter>
      </Card>

    </div>
  );
}
