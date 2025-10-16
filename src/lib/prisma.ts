import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcrypt";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

export async function runAdminSeeder() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      // Nothing to do when env not provided
      return;
    }

    // Hash password before storing. Use bcrypt with salt rounds = 10 (same as other scripts).
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { id: "admin" },
      create: {
        id: "admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
      update: {
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log(
      `\u2705 Admin seeder: ensured admin user (id=admin) with email=${email}`
    );
  } catch (err) {
    // Log but don't crash the app
    console.error("\u274c Admin seeder error:", err);
  }
}
