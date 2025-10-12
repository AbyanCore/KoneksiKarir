import { SignInDto } from "@/lib/dtos/auth/signin.dto";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  // Get current authenticated user
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.userId },
      include: {
        JobSeekerProfile: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
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
          }
        : null,
    };
  }),

  // Legacy sign in (deprecated - use /api/auth/signin instead)
  signIn: publicProcedure.input(SignInDto).mutation(async (opts) => {
    const user = await prisma.user.findFirst({
      where: {
        email: opts.input.email,
        password: opts.input.password,
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    return user;
  }),
});
