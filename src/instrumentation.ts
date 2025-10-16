export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runAdminSeeder } = await import("./lib/prisma");
    void runAdminSeeder();
  }

  if (process.env.NEXT_RUNTIME === "edge") return; // No-op for edge runtime
}
