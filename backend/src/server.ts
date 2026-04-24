import app from "./app";
import { env } from "./config/env"
import { checkDbConnection } from "./db"

checkDbConnection()

const PORT = Number(env.PORT);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});