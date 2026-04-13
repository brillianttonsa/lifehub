'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  Calendar,
  Wallet,
  FolderKanban,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Users,
  Plus,
  Palette,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { LifeHubLogo } from './lifehub-logo';
import { cn } from '@/lib/utils';

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Habits',
    href: '/dashboard/habits',
    icon: Target,
  },
  {
    title: 'Plans',
    href: '/dashboard/plans',
    icon: Calendar,
  },
  {
    title: 'Pocket',
    href: '/dashboard/pocket',
    icon: Wallet,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { logout, workspaces, currentWorkspace, selectWorkspace, user } = useAuth();
  const { theme, setTheme, themes } = useTheme();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <LifeHubLogo className="h-8 w-8" />
          <span className="font-semibold text-lg text-sidebar-foreground">
            LifeHub
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Workspace Selector */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors">
                  <div className="flex items-center justify-center h-8 w-8 rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                    {currentWorkspace?.type === 'PERSONAL' ? (
                      <Building2 className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 text-left truncate">
                    <p className="text-sm font-medium truncate">
                      {currentWorkspace?.name || 'Select Workspace'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 capitalize">
                      {currentWorkspace?.type?.toLowerCase() || 'None'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {workspaces.map((membership) => (
                  <DropdownMenuItem
                    key={membership.workspace.id}
                    onClick={() => selectWorkspace(membership.workspace.id)}
                    className={cn(
                      'cursor-pointer',
                      currentWorkspace?.id === membership.workspace.id &&
                        'bg-accent'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary">
                        {membership.workspace.type === 'PERSONAL' ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {membership.workspace.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {membership.role.toLowerCase()} -{' '}
                          {membership.workspace.type.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.href ||
                      (item.href !== '/dashboard' &&
                        pathname.startsWith(item.href))
                    }
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Theme Selector */}
        <SidebarGroup>
          <SidebarGroupLabel>Theme</SidebarGroupLabel>
          <SidebarGroupContent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground">
                  <Palette className="h-4 w-4" />
                  <span className="flex-1 text-left text-sm">
                    {themes.find((t) => t.value === theme)?.label || 'System'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {themes.map((t) => (
                  <DropdownMenuItem
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'cursor-pointer',
                      theme === t.value && 'bg-accent'
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                  {user?.fullName ? getInitials(user.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
