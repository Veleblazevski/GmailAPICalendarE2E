import { organizerCalendar, attendeeCalendar } from "../../clients/google/calendarClient";
import { ensureDefined } from "../../utils/errorHandling";

//Create a ISC event in the calendar
export async function createISCEvent() {
  const result = await organizerCalendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary: "WDIO Gmail RSVP Test",
      start: { dateTime: "2026-07-01T14:00:00Z" },
      end: { dateTime: "2026-07-01T15:00:00Z" },
      attendees: [{ email: "aattendie@gmail.com" }],
    },
  });

  console.log("Event is created and user is invited");
  return result;
}

//Fetch attendee ISC events
export async function getAttendeISCevents(iCalUID: string) {
  const maxAttempts = 8;
  const retryIntervalMs = 7000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }

    const result = await attendeeCalendar.events.list({
      calendarId: "primary",
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
      timeMin: new Date().toISOString(),
    });

    const event = (result.data.items ?? []).find((e) => e.iCalUID === iCalUID);
    if (event) {
      return event;
    }
  }

  throw new Error(`Attendee event with iCalUID ${iCalUID} was not found after ${maxAttempts} attempts`);
}

// Send attendee response
export async function attendeeRespondToInvite(eventId: string | undefined, responseStatus: string) {
  const eventIdValue = ensureDefined(eventId, "Attendee event id is required to respond to the invite.");

  if (responseStatus === "no answer") {
    return;
  }

  await attendeeCalendar.events.patch({
    calendarId: "primary",
    eventId: eventIdValue,
    requestBody: {
      attendees: [
        {
          email: "aattendie@gmail.com",
          responseStatus,
        },
      ],
    },
  });

  console.log("User responded to the invite");
}

//Delete event from the organizer's calendar
export async function deleteEvent(eventId: string | undefined): Promise<void> {
  const eventIdValue = ensureDefined(eventId, "Organizer event id is required to delete the event.");

  // Pause before deleting to allow manual UI verification in the calendar
  await new Promise((resolve) => setTimeout(resolve, 10000));

  await organizerCalendar.events.delete({
    calendarId: "primary",
    eventId: eventIdValue,
    sendUpdates: "all",
  });

  console.log("Event is deleted");
}
