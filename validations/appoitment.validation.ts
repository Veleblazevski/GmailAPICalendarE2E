import { expect } from "@wdio/globals";
import { organizerCalendar } from "../clients/google/calendarClient";

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
