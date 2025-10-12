import prisma from "@/lib/prisma";
import { jobSeekerProcedure, protectedProcedure, router } from "../trpc";
import { CreateApplicationDto } from "@/lib/dtos/applications/create.application.dto";
import z from "zod";

export const applicationsRouter = router({
  // Create a new application (authenticated user)
  create: jobSeekerProcedure
    .input(CreateApplicationDto.omit({ jobSeekerId: true })) // jobSeekerId comes from auth context
    .mutation(async ({ input, ctx }) => {
      const { jobId } = input;
      const jobSeekerId = ctx.user.userId;

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

  // Get authenticated user's applications for a specific event
  findMyApplicationsByEvent: jobSeekerProcedure
    .input(
      z.object({
        eventId: z.number().min(1, "Event ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const { eventId } = input;

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

  // Check if authenticated user has applied to a job
  checkMyApplication: jobSeekerProcedure
    .input(
      z.object({
        jobId: z.number().min(1, "Job ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const { jobId } = input;

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

  // Get application count for authenticated user in an event
  countMyApplicationsByEvent: jobSeekerProcedure
    .input(
      z.object({
        eventId: z.number().min(1, "Event ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const { eventId } = input;

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
