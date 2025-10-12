import { z } from "zod";
import { logger } from "@/lib/logger";

export default class ResponseBuilder {
  static wrap<T>(data: T, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private static dataTransformer<T, S>(input: T, schema: z.ZodSchema<S>): S {
    const { data, success, error } = schema.safeParse(input);

    if (!success) {
      throw ResponseBuilder.BadRequest(
        "Invalid data format",
        error.flatten().fieldErrors
      );
    }

    return data;
  }

  static transform<T extends T[] | any, S>(
    input: T,
    schema: z.ZodSchema<S>
  ): S | S[] {
    if (Array.isArray(input)) {
      return input.map((item) => {
        return this.dataTransformer<T, S>(item, schema);
      });
    }

    return this.dataTransformer<T, S>(input, schema);
  }

  static Ok<T>(data: T): Response {
    return this.wrap(data, 200);
  }

  static Accepted<T>(data: T, message: string): Response {
    return this.wrap(
      {
        data,
        message,
      },
      202
    );
  }

  static Conflict(message: string): Response {
    return this.wrap({ message }, 409);
  }

  static NotFound(message: string): Response {
    return this.wrap({ message }, 404);
  }

  static Fobidden(message: string): Response {
    return this.wrap({ message }, 403);
  }

  static BadRequest(message: string, errors?: Record<string, any>): Response {
    return this.wrap(
      {
        message,
        errors: errors || {
          "Invalid request": "The request could not be processed",
        },
      },
      400
    );
  }

  static Unauthorized(message: string): Response {
    return this.wrap({ message }, 401);
  }

  static InternalServer(message: string): Response {
    return this.wrap({ message }, 500);
  }
}
