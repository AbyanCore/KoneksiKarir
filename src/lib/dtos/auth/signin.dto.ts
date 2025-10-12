import z from "zod";

export const SignInDto = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type SignInDto = z.infer<typeof SignInDto>;
