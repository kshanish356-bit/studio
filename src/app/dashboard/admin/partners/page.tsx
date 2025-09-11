"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Partner {
  id: string;
  name: string;
  email: string;
  partnerRole: string;
  createdAt: string;
}

export default function AdminPartnersPage() {
  const { user: adminUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!adminUser || adminUser.primaryRole !== 'admin') {
        toast({ title: "Access Denied", description: "You are not authorized to view this page.", variant: "destructive" });
        router.push('/dashboard');
      } else {
        fetchPartners();
      }
    }
  }, [adminUser, authLoading, router, toast]);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      // Reusing the users endpoint and filtering on the client for simplicity.
      // In a real app, you might have a dedicated `/api/admin/partners` endpoint.
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }
      const allUsers = await response.json();
      const partnerUsers = allUsers.filter((u: any) => u.primaryRole === 'partner');
      setPartners(partnerUsers);
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch partner data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPartners = useMemo(() => {
    if (!searchTerm) return partners;
    return partners.filter(partner =>
      partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.partnerRole?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [partners, searchTerm]);
  
  const handleEditPartner = (partnerId: string) => {
    toast({ title: "Action", description: `Edit partner ${partnerId} (not implemented).` });
  };
  
  const handleDeletePartner = (partnerId: string) => {
    toast({ title: "Action", description: `Delete partner ${partnerId} (not implemented).`, variant: "destructive" });
  };


  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Briefcase className="mr-2" /> Partner Management</CardTitle>
            <CardDescription>View, search, and manage all partners on the platform.</CardDescription>
            <div className="mt-4">
              <Input
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner Name</TableHead>
                  <TableHead>Partner Type</TableHead>
                  <TableHead>Joined At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.length > 0 ? (
                  filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="font-medium">{partner.name}</div>
                        <div className="text-sm text-muted-foreground">{partner.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{partner.partnerRole}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(partner.createdAt).toLocaleDateString()}
                      </TableCell>
                       <TableCell className="text-right">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon">
                               <MoreHorizontal className="h-4 w-4" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleEditPartner(partner.id)}>
                               <Edit className="mr-2 h-4 w-4" /> Edit
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleDeletePartner(partner.id)} className="text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No partners found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
