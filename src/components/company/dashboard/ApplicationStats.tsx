"use client";

import { Card } from "@/components/ui/card";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";

interface ApplicationStatsProps {
  totalApplications: number;
  stats?: {
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export default function ApplicationStats({
  totalApplications,
  stats,
}: ApplicationStatsProps) {
  const statItems = [
    {
      label: "Total Applications",
      value: totalApplications,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Pending Review",
      value: stats?.pending || 0,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
      iconBg: "bg-yellow-100",
    },
    {
      label: "Accepted",
      value: stats?.accepted || 0,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      label: "Rejected",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
      iconBg: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`p-6 ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
