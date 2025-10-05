"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building2, UserCircle } from "lucide-react";

export default function Page_AuthSignup() {
  const router = useRouter();

  const handleRoleSelection = (role: string) => {
    router.push(`/auth/signup/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Choose your account type to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-20 flex items-center justify-start gap-4 text-left hover:bg-green-50 hover:border-green-300 transition-colors"
            onClick={() => handleRoleSelection("company")}
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-base">Company</div>
              <div className="text-sm text-muted-foreground">
                Post jobs and hire talent
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-20 flex items-center justify-start gap-4 text-left hover:bg-purple-50 hover:border-purple-300 transition-colors"
            onClick={() => handleRoleSelection("jobseeker")}
          >
            <div className="bg-purple-100 p-2 rounded-lg">
              <UserCircle className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-base">Job Seeker</div>
              <div className="text-sm text-muted-foreground">
                Find your dream job
              </div>
            </div>
          </Button>

          <div className="pt-4 text-center">
            <Button variant="link" onClick={() => router.push("/auth/signin")}>
              Already have an account? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
