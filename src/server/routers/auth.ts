import { SignInDto } from "@/lib/dtos/auth/signin.dto";
import { publicProcedure, router } from "../trpc";
import prisma from "@/lib/prisma";

export const authRouter = router({
  // Define authentication-related procedures here
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
