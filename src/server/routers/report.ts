import prisma from "@/lib/prisma";
import { adminProcedure, router } from "../trpc";
import z from "zod";

export const reportRouter = router({
  // Generate comprehensive report
  generateReport: adminProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
      })
    )
    .query(async (opts) => {
      const { eventId } = opts.input;

      // Build where clause based on eventId filter
      const eventFilter = eventId ? { eventId } : {};

      // Fetch all necessary data in parallel
      const [
        events,
        companies,
        jobs,
        applications,
        jobSeekerProfiles,
        topJobs,
        educationDemographics,
        statusBreakdown,
      ] = await Promise.all([
        // Events
        prisma.events.findMany({
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true,
          },
          orderBy: {
            date: "desc",
          },
        }),

        // Companies - filter by event if eventId provided
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
                _count: {
                  select: {
                    jobs: true,
                  },
                },
              },
              orderBy: {
                name: "asc",
              },
            })
          : prisma.company.findMany({
              select: {
                id: true,
                name: true,
                code: true,
                createdAt: true,
                _count: {
                  select: {
                    jobs: true,
                  },
                },
              },
              orderBy: {
                name: "asc",
              },
            }),

        // Jobs
        prisma.job.findMany({
          where: eventFilter,
          select: {
            id: true,
            title: true,
            companyId: true,
            eventId: true,
            salaryMin: true,
            salaryMax: true,
            isRemote: true,
            createdAt: true,
            _count: {
              select: {
                Application: true,
              },
            },
          },
        }),

        // Applications with full details
        prisma.application.findMany({
          where: eventId
            ? {
                job: {
                  eventId,
                },
              }
            : {},
          include: {
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
                JobSeekerProfile: {
                  select: {
                    fullName: true,
                    lastEducationLevel: true,
                    phoneNumber: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),

        // Job Seeker Profiles
        prisma.jobSeekerProfile.findMany({
          select: {
            id: true,
            userId: true,
            fullName: true,
            lastEducationLevel: true,
            createdAt: true,
          },
        }),

        // Top 10 jobs by application count
        prisma.job.findMany({
          where: eventFilter,
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              },
            },
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
          take: 10,
        }),

        // Education demographics
        prisma.jobSeekerProfile.groupBy({
          by: ["lastEducationLevel"],
          _count: true,
        }),

        // Status breakdown for chart
        prisma.application.groupBy({
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
        }),
      ]);

      // Calculate statistics
      const totalApplications = applications.length;
      const uniqueApplicants = new Set(
        applications.map((app) => app.jobSeekerId)
      ).size;
      const totalCompanies = companies.length;
      const totalJobs = jobs.length;

      // Status breakdown
      const statusStats = statusBreakdown.reduce((acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {} as Record<string, number>);

      // Education breakdown
      const educationStats = educationDemographics
        .filter((item) => item.lastEducationLevel !== null)
        .map((item) => ({
          level: item.lastEducationLevel || "Tidak Diketahui",
          count: item._count,
        }));

      // Job type distribution (using isRemote as proxy)
      const jobTypeDistribution: Record<string, number> = {};
      jobs.forEach((job) => {
        const type = job.isRemote ? "Remote" : "Onsite";
        jobTypeDistribution[type] = (jobTypeDistribution[type] || 0) + 1;
      });

      // Top companies by applications
      const companyApplicationCounts = applications.reduce((acc, app) => {
        const companyName = app.job.company.name;
        acc[companyName] = (acc[companyName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCompanies = Object.entries(companyApplicationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      // Top jobs list
      const topJobsList = topJobs.map((job) => ({
        title: job.title,
        company: job.company.name,
        applicationCount: job._count.Application,
      }));

      // Selected event details
      const selectedEvent = eventId
        ? events.find((e) => e.id === eventId) || null
        : null;

      return {
        // Basic metrics
        metrics: {
          totalApplications,
          uniqueApplicants,
          totalCompanies,
          totalJobs,
          averageApplicationsPerJob:
            totalJobs > 0 ? (totalApplications / totalJobs).toFixed(2) : 0,
          averageApplicationsPerCompany:
            totalCompanies > 0
              ? (totalApplications / totalCompanies).toFixed(2)
              : 0,
        },

        // Status statistics
        statusStats,

        // Education demographics
        educationStats,

        // Job type distribution
        jobTypeDistribution,

        // Top companies
        topCompanies,

        // Top jobs
        topJobs: topJobsList,

        // Report metadata
        metadata: {
          generatedAt: new Date().toISOString(),
          eventId: eventId || null,
          eventTitle: selectedEvent?.title || "Semua Acara",
          viewMode: (eventId ? "event" : "lifetime") as "event" | "lifetime",
        },
      };
    }),
});
