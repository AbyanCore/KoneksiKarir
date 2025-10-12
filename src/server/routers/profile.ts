import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { UpdateJobSeekerProfileDto } from "@/lib/dtos/profile/update.jobseeker-profile.dto";

export const profileRouter = router({
  // Get job seeker profile by user ID
  getJobSeekerProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
      })
    )
    .query(async ({ input }) => {
      const { userId } = input;

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

  // Update job seeker profile
  updateJobSeekerProfile: publicProcedure
    .input(UpdateJobSeekerProfileDto)
    .mutation(async ({ input }) => {
      const { userId, ...profileData } = input;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { JobSeekerProfile: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.role !== "JOB_SEEKER") {
        throw new Error("Only job seekers can update their profile");
      }

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

  // Check if profile is complete (for first-time setup)
  checkProfileComplete: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, "User ID is required"),
      })
    )
    .query(async ({ input }) => {
      const { userId } = input;

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
