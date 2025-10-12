import { z } from "zod";

export const CreateApplicationDto = z.object({
  jobId: z.number().min(1, "Job ID is required"),
  jobSeekerId: z.string().min(1, "Job seeker ID is required"),
});

export type CreateApplicationDto = z.infer<typeof CreateApplicationDto>;
