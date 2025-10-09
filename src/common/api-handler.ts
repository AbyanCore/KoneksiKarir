import { logger } from "./logger";
import ResponseBuilder from "@/common/response-builder";

type ParamsType = Record<string, string> | undefined;

export type ApiContext = {
  req: Request;
  params?: ParamsType;
  searchParams?: URLSearchParams;
  query?: Record<string, string | string[]>;
};

export function apiHandler(
  handler: (ctx: ApiContext) => Promise<Response>
): (req: Request, context: { params: any }) => Promise<Response> {
  return async (req: Request, context: { params: any }) => {
    try {
      const url = new URL(req.url);

      const ctx: ApiContext = {
        req,
        params: (await context?.params) as ParamsType,
        searchParams: url.searchParams,
        query: Object.fromEntries(url.searchParams.entries()),
      };

      return await handler(ctx);
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }

      logger.error(
        "API ",
        "Error in API handler",
        error as Record<string, any>
      );

      return errorFilter(error);
    }
  };
}

async function errorFilter(error: any): Promise<Response> {
  if (error instanceof Response) {
    return error;
  }

  // Prisma specific error handling
  switch (error.code) {
    case "P2025":
      return ResponseBuilder.NotFound("Resource not found");
    case "P2002":
      return ResponseBuilder.Conflict("Duplicate entry error");
    case "P2003":
      return ResponseBuilder.BadRequest("Foreign key constraint failed");
    case "P2004":
      return ResponseBuilder.BadRequest("Invalid input");
  }

  logger.error("API ", "Error in API handler", error as Record<string, any>);

  // Handle JSON parsing errors
  if (
    (error as any)?.message &&
    ((error as any).message as string).includes("JSON")
  ) {
    return ResponseBuilder.BadRequest("Invalid JSON format");
  }

  return new Response(JSON.stringify({ message: error, error: {} }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}
