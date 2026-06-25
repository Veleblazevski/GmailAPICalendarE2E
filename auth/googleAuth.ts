import { google } from "googleapis";
import { loadEnvFile } from "./env.ts";

loadEnvFile("../.env");

const organizerClientId = process.env.ORGANIZER_CLIENT_ID;
const organizerClientSecret = process.env.ORGANIZER_CLIENT_SECRET;
const organizerRedirectUri =
  process.env.ORGANIZER_REDIRECT_URI || "http://localhost";
const organizerRefreshToken = process.env.ORGANIZER_REFRESH_TOKEN;
const organizerAccessToken = process.env.ORGANIZER_ACCESS_TOKEN;
const organizerExpiryDate = process.env.ORGANIZER_EXPIRY_DATE
  ? Number(process.env.ORGANIZER_EXPIRY_DATE)
  : undefined;

const attendeeClientId = process.env.ATTENDEE_CLIENT_ID;
const attendeeClientSecret = process.env.ATTENDEE_CLIENT_SECRET;
const attendeeRedirectUri =
  process.env.ATTENDEE_REDIRECT_URI || "http://localhost";
const attendeeRefreshToken = process.env.ATTENDEE_REFRESH_TOKEN;
const attendeeAccessToken = process.env.ATTENDEE_ACCESS_TOKEN;
const attendeeExpiryDate = process.env.ATTENDEE_EXPIRY_DATE
  ? Number(process.env.ATTENDEE_EXPIRY_DATE)
  : undefined;

if (!organizerClientId || !organizerClientSecret || !organizerRefreshToken) {
  throw new Error(
    "Missing organizer auth configuration. Set ORGANIZER_CLIENT_ID, ORGANIZER_CLIENT_SECRET, and ORGANIZER_REFRESH_TOKEN in .env.",
  );
}

if (!attendeeClientId || !attendeeClientSecret || !attendeeRefreshToken) {
  throw new Error(
    "Missing attendee auth configuration. Set ATTENDEE_CLIENT_ID, ATTENDEE_CLIENT_SECRET, and ATTENDEE_REFRESH_TOKEN in .env.",
  );
}

const oAuth2Client = new google.auth.OAuth2(
  organizerClientId,
  organizerClientSecret,
  organizerRedirectUri,
);

const attendeeAuth = new google.auth.OAuth2(
  attendeeClientId,
  attendeeClientSecret,
  attendeeRedirectUri,
);

oAuth2Client.setCredentials({
  refresh_token: organizerRefreshToken,
  access_token: organizerAccessToken,
  expiry_date: organizerExpiryDate,
});

attendeeAuth.setCredentials({
  refresh_token: attendeeRefreshToken,
  access_token: attendeeAccessToken,
  expiry_date: attendeeExpiryDate,
});

export { oAuth2Client, attendeeAuth };
