"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

interface LogoAppProps {
  href?: string;
  clickable?: boolean;
}

export default function LogoApp({
  href = "/s/hub",
  clickable = true,
}: LogoAppProps) {
  const router = useRouter();

  const handleClick = () => {
    if (clickable) {
      router.push(href);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 ${
        clickable ? "cursor-pointer group" : ""
      }`}
      onClick={handleClick}
    >
      {/* Logo Icon Container */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300" />
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
          <Briefcase
            className="h-5 w-5 text-white drop-shadow-sm"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Brand Section */}
      <div className="flex items-center">
        <div className="flex flex-col leading-none relative">
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-800 transition-all duration-300">
            KoneksiKarir
          </span>

          <Badge className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 font-mono text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border-0">
            ISO JOS
          </Badge>
        </div>
      </div>
    </div>
  );
}
