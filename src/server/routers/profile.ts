import { z } from "zod";
import { protectedProcedure, jobSeekerProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { UpdateJobSeekerProfileDto } from "@/lib/dtos/profile/update.jobseeker-profile.dto";

export const profileRouter = router({
  // Get job seeker profile (authenticated user's own profile)
  getMyProfile: jobSeekerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        JobSeekerProfile: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.JobSeekerProfile
        ? {
            id: user.JobSeekerProfile.id,
            fullName: user.JobSeekerProfile.fullName,
            bio: user.JobSeekerProfile.bio,
            lastEducationLevel: user.JobSeekerProfile.lastEducationLevel,
            graduationYear: user.JobSeekerProfile.graduationYear,
            institutionName: user.JobSeekerProfile.institutionName,
            skills: user.JobSeekerProfile.skills,
            socialLinks: user.JobSeekerProfile.socialLinks as Array<{
              type: string;
              url: string;
            }>,
            resumeUrl: user.JobSeekerProfile.resumeUrl,
            portfolioUrl: user.JobSeekerProfile.portfolioUrl,
            NIK: user.JobSeekerProfile.NIK,
            phoneNumber: user.JobSeekerProfile.phoneNumber,
          }
        : null,
    };
  }),

  // Legacy: Get job seeker profile by user ID (for backward compatibility)
  getJobSeekerProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      // Only allow users to view their own profile or admins to view any profile
      if (ctx.user.userId !== userId && ctx.user.role !== "ADMIN") {
        throw new Error("Unauthorized: You can only view your own profile");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          JobSeekerProfile: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.JobSeekerProfile
          ? {
              id: user.JobSeekerProfile.id,
              fullName: user.JobSeekerProfile.fullName,
              bio: user.JobSeekerProfile.bio,
              lastEducationLevel: user.JobSeekerProfile.lastEducationLevel,
              graduationYear: user.JobSeekerProfile.graduationYear,
              institutionName: user.JobSeekerProfile.institutionName,
              skills: user.JobSeekerProfile.skills,
              socialLinks: user.JobSeekerProfile.socialLinks as Array<{
                type: string;
                url: string;
              }>,
              resumeUrl: user.JobSeekerProfile.resumeUrl,
              portfolioUrl: user.JobSeekerProfile.portfolioUrl,
              NIK: user.JobSeekerProfile.NIK,
              phoneNumber: user.JobSeekerProfile.phoneNumber,
            }
          : null,
      };
    }),

  // Update job seeker profile (authenticated user's own profile)
  updateMyProfile: jobSeekerProcedure
    .input(
      UpdateJobSeekerProfileDto.omit({ userId: true }) // userId comes from auth context
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.userId;
      const profileData = input;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { JobSeekerProfile: true },
      });

      // Convert empty strings to null for optional URL fields
      const resumeUrl =
        profileData.resumeUrl === "" ? null : profileData.resumeUrl;
      const portfolioUrl =
        profileData.portfolioUrl === "" ? null : profileData.portfolioUrl;

      // Upsert profile (create if doesn't exist, update if exists)
      const profile = await prisma.jobSeekerProfile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: profileData.fullName,
          bio: profileData.bio,
          lastEducationLevel: profileData.lastEducationLevel,
          graduationYear: profileData.graduationYear,
          institutionName: profileData.institutionName,
          skills: profileData.skills,
          socialLinks: profileData.socialLinks as any,
          resumeUrl,
          portfolioUrl,
          NIK: profileData.NIK,
          phoneNumber: profileData.phoneNumber,
        },
        update: {
          fullName: profileData.fullName,
          bio: profileData.bio,
          lastEducationLevel: profileData.lastEducationLevel,
          graduationYear: profileData.graduationYear,
          institutionName: profileData.institutionName,
          skills: profileData.skills,
          socialLinks: profileData.socialLinks as any,
          resumeUrl,
          portfolioUrl,
          NIK: profileData.NIK,
          phoneNumber: profileData.phoneNumber,
        },
      });

      return {
        success: true,
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          bio: profile.bio,
          lastEducationLevel: profile.lastEducationLevel,
          graduationYear: profile.graduationYear,
          institutionName: profile.institutionName,
          skills: profile.skills,
          socialLinks: profile.socialLinks as Array<{
            type: string;
            url: string;
          }>,
          resumeUrl: profile.resumeUrl,
          portfolioUrl: profile.portfolioUrl,
          NIK: profile.NIK,
          phoneNumber: profile.phoneNumber,
        },
      };
    }),

  // Check if authenticated user's profile is complete
  checkMyProfileComplete: jobSeekerProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { JobSeekerProfile: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Profile is considered complete if it exists and has required fields
    const isComplete =
      !!user.JobSeekerProfile &&
      !!user.JobSeekerProfile.fullName &&
      user.JobSeekerProfile.fullName.trim().length > 0;

    return {
      isComplete,
      hasProfile: !!user.JobSeekerProfile,
    };
  }),

  // Legacy: Check if profile is complete (for backward compatibility)
  checkProfileComplete: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      // Only allow users to check their own profile or admins
      if (ctx.user.userId !== userId && ctx.user.role !== "ADMIN") {
        throw new Error("Unauthorized: You can only check your own profile");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { JobSeekerProfile: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Profile is considered complete if it exists and has required fields
      const isComplete =
        !!user.JobSeekerProfile &&
        !!user.JobSeekerProfile.fullName &&
        user.JobSeekerProfile.fullName.trim().length > 0;

      return {
        isComplete,
        hasProfile: !!user.JobSeekerProfile,
      };
    }),
});
