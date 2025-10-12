import { ApiContext, apiHandler } from "@/lib/api-handler";
import prisma from "@/lib/prisma";
import ResponseBuilder from "@/lib/response-builder";

const getHealth = async ({}: ApiContext) => {
  let database = "unknown";

  try {
    await prisma.$queryRaw`SELECT 1+1 AS result;`;
    database = "up";
  } catch (error) {
    database = "down";
  }

  return ResponseBuilder.Ok({
    database,
    server: "up",
    server_time: new Date().toISOString(),
  });
};

export const GET = apiHandler(getHealth);
