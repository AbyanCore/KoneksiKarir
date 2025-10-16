/**
 * Seed admin user from environment variables
 * Usage: npx tsx scripts/seed-admin.ts
 */
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in env to run this script."
    );
    process.exit(1);
  }

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

  console.log(`Admin user upserted (id=admin) with email=${email}`);

  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding admin:", err);
    process.exit(1);
  });
