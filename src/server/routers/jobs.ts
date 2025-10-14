import prisma from "@/lib/prisma";
import { publicProcedure, router, companyProcedure } from "../trpc";
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

  // Create a new job (company procedure)
  create: companyProcedure
    .input(
      z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z.string().optional(),
        location: z.string().optional(),
        tags: z.array(z.string()).default([]),
        salaryMin: z.number().optional(),
        salaryMax: z.number().min(0, "Maximum salary must be positive"),
        isRemote: z.boolean().default(false),
        eventId: z.number().min(1, "Event ID is required"),
      })
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;

      // Get company from admin profile
      const adminProfile = await prisma.adminCompanyProfile.findUnique({
        where: { userId: ctx.user.userId },
        include: { company: true },
      });

      if (!adminProfile) {
        throw new Error("Company profile not found");
      }

      // Check if company is participating in this event
      const participation =
        await prisma.eventCompanyParticipation.findUnique({
          where: {
            eventId_companyId: {
              eventId: input.eventId,
              companyId: adminProfile.companyId,
            },
          },
        });

      if (!participation) {
        throw new Error(
          "Your company is not participating in this event. Please join the event first."
        );
      }

      // Create the job
      const job = await prisma.job.create({
        data: {
          title: input.title,
          description: input.description,
          location: input.location,
          tags: input.tags,
          salaryMin: input.salaryMin,
          salaryMax: input.salaryMax,
          isRemote: input.isRemote,
          eventId: input.eventId,
          companyId: adminProfile.companyId,
        },
        include: {
          company: true,
          event: true,
        },
      });

      return job;
    }),

  // Update a job (company procedure)
  update: companyProcedure
    .input(
      z.object({
        id: z.number().min(1, "Job ID is required"),
        title: z.string().min(3, "Title must be at least 3 characters").optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        tags: z.array(z.string()).optional(),
        salaryMin: z.number().optional(),
        salaryMax: z.number().min(0, "Maximum salary must be positive").optional(),
        isRemote: z.boolean().optional(),
      })
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;

      // Get company from admin profile
      const adminProfile = await prisma.adminCompanyProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!adminProfile) {
        throw new Error("Company profile not found");
      }

      // Check if job belongs to this company
      const job = await prisma.job.findUnique({
        where: { id: input.id },
      });

      if (!job) {
        throw new Error("Job not found");
      }

      if (job.companyId !== adminProfile.companyId) {
        throw new Error("You don't have permission to update this job");
      }

      // Update the job
      const updatedJob = await prisma.job.update({
        where: { id: input.id },
        data: {
          ...(input.title && { title: input.title }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.location !== undefined && { location: input.location }),
          ...(input.tags && { tags: input.tags }),
          ...(input.salaryMin !== undefined && { salaryMin: input.salaryMin }),
          ...(input.salaryMax !== undefined && { salaryMax: input.salaryMax }),
          ...(input.isRemote !== undefined && { isRemote: input.isRemote }),
        },
        include: {
          company: true,
          event: true,
        },
      });

      return updatedJob;
    }),

  // Delete a job (company procedure)
  delete: companyProcedure
    .input(
      z.object({
        id: z.number().min(1, "Job ID is required"),
      })
    )
    .mutation(async (opts) => {
      const { ctx, input } = opts;

      // Get company from admin profile
      const adminProfile = await prisma.adminCompanyProfile.findUnique({
        where: { userId: ctx.user.userId },
      });

      if (!adminProfile) {
        throw new Error("Company profile not found");
      }

      // Check if job belongs to this company
      const job = await prisma.job.findUnique({
        where: { id: input.id },
      });

      if (!job) {
        throw new Error("Job not found");
      }

      if (job.companyId !== adminProfile.companyId) {
        throw new Error("You don't have permission to delete this job");
      }

      // Delete the job
      await prisma.job.delete({
        where: { id: input.id },
      });

      return { success: true, message: "Job deleted successfully" };
    }),
});
