"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { LayoutDashboard, Calendar, Users, Building2 } from "lucide-react";
import Link from "next/link";

export default function UI_AdminSidebar() {
  const menuItems = [
    {
      label: "Main Dashboard",
      icon: LayoutDashboard,
      href: "/s/admin/dashboard",
      color: "bg-indigo-500/20",
    },
    {
      label: "Manage Events",
      icon: Calendar,
      href: "/s/admin/events",
      color: "bg-purple-500/20",
    },
    {
      label: "Manage Users",
      icon: Users,
      href: "/s/admin/users",
      color: "bg-pink-500/20",
    },
    {
      label: "Manage Companies",
      icon: Building2,
      href: "/s/admin/companies",
      color: "bg-blue-500/20",
    },
  ];

  return (
    <TooltipProvider>
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-full shadow-2xl p-2 flex flex-col items-center gap-1 border border-black/5">
          {/* Menu items */}
          <div className="flex flex-col items-center gap-1">
            {menuItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link href={item.href} passHref>
                    <Button
                      variant="ghost"
                      className={`text-black/80 ${item.color} hover:scale-110 transition-all rounded-full w-10 h-10 p-0`}
                    >
                      <item.icon className="h-5 w-5" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-slate-900 text-white"
                >
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
