import prisma from "@/lib/prisma";
import { publicProcedure, router, companyProcedure } from "../trpc";
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

  // ==================== COMPANY-SPECIFIC PROCEDURES ====================

  // Get company profile by user email (company admin)
  getMyCompanyProfile: companyProcedure.query(async ({ ctx }) => {
    // Get company through AdminCompanyProfile relation
    const adminProfile = await prisma.adminCompanyProfile.findUnique({
      where: { userId: ctx.user.userId },
      include: {
        company: {
          include: {
            _count: {
              select: {
                EventCompanyParticipation: true,
                jobs: true,
              },
            },
          },
        },
      },
    });

    if (!adminProfile) {
      return null;
    }

    return adminProfile.company;
  }),

  // Check if company profile is complete
  checkMyCompanyProfileComplete: companyProcedure.query(async ({ ctx }) => {
    // Get company through AdminCompanyProfile relation
    const adminProfile = await prisma.adminCompanyProfile.findUnique({
      where: { userId: ctx.user.userId },
      include: {
        company: true,
      },
    });

    if (!adminProfile) {
      return {
        isComplete: false,
        message: "Company profile not linked. Please contact administrator.",
      };
    }

    const company = adminProfile.company;

    // Check if company has required fields
    const isComplete = !!(
      company.name &&
      company.description &&
      company.location
    );

    return {
      isComplete,
      message: isComplete
        ? "Company profile is complete"
        : "Please complete your company profile",
      company,
    };
  }),

  // Get company dashboard data (jobs, events, applications)
  getMyCompanyDashboard: companyProcedure.query(async ({ ctx }) => {
    // Get company through AdminCompanyProfile relation
    const adminProfile = await prisma.adminCompanyProfile.findUnique({
      where: { userId: ctx.user.userId },
      include: {
        company: true,
      },
    });

    if (!adminProfile) {
      return null;
    }

    const company = adminProfile.company;

    // Get all participating events with jobs and applications
    const events = await prisma.eventCompanyParticipation.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        event: {
          include: {
            _count: {
              select: {
                Job: true,
                EventCompanyParticipation: true,
              },
            },
          },
        },
      },
    });

    // Get all jobs with application counts
    const jobs = await prisma.job.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
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

    // Get total application count
    const totalApplications = await prisma.application.count({
      where: {
        job: {
          companyId: company.id,
        },
      },
    });

    // Get application counts by status
    const pendingCount = await prisma.application.count({
      where: {
        job: {
          companyId: company.id,
        },
        status: "PENDING",
      },
    });

    const acceptedCount = await prisma.application.count({
      where: {
        job: {
          companyId: company.id,
        },
        status: "ACCEPTED",
      },
    });

    const rejectedCount = await prisma.application.count({
      where: {
        job: {
          companyId: company.id,
        },
        status: "REJECTED",
      },
    });

    return {
      company,
      events: events.map((e) => ({
        ...e.event,
        standNumber: e.standNumber,
        participation: e,
      })),
      jobs,
      totalApplications,
      stats: {
        totalJobs: jobs.length,
        totalEvents: events.length,
        totalApplications,
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
      },
    };
  }),

  // Get applications for a specific job
  getJobApplications: companyProcedure
    .input(
      z.object({
        jobId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get company through AdminCompanyProfile relation
      const adminProfile = await prisma.adminCompanyProfile.findUnique({
        where: { userId: ctx.user.userId },
        include: {
          company: true,
        },
      });

      if (!adminProfile) {
        throw new Error("Company profile not found");
      }

      // Verify job belongs to company
      const job = await prisma.job.findFirst({
        where: {
          id: input.jobId,
          companyId: adminProfile.companyId,
        },
        include: {
          company: true,
          event: true,
          Application: {
            include: {
              jobSeeker: {
                select: {
                  id: true,
                  email: true,
                  JobSeekerProfile: true,
                },
              },
              ApplicationHistory: {
                orderBy: {
                  changedAt: "desc",
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!job) {
        throw new Error("Job not found or unauthorized");
      }

      return job;
    }),

  // Update application status
  updateApplicationStatus: companyProcedure
    .input(
      z.object({
        applicationId: z.number(),
        status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "REVIEWED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get company through AdminCompanyProfile relation
      const adminProfile = await prisma.adminCompanyProfile.findUnique({
        where: { userId: ctx.user.userId },
        include: {
          company: true,
        },
      });

      if (!adminProfile) {
        throw new Error("Company profile not found");
      }

      // Verify application belongs to company's job
      const application = await prisma.application.findFirst({
        where: {
          id: input.applicationId,
          job: {
            companyId: adminProfile.companyId,
          },
        },
      });

      if (!application) {
        throw new Error("Application not found or unauthorized");
      }

      // Update application status
      const updated = await prisma.application.update({
        where: { id: input.applicationId },
        data: { status: input.status },
      });

      // Create history record
      await prisma.applicationProcessHistory.create({
        data: {
          applicationId: input.applicationId,
          status: input.status,
        },
      });

      return updated;
    }),
});
