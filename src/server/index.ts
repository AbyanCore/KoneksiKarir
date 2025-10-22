import { applicationsRouter } from "./routers/applications";
import { authRouter } from "./routers/auth";
import { companiesRouter } from "./routers/companies";
import { eventsRouter } from "./routers/events";
import { jobsRouter } from "./routers/jobs";
import { usersRouter } from "./routers/users";
import { dashboardRouter } from "./routers/dashboard";
import { profileRouter } from "./routers/profile";
import { reportRouter } from "./routers/report";
import { router } from "./trpc";

export const appRouter = router({
  // Merge your existing routers here
  users: usersRouter,
  companies: companiesRouter,
  auth: authRouter,
  jobs: jobsRouter,
  events: eventsRouter,
  applications: applicationsRouter,
  dashboard: dashboardRouter,
  profile: profileRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
