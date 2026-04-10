import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

async function start() {
  await prisma.$connect();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`LifeHub backend running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});
