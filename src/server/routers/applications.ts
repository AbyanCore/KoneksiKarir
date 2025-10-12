import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
import { CreateApplicationDto } from "@/lib/dtos/applications/create.application.dto";
import z from "zod";

export const applicationsRouter = router({
  // Create a new application
  create: publicProcedure.input(CreateApplicationDto).mutation(async (opts) => {
    const { jobId, jobSeekerId } = opts.input;

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobSeekerId_jobId: {
          jobSeekerId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      throw new Error("You have already applied to this job");
    }

    // Get job to check event
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { eventId: true },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Check application limit (max 5 per event)
    const applicationCount = await prisma.application.count({
      where: {
        jobSeekerId,
        job: {
          eventId: job.eventId,
        },
      },
    });

    if (applicationCount >= 5) {
      throw new Error(
        "You have reached the maximum of 5 applications per event"
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        jobSeekerId,
        status: "PENDING",
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Create history record
    await prisma.applicationProcessHistory.create({
      data: {
        applicationId: application.id,
        status: "PENDING",
      },
    });

    return application;
  }),

  // Get user's applications for a specific event
  findByUserAndEvent: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
        eventId: z.number().min(1, "Event ID is required"),
      })
    )
    .query(async (opts) => {
      const { userId, eventId } = opts.input;

      const applications = await prisma.application.findMany({
        where: {
          jobSeekerId: userId,
          job: {
            eventId,
          },
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return applications;
    }),

  // Check if user has applied to a job
  checkApplied: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
        jobId: z.number().min(1, "Job ID is required"),
      })
    )
    .query(async (opts) => {
      const { userId, jobId } = opts.input;

      const application = await prisma.application.findUnique({
        where: {
          jobSeekerId_jobId: {
            jobSeekerId: userId,
            jobId,
          },
        },
      });

      return {
        hasApplied: !!application,
        application,
      };
    }),

  // Get application count for user in an event
  countByUserAndEvent: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
        eventId: z.number().min(1, "Event ID is required"),
      })
    )
    .query(async (opts) => {
      const { userId, eventId } = opts.input;

      const count = await prisma.application.count({
        where: {
          jobSeekerId: userId,
          job: {
            eventId,
          },
        },
      });

      return {
        count,
        remaining: 5 - count,
      };
    }),
});
