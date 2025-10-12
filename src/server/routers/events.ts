import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
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
});
