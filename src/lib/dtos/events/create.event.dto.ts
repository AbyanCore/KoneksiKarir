import z from "zod";

export const CreateEventDto = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(1, "Description is required"),
  bannerUrl: z.string().min(1, "Banner URL is required"),
  minimapUrl: z.string().min(1, "Minimap URL is required"),
  date: z.coerce.date(),
  location: z.string().min(1, "Location is required"),
});

export type CreateEventDto = z.infer<typeof CreateEventDto>;
