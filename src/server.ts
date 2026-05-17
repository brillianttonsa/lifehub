import app from './app';
import { env } from './config/env';
import { checkDbConnection } from './db';

const PORT = Number(env.PORT);

async function start() {
  try {
    await checkDbConnection();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
