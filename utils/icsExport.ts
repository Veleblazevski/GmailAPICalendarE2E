import { writeFileSync, mkdirSync, readdirSync, readFileSync, statSync, rmSync } from "fs";
import { resolve } from "path";
import { organizerCalendar, attendeeCalendar } from "../clients/google/calendarClient";

const ICS_OUTPUT_DIR = resolve(process.cwd(), ".ics-exports");

// Ensure output directory exists
mkdirSync(ICS_OUTPUT_DIR, { recursive: true });

/**
 * Export event as ICS file from Google Calendar API
 * @param eventId - The event ID to export
 * @param calendarType - "organizer" or "attendee"
 * @returns Path to the saved ICS file
 */
export async function exportEventAsICS(eventId: string, calendarType: "organizer" | "attendee"): Promise<string> {
  const calendarClient = calendarType === "organizer" ? organizerCalendar : attendeeCalendar;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${calendarType}-event-${eventId}-${timestamp}.ics`;
  const filePath = resolve(ICS_OUTPUT_DIR, fileName);

  try {
    // Fetch event details
    const eventResponse = await calendarClient.events.get({
      calendarId: "primary",
      eventId: eventId,
    });

    // Build ICS format manually from event data
    const icsContent = buildICSFromEvent(eventResponse.data);

    // Save to file
    writeFileSync(filePath, icsContent, "utf-8");
    console.log(`ICS file saved for ${calendarType}: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error(`Failed to export ICS for ${calendarType} event:`, error);
    throw error;
  }
}

/**
 * Build ICS content from Google Calendar event object
 */
function buildICSFromEvent(event: any): string {
  const eventSummary = event.summary || "Event";
  const eventDescription = event.description || "";
  const eventStart = formatDateTimeForICS(event.start?.dateTime || event.start?.date);
  const eventEnd = formatDateTimeForICS(event.end?.dateTime || event.end?.date);
  const eventId = event.id || "";
  const organizer = event.organizer?.email || "organizer@example.com";
  const attendees = (event.attendees || [])
    .map(
      (a: any) =>
        `ATTENDEE;CN=${a.displayName || a.email};PARTSTAT=${a.responseStatus || "NEEDS-ACTION"}:mailto:${a.email}`,
    )
    .join("\r\n");

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Google Inc//Google Calendar V1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${eventId}
DTSTART:${eventStart}
DTEND:${eventEnd}
SUMMARY:${eventSummary}
DESCRIPTION:${eventDescription}
ORGANIZER:mailto:${organizer}
${attendees ? attendees + "\r\n" : ""}STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  return ics;
}

/**
 * Convert Google Calendar datetime to ICS format
 */
function formatDateTimeForICS(dateTime: string | undefined): string {
  if (!dateTime) return new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // Convert ISO format to ICS format (YYYYMMDDTHHMMSSZ)
  const date = new Date(dateTime);
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Export both organizer and attendee events for comparison
 */
export async function exportEventPairForComparison(
  organizerEventId: string,
  attendeeEventId: string,
): Promise<{ organizerICSPath: string; attendeeICSPath: string }> {
  const organizerPath = await exportEventAsICS(organizerEventId, "organizer");
  const attendeePath = await exportEventAsICS(attendeeEventId, "attendee");

  console.log(`Event pair exported for comparison:\n  Organizer: ${organizerPath}\n  Attendee: ${attendeePath}`);

  return {
    organizerICSPath: organizerPath,
    attendeeICSPath: attendeePath,
  };
}

/**
 * Get the most recent ICS file for an event
 * @param eventId - The event ID
 * @param calendarType - "organizer" or "attendee"
 * @returns File path to the most recent ICS file or null if not found
 */
export function getMostRecentICSFile(eventId: string, calendarType: "organizer" | "attendee"): string | null {
  try {
    const files = readdirSync(ICS_OUTPUT_DIR);
    const pattern = `${calendarType}-event-${eventId}`;

    const matchingFiles = files
      .filter((f) => f.startsWith(pattern) && f.endsWith(".ics"))
      .map((f) => ({
        name: f,
        path: resolve(ICS_OUTPUT_DIR, f),
        time: statSync(resolve(ICS_OUTPUT_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (matchingFiles.length > 0) {
      console.log(`Found ICS file: ${matchingFiles[0].path}`);
      return matchingFiles[0].path;
    }

    console.log(`No matching ICS files found for pattern: ${pattern}`);
    return null;
  } catch (error) {
    console.error("Error finding ICS file:", error);
    return null;
  }
}

/**
 * Extract PARTSTAT (response status) from ICS file
 * @param icsFilePath - Path to the ICS file
 * @param attendeeEmail - Email of the attendee to find
 * @returns The PARTSTAT value in uppercase or null if not found
 */
export function extractPartStatFromICS(icsFilePath: string, attendeeEmail: string): string | null {
  try {
    const icsContent = readFileSync(icsFilePath, "utf-8");

    // Find the ATTENDEE line with the matching email.
    // Fine attendie answer from the PARTSTAT field.
    const lines = icsContent.split("\n");
    const attendeeLine = lines.find((line) => line.includes(`mailto:${attendeeEmail}`) && line.startsWith("ATTENDEE"));

    if (!attendeeLine) {
      console.log(`Attendee ${attendeeEmail} not found in ICS file`);
      return null;
    }

    console.log(`Found attendee line: ${attendeeLine}`);

    // Extract PARTSTAT value - it's in format PARTSTAT=value
    const partStatMatch = attendeeLine.match(/PARTSTAT=([a-zA-Z\-]+)/);
    if (!partStatMatch || !partStatMatch[1]) {
      console.log("PARTSTAT not found in attendee line");
      return null;
    }

    const partStat = partStatMatch[1].toUpperCase();
    console.log(`Extracted PARTSTAT: ${partStat}`);
    return partStat;
  } catch (error) {
    console.error("Error reading ICS file:", error);
    return null;
  }
}

/**
 * Clean up all ICS export files
 * @returns true if cleanup was successful, false otherwise
 */
export function cleanupICSFiles(): boolean {
  try {
    const files = readdirSync(ICS_OUTPUT_DIR);
    if (files.length === 0) {
      console.log("No ICS files to clean up");
      return true;
    }

    rmSync(ICS_OUTPUT_DIR, { recursive: true, force: true });
    console.log(`✓ Cleaned up ${files.length} ICS file(s)`);

    // Recreate the directory for future use
    mkdirSync(ICS_OUTPUT_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error("Error cleaning up ICS files:", error);
    return false;
  }
}
