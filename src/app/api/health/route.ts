import { ApiContext, apiHandler } from "@/common/api-handler";
import prisma from "@/common/prisma";
import ResponseBuilder from "@/common/response-builder";

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
