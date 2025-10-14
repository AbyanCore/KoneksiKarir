import prisma from "@/lib/prisma";
import { publicProcedure, router, companyProcedure } from "../trpc";
import z from "zod";
import { CreateEventDto } from "@/lib/dtos/events/create.event.dto";
import { UpdateEventDto } from "@/lib/dtos/events/update.event.dto";

export const eventsRouter = router({
  // Define your event-related procedures here
  // Basic CRUD

  findAll: publicProcedure.query(async () => {
    const events = await prisma.events.findMany({
      include: {
        _count: {
          select: {
            EventCompanyParticipation: true,
            Job: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return events;
  }),

  findAllWithStats: publicProcedure.query(async () => {
    const events = await prisma.events.findMany({
      include: {
        _count: {
          select: {
            EventCompanyParticipation: true,
            Job: true,
          },
        },
        Job: {
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
        date: "desc",
      },
    });

    // Transform to include application count
    return events.map((event) => ({
      ...event,
      applicationCount: event.Job.reduce(
        (sum, job) => sum + job.Application.length,
        0
      ),
    }));
  }),

  findOne: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Event ID must be a positive number"),
      })
    )
    .query(async (opts) => {
      const event = await prisma.events.findFirst({
        where: {
          id: opts.input.id,
        },
      });
      return event;
    }),

  findOneWithDetails: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Event ID must be a positive number"),
      })
    )
    .query(async (opts) => {
      const event = await prisma.events.findFirst({
        where: {
          id: opts.input.id,
        },
        include: {
          _count: {
            select: {
              EventCompanyParticipation: true,
              Job: true,
            },
          },
          EventCompanyParticipation: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          Job: {
            include: {
              _count: {
                select: {
                  Application: true,
                },
              },
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!event) return null;

      // Transform to group jobs by company
      const participatingCompanies = event.EventCompanyParticipation.map(
        (participation) => {
          const companyJobs = event.Job.filter(
            (job) => job.company.id === participation.company.id
          );

          return {
            id: participation.company.id,
            name: participation.company.name,
            standNumber: participation.standNumber,
            jobCount: companyJobs.length,
          };
        }
      );

      const applicationCount = event.Job.reduce(
        (sum, job) => sum + job._count.Application,
        0
      );

      return {
        ...event,
        applicationCount,
        participatingCompanies,
      };
    }),

  create: publicProcedure.input(CreateEventDto).mutation(async (opts) => {
    const event = await prisma.events.create({
      data: {
        title: opts.input.title,
        description: opts.input.description,
        bannerUrl: opts.input.bannerUrl,
        minimapUrl: opts.input.minimapUrl,
        date: opts.input.date,
        location: opts.input.location,
      },
    });
    return event;
  }),

  update: publicProcedure.input(UpdateEventDto).mutation(async (opts) => {
    const { id, ...data } = opts.input;

    const event = await prisma.events.update({
      where: {
        id: opts.input.id,
      },
      data: {
        ...data,
      },
    });

    return event;
  }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.number().min(1, "Event ID must be a positive number"),
      })
    )
    .mutation(async (opts) => {
      const deletedEvent = await prisma.events.delete({
        where: {
          id: opts.input.id,
        },
      });
      return deletedEvent;
    }),

  // Custom usecases

  // Join an event as a company
  joinEvent: companyProcedure
    .input(
      z.object({
        eventId: z.number().min(1, "Event ID is required"),
        standNumber: z
          .string()
          .min(1, "Stand number is required")
          .max(20, "Stand number is too long"),
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

      // Check if event exists
      const event = await prisma.events.findUnique({
        where: { id: input.eventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Check if already participating
      const existingParticipation =
        await prisma.eventCompanyParticipation.findUnique({
          where: {
            eventId_companyId: {
              eventId: input.eventId,
              companyId: adminProfile.companyId,
            },
          },
        });

      if (existingParticipation) {
        throw new Error("Your company is already participating in this event");
      }

      // Check if stand number is already taken
      const standTaken = await prisma.eventCompanyParticipation.findFirst({
        where: {
          eventId: input.eventId,
          standNumber: input.standNumber,
        },
      });

      if (standTaken) {
        throw new Error(
          `Stand number ${input.standNumber} is already taken for this event`
        );
      }

      // Create participation
      const participation = await prisma.eventCompanyParticipation.create({
        data: {
          eventId: input.eventId,
          companyId: adminProfile.companyId,
          standNumber: input.standNumber,
        },
        include: {
          event: true,
          company: true,
        },
      });

      return participation;
    }),

  // Leave an event as a company
  leaveEvent: companyProcedure
    .input(
      z.object({
        eventId: z.number().min(1, "Event ID is required"),
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

      // Check if participating
      const participation = await prisma.eventCompanyParticipation.findUnique({
        where: {
          eventId_companyId: {
            eventId: input.eventId,
            companyId: adminProfile.companyId,
          },
        },
      });

      if (!participation) {
        throw new Error("Your company is not participating in this event");
      }

      // Check if there are jobs for this event
      const jobsCount = await prisma.job.count({
        where: {
          eventId: input.eventId,
          companyId: adminProfile.companyId,
        },
      });

      if (jobsCount > 0) {
        throw new Error(
          `Cannot leave event. You have ${jobsCount} active job posting(s) for this event. Please delete them first.`
        );
      }

      // Delete participation
      await prisma.eventCompanyParticipation.delete({
        where: {
          eventId_companyId: {
            eventId: input.eventId,
            companyId: adminProfile.companyId,
          },
        },
      });

      return { success: true, message: "Left event successfully" };
    }),

  // Get available events (not yet joined)
  getAvailableEvents: companyProcedure.query(async (opts) => {
    const { ctx } = opts;

    // Get company from admin profile
    const adminProfile = await prisma.adminCompanyProfile.findUnique({
      where: { userId: ctx.user.userId },
    });

    if (!adminProfile) {
      throw new Error("Company profile not found");
    }

    // Get all events where company is not participating
    const events = await prisma.events.findMany({
      where: {
        EventCompanyParticipation: {
          none: {
            companyId: adminProfile.companyId,
          },
        },
        date: {
          gte: new Date(), // Only future events
        },
      },
      include: {
        _count: {
          select: {
            EventCompanyParticipation: true,
            Job: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return events;
  }),
});
