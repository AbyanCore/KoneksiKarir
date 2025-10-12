import { z } from "zod";

export const UpdateJobSeekerProfileDto = z.object({
  userId: z.string().min(1, "User ID is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().optional(),
  lastEducationLevel: z.string().optional(),
  graduationYear: z.number().int().min(1900).max(2100).optional().nullable(),
  institutionName: z.string().optional(),
  skills: z.array(z.string()).default([]),
  socialLinks: z
    .array(
      z.object({
        type: z.string(),
        url: z.string().url("Invalid URL format"),
      })
    )
    .default([]),
  resumeUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
  NIK: z.string().optional(),
  phoneNumber: z.array(z.string()).default([]),
});

export type UpdateJobSeekerProfileDtoType = z.infer<
  typeof UpdateJobSeekerProfileDto
>;
