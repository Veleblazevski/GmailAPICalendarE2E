import fs from "fs";
import open from "open";
import readline from "node:readline";
import { google } from "googleapis";
import { loadEnvFile } from "../env.ts";

// Resolve .env relative to auth/env.ts (the module that does the loading)
loadEnvFile("../.env");

const roleArg = process.argv[2]?.toLowerCase();
const role =
  roleArg === "attendee" || roleArg === "attendie" ? "attendee" : "organizer";
const clientId =
  process.env[
    role === "attendee" ? "ATTENDEE_CLIENT_ID" : "ORGANIZER_CLIENT_ID"
  ];
const clientSecret =
  process.env[
    role === "attendee" ? "ATTENDEE_CLIENT_SECRET" : "ORGANIZER_CLIENT_SECRET"
  ];
const redirectUri =
  process.env[
    role === "attendee" ? "ATTENDEE_REDIRECT_URI" : "ORGANIZER_REDIRECT_URI"
  ] || "http://localhost";

if (!clientId || !clientSecret) {
  throw new Error(
    `Missing ${role} client credentials in .env. Set ${
      role === "attendee" ? "ATTENDEE" : "ORGANIZER"
    }_CLIENT_ID and ${role === "attendee" ? "ATTENDEE" : "ORGANIZER"}_CLIENT_SECRET.`,
  );
}

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const oAuth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri,
);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log(`Generating ${role} token`);
console.log("Open this URL in your browser:", authUrl);
await open(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function writeEnvVariable(name: string, value: string) {
  const envPath = new URL("../../.env", import.meta.url);
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  }

  const escapedValue = value.replace(/\n/g, "\\n");
  const regex = new RegExp(`^${name}=.*$`, "m");

  if (regex.test(content)) {
    content = content.replace(regex, `${name}="${escapedValue}"`);
  } else {
    if (content && !content.endsWith("\n")) {
      content += "\n";
    }
    content += `${name}="${escapedValue}"\n`;
  }

  fs.writeFileSync(envPath, content, "utf8");
}

rl.question("Enter the authorization code: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());

    const baseName = role === "attendee" ? "ATTENDEE" : "ORGANIZER";
    if (tokens.refresh_token) {
      writeEnvVariable(`${baseName}_REFRESH_TOKEN`, tokens.refresh_token);
    }
    if (tokens.access_token) {
      writeEnvVariable(`${baseName}_ACCESS_TOKEN`, tokens.access_token);
    }
    if (tokens.expiry_date) {
      writeEnvVariable(`${baseName}_EXPIRY_DATE`, String(tokens.expiry_date));
    }

    console.log(`Updated .env with ${role} token values.`);
    console.log(
      "If the refresh_token field is missing, re-run the script and use a new consent flow.",
    );
  } catch (error) {
    console.error("Failed to exchange code for token:", error);
  } finally {
    rl.close();
  }
});
