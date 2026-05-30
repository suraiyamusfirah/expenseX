import { createServer } from "node:http";
import { env } from "node:process";
import { createApp } from "./app.js";
import { JsonStore } from "./storage/json-store.js";
import { TransactionService } from "./transactions/service.js";

const port = Number(env.PORT ?? 3000);
const dataFile = env.DATA_FILE ?? "data/expensex.json";

const store = new JsonStore(dataFile);
const transactionService = new TransactionService(store);
const app = createApp({ transactionService });
const server = createServer(app);

server.listen(port, () => {
  console.log(`ExpenseX running at http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down...`);
  server.close(() => {
    console.log("ExpenseX stopped.");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
