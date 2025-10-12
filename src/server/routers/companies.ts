import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
import z from "zod";
import { CreateCompanyDto } from "@/lib/dtos/companies/create.company.dto";
import { UpdateCompanyDto } from "@/lib/dtos/companies/update.company.dto";

export const companiesRouter = router({
  // Define company-related procedures here

  //   Basic CRUD

  findAll: publicProcedure.query(async () => {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            EventCompanyParticipation: true,
            jobs: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return companies;
  }),

  findAllWithStats: publicProcedure.query(async () => {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            EventCompanyParticipation: true,
            jobs: true,
          },
        },
        jobs: {
          select: {
            id: true,
            Application: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to include application count
    return companies.map((company) => ({
      ...company,
      applicationCount: company.jobs.reduce(
        (sum, job) => sum + job.Application.length,
        0
      ),
    }));
  }),

  findOne: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Company ID must be a positive number"),
      })
    )
    .query(async (opts) => {
      const company = await prisma.company.findFirst({
        where: {
          id: opts.input.id,
        },
      });
      return company;
    }),

  findOneWithDetails: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Company ID must be a positive number"),
      })
    )
    .query(async (opts) => {
      const company = await prisma.company.findFirst({
        where: {
          id: opts.input.id,
        },
        include: {
          _count: {
            select: {
              EventCompanyParticipation: true,
              jobs: true,
            },
          },
          EventCompanyParticipation: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  date: true,
                },
              },
            },
          },
          jobs: {
            include: {
              _count: {
                select: {
                  Application: true,
                },
              },
              event: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      if (!company) return null;

      // Transform to group jobs by event
      const participatingEvents = company.EventCompanyParticipation.map(
        (participation) => {
          const eventJobs = company.jobs.filter(
            (job) => job.event.id === participation.event.id
          );

          return {
            id: participation.event.id,
            title: participation.event.title,
            standNumber: participation.standNumber,
            date: participation.event.date,
            jobs: eventJobs.map((job) => ({
              id: job.id,
              title: job.title,
              applicants: job._count.Application,
            })),
          };
        }
      );

      const applicationCount = company.jobs.reduce(
        (sum, job) => sum + job._count.Application,
        0
      );

      return {
        ...company,
        applicationCount,
        participatingEvents,
      };
    }),

  create: publicProcedure.input(CreateCompanyDto).mutation(async (opts) => {
    const company = await prisma.company.create({
      data: {
        name: opts.input.name,
        description: opts.input.description,
        code: opts.input.code,
        website: opts.input.website,
        logoUrl: opts.input.logoUrl,
        location: opts.input.location,
      },
    });
    return company;
  }),

  update: publicProcedure.input(UpdateCompanyDto).mutation(async (opts) => {
    const { id, ...datas } = opts.input;

    const company = await prisma.company.update({
      where: {
        id: opts.input.id,
      },
      data: {
        ...datas,
      },
    });

    return company;
  }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Company ID must be a positive number"),
      })
    )
    .mutation(async (opts) => {
      const company = await prisma.company.delete({
        where: {
          id: opts.input.id,
        },
      });
      return company;
    }),

  //   Custom Usecases
  regenerateCompanyCode: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Company ID must be a positive number"),
      })
    )
    .mutation(async (opts) => {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updatedCompany = await prisma.company.updateMany({
        where: {
          id: opts.input.id,
        },
        data: {
          code: newCode,
        },
      });
      return updatedCompany;
    }),
});
