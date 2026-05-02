import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarMenuAction } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Plus, Building2 } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    // Access the shared business data from your Inertia middleware
    const { auth } = usePage().props as any;
    console.log(auth)
    const businesses = auth.businessProfiles || [];

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {/* Dynamic Business List Section */}
                <SidebarGroup>
                    <SidebarGroupLabel>Your Businesses</SidebarGroupLabel>
                    <SidebarMenu>
                        {businesses.map((business: any) => (
                            <SidebarMenuItem key={business.id}>
                                <SidebarMenuButton asChild>
                                    <Link href={`/business/${business.id}/dashboard`}>
                                        <Building2 className="mr-2 h-4 w-4" />
                                        <span>{business.business_name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}

                        {/* Add New Business Link */}
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild className="text-sidebar-foreground/60">
                                <Link href="/business/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    <span>Add New Business</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}