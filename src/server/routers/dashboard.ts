import prisma from "@/lib/prisma";
import { publicProcedure, router } from "../trpc";
import z from "zod";

export const dashboardRouter = router({
  // Get comprehensive dashboard statistics
  getOverviewStats: publicProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
      })
    )
    .query(async (opts) => {
      const { eventId } = opts.input;

      // Build where clause based on eventId filter
      const eventFilter = eventId ? { eventId } : {};

      // Fetch all data in parallel for optimal performance
      const [companies, jobs, applications, users, jobSeekerProfiles, events] =
        await Promise.all([
          // Companies - filter by event participation if eventId provided
          eventId
            ? prisma.company.findMany({
                where: {
                  EventCompanyParticipation: {
                    some: {
                      eventId,
                    },
                  },
                },
                select: {
                  id: true,
                  name: true,
                  code: true,
                  createdAt: true,
                },
              })
            : prisma.company.findMany({
                select: {
                  id: true,
                  name: true,
                  code: true,
                  createdAt: true,
                },
              }),

          // Jobs - filter by event if provided
          prisma.job.findMany({
            where: eventFilter,
            select: {
              id: true,
              title: true,
              companyId: true,
              eventId: true,
              salaryMin: true,
              salaryMax: true,
              createdAt: true,
            },
          }),

          // Applications with related data
          prisma.application.findMany({
            where: eventId
              ? {
                  job: {
                    eventId,
                  },
                }
              : {},
            select: {
              id: true,
              status: true,
              createdAt: true,
              jobSeekerId: true,
              jobId: true,
              job: {
                select: {
                  id: true,
                  title: true,
                  eventId: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              jobSeeker: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 100, // Limit for performance
          }),

          // Users
          prisma.user.findMany({
            select: {
              id: true,
              email: true,
              role: true,
              createdAt: true,
            },
          }),

          // Job Seeker Profiles
          prisma.jobSeekerProfile.findMany({
            select: {
              id: true,
              userId: true,
              fullName: true,
              lastEducationLevel: true,
            },
          }),

          // Events
          prisma.events.findMany({
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
            orderBy: {
              date: "desc",
            },
          }),
        ]);

      // Filter users by eventId if provided (users who applied to jobs in that event)
      const filteredUsers = eventId
        ? users.filter((user) =>
            applications.some((app) => app.jobSeekerId === user.id)
          )
        : users;

      // Filter job seeker profiles based on filtered users
      const filteredProfiles = eventId
        ? jobSeekerProfiles.filter((profile) =>
            filteredUsers.some((user) => user.id === profile.userId)
          )
        : jobSeekerProfiles;

      return {
        companies,
        jobs,
        applications,
        users: filteredUsers,
        jobSeekerProfiles: filteredProfiles,
        events,
      };
    }),

  // Get recent applications with details
  getRecentApplications: publicProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async (opts) => {
      const { eventId, limit } = opts.input;

      const applications = await prisma.application.findMany({
        where: eventId
          ? {
              job: {
                eventId,
              },
            }
          : {},
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          jobSeeker: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return applications.map((app) => ({
        id: app.id,
        applicantEmail: app.jobSeeker.email,
        jobTitle: app.job.title,
        companyName: app.job.company.name,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      }));
    }),

  // Get application status breakdown
  getStatusBreakdown: publicProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
      })
    )
    .query(async (opts) => {
      const { eventId } = opts.input;

      const applications = await prisma.application.groupBy({
        by: ["status"],
        where: eventId
          ? {
              job: {
                eventId,
              },
            }
          : {},
        _count: {
          status: true,
        },
      });

      return applications.map((item) => ({
        name: item.status,
        value: item._count.status,
      }));
    }),

  // Get top jobs by application count
  getTopJobs: publicProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async (opts) => {
      const { eventId, limit } = opts.input;

      const jobs = await prisma.job.findMany({
        where: eventId ? { eventId } : {},
        select: {
          id: true,
          title: true,
          _count: {
            select: {
              Application: true,
            },
          },
        },
        orderBy: {
          Application: {
            _count: "desc",
          },
        },
        take: limit,
      });

      return jobs.map((job) => ({
        jobId: job.id,
        name: job.title,
        count: job._count.Application,
      }));
    }),

  // Get education demographics
  getEducationDemographics: publicProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
      })
    )
    .query(async (opts) => {
      const { eventId } = opts.input;

      // If eventId provided, get only profiles of users who applied to that event
      if (eventId) {
        const applications = await prisma.application.findMany({
          where: {
            job: {
              eventId,
            },
          },
          select: {
            jobSeekerId: true,
          },
          distinct: ["jobSeekerId"],
        });

        const userIds = applications.map((app) => app.jobSeekerId);

        const profiles = await prisma.jobSeekerProfile.groupBy({
          by: ["lastEducationLevel"],
          where: {
            userId: {
              in: userIds,
            },
          },
          _count: {
            lastEducationLevel: true,
          },
        });

        return profiles.map((item) => ({
          level: item.lastEducationLevel || "Unknown",
          count: item._count.lastEducationLevel,
        }));
      }

      // Lifetime stats
      const profiles = await prisma.jobSeekerProfile.groupBy({
        by: ["lastEducationLevel"],
        _count: {
          lastEducationLevel: true,
        },
      });

      return profiles.map((item) => ({
        level: item.lastEducationLevel || "Unknown",
        count: item._count.lastEducationLevel,
      }));
    }),
});
