import z from "zod";
import { CreateCompanyDto } from "./create.company.dto";

export const UpdateCompanyDto = CreateCompanyDto.partial().extend({
  id: z.number().min(1, "Company ID must be a positive number"),
});

export type UpdateCompanyDto = z.infer<typeof UpdateCompanyDto>;
