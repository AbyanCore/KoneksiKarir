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
  FormDescription,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Building2 } from "lucide-react";
import {
  CreateCompanyAccountDto as CreateCompanyAccountSchema,
  CreateCompanyAccountDto as CreateCompanyAccountDtoType,
} from "@/lib/dtos/users/create.company-account.dto";
import { trpc } from "@/components/trpc/trpc-client";
import { toast } from "sonner";

export default function Page_CompanySignup() {
  const router = useRouter();

  const form = useForm<CreateCompanyAccountDtoType>({
    resolver: zodResolver(CreateCompanyAccountSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
      code: "",
    },
  });

  const createCompanyAccountMutation =
    trpc.users.createCompanyAccount.useMutation({
      onSuccess: () => {
        toast.success("Company account created successfully! Please sign in.");
        router.push("/auth/signin");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create account");
      },
    });

  const onSubmit = async (data: CreateCompanyAccountDtoType) => {
    createCompanyAccountMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-t-4 border-t-green-500">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-green-100 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Create Company Account
          </CardTitle>
          <CardDescription className="text-center">
            Sign up as a Company to post jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="company@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Code (OTP)</FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Enter the 6-digit verification code provided by your
                      administrator
                    </FormDescription>
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
                        placeholder="Create a strong password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={createCompanyAccountMutation.isPending}
              >
                {createCompanyAccountMutation.isPending
                  ? "Creating Account..."
                  : "Sign Up"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center space-y-2">
            <Button
              variant="link"
              onClick={() => router.push("/auth/signup")}
              className="text-green-600 hover:text-green-700"
            >
              ← Back to role selection
            </Button>
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/auth/signin")}
                className="p-0 h-auto text-green-600 hover:text-green-700"
              >
                Sign in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
