/**
 * Migration Script: Hash Plain Text Passwords
 *
 * This script hashes all plain text passwords in the database using bcrypt.
 * It's safe to run multiple times - it will skip passwords that are already hashed.
 *
 * Usage: npx tsx scripts/hash-passwords.ts
 */

import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";

async function hashPlainTextPasswords() {
  console.log("🔍 Finding users with plain text passwords...");

  const users = await prisma.user.findMany();

  let hashedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (user.password.startsWith("$2")) {
      console.log(`⏭️  Skipping ${user.email} - already hashed`);
      skippedCount++;
      continue;
    }

    // Hash the plain text password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Update the user with hashed password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ Hashed password for: ${user.email}`);
    hashedCount++;
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   - Passwords hashed: ${hashedCount}`);
  console.log(`   - Passwords skipped (already hashed): ${skippedCount}`);
  console.log(`   - Total users: ${users.length}`);

  if (hashedCount > 0) {
    console.log("\n✨ All plain text passwords have been hashed successfully!");
  } else {
    console.log("\n✨ All passwords were already hashed. Nothing to do!");
  }

  await prisma.$disconnect();
}

// Run the migration
hashPlainTextPasswords().catch((error) => {
  console.error("\n❌ Error during password migration:", error);
  process.exit(1);
});
