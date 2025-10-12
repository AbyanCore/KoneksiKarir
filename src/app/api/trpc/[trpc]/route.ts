import { appRouter } from "@/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";
import type { Context } from "@/server/trpc";

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: (): Context => {
      // Get token from cookie header
      const cookieHeader = req.headers.get("cookie");
      const token = getTokenFromCookie(cookieHeader || undefined);

      // Verify token and get user
      const user = token ? verifyToken(token) : null;

      return { user };
    },
  });
};

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
