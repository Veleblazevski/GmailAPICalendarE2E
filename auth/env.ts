import fs from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function loadEnvFile(envPath: string) {
  const fileUrl = new URL(envPath, import.meta.url);
  let filePath = fileURLToPath(fileUrl);

  if (!fs.existsSync(filePath)) {
    // Fallback to project root .env if the computed path doesn't exist
    const fallback = path.join(process.cwd(), ".env");
    if (fs.existsSync(fallback)) {
      filePath = fallback;
    } else {
      return {} as Record<string, string>;
    }
  }

  const content = fs.readFileSync(filePath, "utf8");
  const env: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const assignIndex = line.indexOf("=");
    if (assignIndex === -1) {
      continue;
    }

    const name = line.slice(0, assignIndex).trim();
    let value = line.slice(assignIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[name] = process.env[name] ?? value;
    if (process.env[name] === undefined) {
      process.env[name] = value;
    }
  }

  return env;
}
