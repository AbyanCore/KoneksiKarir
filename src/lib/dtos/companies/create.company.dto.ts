import z from "zod";

export const CreateCompanyDto = z.object({
  name: z.string().min(1, "Company name is required"),
  code: z
    .string()
    .length(6, "Company code must be exactly 6 characters")
    .toUpperCase(),
  description: z.string().min(1, "Description is required"),
  website: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  logoUrl: z.string().optional(),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanyDto>;
