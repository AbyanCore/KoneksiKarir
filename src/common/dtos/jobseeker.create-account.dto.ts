import z from "zod";

export const CreateJobSeekerAccountDto = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    passwordConfirmation: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type CreateJobSeekerAccountDto = z.infer<
  typeof CreateJobSeekerAccountDto
>;
