import { google } from "googleapis";
import { oAuth2Client, attendeeAuth } from "../../auth/googleAuth";

export const organizerCalendar = google.calendar({
  version: "v3",
  auth: oAuth2Client,
});

export const attendeeCalendar = google.calendar({
  version: "v3",
  auth: attendeeAuth,
});
