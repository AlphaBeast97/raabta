import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";

// every 14 minutes hit the health endpoint of the backend to keep the app awake on Render Deployment

const job = new CronJob("*/14 * * * *", function () {
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  if (!base) return;

  const url = new URL("/health", base).href;
  const client = url.startsWith("https:") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;
