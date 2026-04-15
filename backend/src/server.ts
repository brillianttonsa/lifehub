import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`LifeHub backend running on port ${env.PORT}`);
});


