import { expect } from "@wdio/globals";
import { organizerCalendar, attendeeCalendar } from "../clients/google/calendarClient";
import { getMostRecentICSFile, extractPartStatFromICS } from "../utils/icsExport";

//Checks that the organizer event was created successfully
export async function validateOrganizerEvent(event: any): Promise<void> {
  await expect(event.data.id).toBeDefined();
  await expect(event.data.summary).toBe("WDIO Gmail RSVP Test");
  await expect(event.data.status).toBe("confirmed");
}

//Validate event is deleted from the organizer calendar
export async function validateEventDeleted(event: any): Promise<void> {
  const maxAttempts = 3;
  const retryIntervalMs = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }

    try {
      const eventResponse = await organizerCalendar.events.get({
        calendarId: "primary",
        eventId: event.data.id!,
      });

      if (eventResponse.data.status === "cancelled") {
        console.log(`Event deleted (status cancelled) on attempt ${attempt}`);
        return;
      }

      console.log(`Event still exists after attempt ${attempt}: status=${eventResponse.data.status}`);
    } catch (error: any) {
      if (error?.code === 404) {
        console.log(`Event deleted (not found) on attempt ${attempt}`);
        return;
      }
      throw error;
    }
  }

  throw new Error(`Event was still present after ${maxAttempts} attempts and was not deleted.`);
}

//Validate attendee response status matches in both API and ICS file
export async function validateAttendeeResponseInICS(
  eventId: string,
  expectedResponseStatus: string,
  attendeeEmail: string,
): Promise<void> {
  // SOURCE 1: Fetch actual response from Google Calendar API (organizer's view)
  const eventResponse = await attendeeCalendar.events.get({
    calendarId: "primary",
    eventId: eventId,
  });

  // Get the attendee's response status from the event
  const attendeeData = (eventResponse.data.attendees || []).find((a) => a.email === attendeeEmail);
  const apiResponseStatus = attendeeData?.responseStatus || "needsAction";

  console.log(`API response status: ${apiResponseStatus}`);
  await expect(apiResponseStatus).toBe(expectedResponseStatus);

  // SOURCE 2: Find and read the most recent attendee ICS file from .ics-exports folder
  // Location: .ics-exports/attendee-event-{eventId}-*.ics
  const icsFilePath = getMostRecentICSFile(eventId, "attendee");
  await expect(icsFilePath).toBeDefined();

  if (!icsFilePath) {
    throw new Error(`ICS file not found for attendee event: ${eventId}`);
  }

  // Extract PARTSTAT from ICS file (e.g., PARTSTAT=accepted)
  const icsPartStat = extractPartStatFromICS(icsFilePath, attendeeEmail);
  console.log(`ICS file PARTSTAT: ${icsPartStat}`);

  // Assert they match
  await expect(icsPartStat).toBeDefined();
  await expect(icsPartStat).toBe(expectedResponseStatus.toUpperCase());

  console.log(`✓ Attendee response status verified in both API and ICS file: ${expectedResponseStatus}`);
}
