"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/signin");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-t-4 border-t-purple-500">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            KoneksiKarir
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Portal Manajemen Karir
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 relative z-10" />
          </div>
          <p className="text-sm text-slate-600">Redirecting to sign in...</p>
          <Button
            variant="outline"
            onClick={() => router.push("/auth/signin")}
            className="w-full border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            Continue Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
