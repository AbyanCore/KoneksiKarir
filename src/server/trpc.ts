import { initTRPC } from "@trpc/server";

const t = initTRPC.create({
  isDev: process.env.NODE_ENV !== "production",
});

export const router = t.router;
export const publicProcedure = t.procedure;
