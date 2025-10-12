import z from "zod";
import { CreateEventDto } from "./create.event.dto";

export const UpdateEventDto = CreateEventDto.partial().extend({
  id: z.number().min(1, "Event ID must be a positive number"),
});

export type UpdateEventDto = z.infer<typeof UpdateEventDto>;
