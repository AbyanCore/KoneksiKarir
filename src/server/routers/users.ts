import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
import z from "zod";
import bcrypt from "bcrypt";
import { CreateJobSeekerAccountDto } from "@/lib/dtos/users/create.jobseeker-account.dto";
import { CreateCompanyAccountDto } from "@/lib/dtos/users/create.company-account.dto";
import { Role } from "@/generated/prisma";

export const usersRouter = router({
  // Define user-related procedures here

  //   Basic CRUD
  findAll: publicProcedure.query(async () => {
    const users = await prisma.user.findMany({
      include: {
        JobSeekerProfile: true,
      },
    });
    return users;
  }),

  findOne: publicProcedure
    .input(
      z.object({
        id: z.string().nonempty("User ID is required"),
      })
    )
    .query(async (opts) => {
      const user = await prisma.user.findUnique({
        where: { id: opts.input.id },
      });
      return user;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().nonempty("User ID is required"),
      })
    )
    .mutation(async (opts) => {
      const deletedUser = await prisma.user.delete({
        where: { id: opts.input.id },
      });
      return deletedUser;
    }),

  //   Custom Usecases
  blockAccount: publicProcedure
    .input(
      z.object({
        id: z.string().nonempty("User ID is required"),
      })
    )
    .mutation(async (opts) => {
      const updatedUser = await prisma.user.update({
        where: { id: opts.input.id },
        data: { is_blocked: true },
      });
      return updatedUser;
    }),

  unBlockAccount: publicProcedure.input(z.string()).mutation(async (opts) => {
    const updatedUser = await prisma.user.update({
      where: { id: opts.input },
      data: { is_blocked: false },
    });
    return updatedUser;
  }),

  createJobSeekerAccount: publicProcedure
    .input(CreateJobSeekerAccountDto)
    .mutation(async (opts) => {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(opts.input.password, 10);

      const newUser = await prisma.user.create({
        data: {
          email: opts.input.email,
          password: hashedPassword,
          role: Role.JOB_SEEKER,
        },
      });
      return newUser;
    }),

  createCompanyAccount: publicProcedure
    .input(CreateCompanyAccountDto)
    .mutation(async (opts) => {
      // check codes in companies
      //   const company = await prisma.company.findUnique({
      //     where: { code: opts.input.code },
      //   });

      //   if (!company) {
      //     throw new Error("Invalid company code");
      //   }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(opts.input.password, 10);

      // assume code is valid for now
      const newUser = await prisma.user.create({
        data: {
          email: opts.input.email,
          password: hashedPassword,
          role: Role.ADMIN_COMPANY,
        },
      });
      return newUser;
    }),

  findAllJobSeekers: publicProcedure.query(async () => {
    const users = await prisma.user.findMany({
      where: { role: Role.JOB_SEEKER },
      include: {
        JobSeekerProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return users;
  }),

  findAllAdminCompanies: publicProcedure.query(async () => {
    const users = await prisma.user.findMany({
      where: { role: Role.ADMIN_COMPANY },
      orderBy: { createdAt: "desc" },
    });
    return users;
  }),

  toggleBlockAccount: publicProcedure
    .input(
      z.object({
        id: z.string().nonempty("User ID is required"),
        isBlocked: z.boolean(),
      })
    )
    .mutation(async (opts) => {
      const updatedUser = await prisma.user.update({
        where: { id: opts.input.id },
        data: { is_blocked: opts.input.isBlocked },
      });
      return updatedUser;
    }),
});
