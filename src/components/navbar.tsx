"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Activity,
  LogOut,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import LogoApp from "@/components/LogoApp";
import Link from "next/link";

export default function NavBar() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Determine navigation items based on role
  const getNavigationItems = () => {
    if (user.role === "JOB_SEEKER") {
      return [
        {
          icon: User,
          label: "Profile",
          onClick: () => router.push("/s/profile"),
        },
        {
          icon: Activity,
          label: "Activity",
          onClick: () => router.push("/s/activity"),
        },
      ];
    } else if (user.role === "ADMIN_COMPANY") {
      return [
        {
          icon: Building2,
          label: "Company Profile",
          onClick: () => router.push("/s/company/profile"),
        },
        {
          icon: LayoutDashboard,
          label: "Company Dashboard",
          onClick: () => router.push("/s/company/dashboard"),
        },
      ];
    }
    // For ADMIN and other roles, no specific nav items
    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white/50 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <LogoApp href="/s/hub" clickable={true} />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border-2 border-purple-200">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInitials(user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.email.split("@")[0]}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link
                  className="cursor-pointer flex items-center"
                  href="/s/hub"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Back to Hub</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={index}
                    className="cursor-pointer"
                    onClick={item.onClick}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
              {navigationItems.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
