import { loadEnvFile } from "../env.ts";
import { fileURLToPath } from "node:url";

const rel = "../../.env";
const fileUrl = new URL(rel, import.meta.url);
const filePath = fileURLToPath(fileUrl);
console.log("Resolved URL ->", String(fileUrl));
console.log("Resolved file path ->", filePath);

import fs from "fs";
try {
  const raw = fs.readFileSync(filePath, "utf8");
  console.log(".env raw length:", raw.length);
  console.log(".env preview:\n", raw.split(/\r?\n/).slice(0, 10).join("\n"));
} catch (e) {
  console.error("Failed to read .env directly:", e);
}

const env = loadEnvFile(rel);
console.log("From auth/oAuth/check-env.ts -> loaded keys:", Object.keys(env));
console.log("process.env.ATTENDEE_CLIENT_ID =", process.env.ATTENDEE_CLIENT_ID);
console.log(
  "process.env.ATTENDEE_CLIENT_SECRET =",
  process.env.ATTENDEE_CLIENT_SECRET ? "[present]" : "[missing]",
);
console.log(
  "process.env.ATTENDEE_REFRESH_TOKEN =",
  process.env.ATTENDEE_REFRESH_TOKEN ? "[present]" : "[missing]",
);
