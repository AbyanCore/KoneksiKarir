import z from "zod";

export const CreateCompanyAccountDto = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    passwordConfirmation: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    code: z
      .string()
      .min(6, "Code must be at least 6 characters long")
      .max(6, "Code must be at most 6 characters long"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type CreateCompanyAccountDto = z.infer<typeof CreateCompanyAccountDto>;
