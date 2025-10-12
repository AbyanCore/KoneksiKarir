import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
import z from "zod";

export const jobsRouter = router({
  // Get all jobs for a specific event with company details
  findByEvent: publicProcedure
    .input(
      z.object({
        eventId: z.number().min(1, "Event ID is required"),
      })
    )
    .query(async (opts) => {
      const { eventId } = opts.input;

      const jobs = await prisma.job.findMany({
        where: {
          eventId,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
              website: true,
              location: true,
              logoUrl: true,
              EventCompanyParticipation: {
                where: {
                  eventId,
                },
                select: {
                  standNumber: true,
                },
              },
            },
          },
          _count: {
            select: {
              Application: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform to include stand number and application count
      return jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        tags: job.tags,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        isRemote: job.isRemote,
        applicationCount: job._count.Application,
        company: {
          id: job.company.id,
          name: job.company.name,
          description: job.company.description,
          website: job.company.website,
          location: job.company.location,
          logoUrl: job.company.logoUrl,
          standNumber:
            job.company.EventCompanyParticipation[0]?.standNumber || "N/A",
        },
      }));
    }),

  // Get job detail by ID
  findById: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Job ID is required"),
      })
    )
    .query(async (opts) => {
      const { id } = opts.input;

      const job = await prisma.job.findUnique({
        where: {
          id,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
              website: true,
              location: true,
              logoUrl: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
          _count: {
            select: {
              Application: true,
            },
          },
        },
      });

      if (!job) {
        throw new Error("Job not found");
      }

      return {
        ...job,
        applicationCount: job._count.Application,
      };
    }),

  // Get jobs grouped by company for an event
  findByEventGroupedByCompany: publicProcedure
    .input(
      z.object({
        eventId: z.number().min(1, "Event ID is required"),
      })
    )
    .query(async (opts) => {
      const { eventId } = opts.input;

      const companies = await prisma.company.findMany({
        where: {
          EventCompanyParticipation: {
            some: {
              eventId,
            },
          },
        },
        include: {
          EventCompanyParticipation: {
            where: {
              eventId,
            },
            select: {
              standNumber: true,
            },
          },
          jobs: {
            where: {
              eventId,
            },
            include: {
              _count: {
                select: {
                  Application: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return companies.map((company) => ({
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        standNumber: company.EventCompanyParticipation[0]?.standNumber || "N/A",
        jobCount: company.jobs.length,
        jobs: company.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          tags: job.tags,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          applicationCount: job._count.Application,
        })),
      }));
    }),
});
