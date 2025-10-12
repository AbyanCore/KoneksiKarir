import { initTRPC, TRPCError } from "@trpc/server";
import { verifyToken, type JWTPayload } from "@/lib/auth";

// Context type
export interface Context {
  user: JWTPayload | null;
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  isDev: process.env.NODE_ENV !== "production",
});

// Middleware to check authentication
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Middleware to check if user is job seeker
const isJobSeeker = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  if (ctx.user.role !== "JOB_SEEKER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This resource is only accessible to job seekers",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Middleware to check if user is admin
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This resource is only accessible to admins",
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const jobSeekerProcedure = t.procedure.use(isJobSeeker);
export const adminProcedure = t.procedure.use(isAdmin);
