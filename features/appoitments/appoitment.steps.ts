import { Given, Then, When, Before } from "@wdio/cucumber-framework";
import {
  createISCEvent,
  getAttendeISCevents,
  attendeeRespondToInvite,
  deleteEvent,
} from "../../services/calendar/googleCalendar.service";

import {
  validateOrganizerEvent,
  validateEventDeleted,
  validateAttendeeResponseInICS,
} from "../../validations/appoitment.validation";

import { cleanupICSFiles } from "../../utils/icsExport";

Before(async function () {
  cleanupICSFiles();
});

Given("As organizer I want to send a ISC invite", async function (this: any) {
  this.event = await createISCEvent();
});

Then("As organizer I want to validated the ISC event is created", async function (this: any) {
  await validateOrganizerEvent(this.event);
});

When("As attendee I receive the ISC invite", async function (this: any) {
  this.attendeeEvent = await getAttendeISCevents(this.event.data.iCalUID!);
});

Then("As attendee I want to respond to the invite with {string}", async function (this: any, response: string) {
  // Capture the response status from the feature file parameter (e.g., "accepted", "declined")
  // This value comes from: features/appoitments/appoitment.feature line with {string}
  this.attendeeResponse = response;
  await attendeeRespondToInvite(this.attendeeEvent?.id, response);
});

Then("As organizer I validate the ICS contains the proper response", async function (this: any) {
  // Pass the captured response status from the feature file to validation
  // The validation will compare this against the actual values in:
  // 1. Google Calendar API response (organizer sees it)
  // 2. .ics-exports/attendee-event-*.ics file PARTSTAT field
  await validateAttendeeResponseInICS(this.event?.data?.id, this.attendeeResponse, "aattendie@gmail.com");
});

Then("As organizer I remove the event from the calendar", async function (this: any) {
  await deleteEvent(this.event?.data?.id);
});

Then("As organizer I want to validated the ISC event is deleted", async function (this: any) {
  await validateEventDeleted(this.event);
});
