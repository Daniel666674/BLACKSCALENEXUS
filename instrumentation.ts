export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { checkEncryptionKey } = await import("./src/db/index");
    checkEncryptionKey();

    const { initCronJobs } = await import("./src/lib/cron");
    initCronJobs();
  }
}
