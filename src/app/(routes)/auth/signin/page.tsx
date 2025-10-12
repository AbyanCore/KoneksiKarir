"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LogIn } from "lucide-react";
import { SignInDto } from "@/lib/dtos/auth/signin.dto";
import { trpc } from "@/components/trpc/trpc-client";
import { toast } from "sonner";

export default function Page_AuthSignin() {
  const router = useRouter();
  const signIn = trpc.auth.signIn.useMutation();

  const form = useForm<SignInDto>({
    resolver: zodResolver(SignInDto),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = (data: SignInDto) => {
    signIn.mutate(data, {
      onSuccess: (data) => {
        toast.success("Signed in successfully. Redirecting...");
        if (data.role === "ADMIN") {
          router.push("/s/admin/dashboard");
        } else {
          router.push("/s/hub");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Sign in failed. Please try again.");
        console.error("Sign in error:", error);
      },
    });
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-t-4 border-t-blue-500">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your KoneksiKarir account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignIn)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
