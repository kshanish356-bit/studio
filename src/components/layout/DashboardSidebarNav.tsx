"use client";

import { useAuth } from '@/contexts/AuthContext';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Users, Briefcase, Car, Building, Cog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebarNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard/admin',
      label: 'Admin Overview',
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      href: '/dashboard/admin/users',
      label: 'User Management',
      icon: Users,
      roles: ['admin'],
    },
    {
      href: '/dashboard/admin/partners',
      label: 'Partner Management',
      icon: Briefcase,
      roles: ['admin'],
    },
     {
      href: '/dashboard/admin/settings',
      label: 'System Settings',
      icon: Cog,
      roles: ['admin'],
    },
    {
      href: '/dashboard/agent',
      label: 'Agent Dashboard',
      icon: Briefcase,
      roles: ['agent'],
    },
    {
      href: '/dashboard/cab-driver',
      label: 'Driver Dashboard',
      icon: Car,
      roles: ['cabDriver'],
    },
    {
      href: '/dashboard/house-rent',
      label: 'Property Dashboard',
      icon: Building,
      roles: ['houseRent'],
    },
     {
      href: '/dashboard',
      label: 'User Dashboard',
      icon: LayoutDashboard,
      roles: ['user'],
    }
  ];

  const getVisibleNavItems = () => {
    if (!user) return [];
    if (user.primaryRole === 'admin') {
      return navItems.filter(item => item.roles.includes('admin'));
    }
    if (user.primaryRole === 'partner' && user.partnerRole) {
      return navItems.filter(item => item.roles.includes(user.partnerRole!));
    }
    if (user.primaryRole === 'user') {
       return navItems.filter(item => item.roles.includes('user'));
    }
    return [];
  };

  const visibleItems = getVisibleNavItems();

  return (
    <SidebarMenu>
      {visibleItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
