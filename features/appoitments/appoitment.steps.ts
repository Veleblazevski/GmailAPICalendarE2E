import { Given, Then, When } from "@wdio/cucumber-framework";
import {
  createISCEvent,
  getAttendeISCevents,
  attendeeRespondToInvite,
  deleteEvent,
} from "../../services/calendar/googleCalendar.service";

import { validateOrganizerEvent, validateEventDeleted } from "../../validations/appoitment.validation";

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
  await attendeeRespondToInvite(this.attendeeEvent?.id, response);
});

Then("As organizer I remove the event from the calendar", async function (this: any) {
  await deleteEvent(this.event?.data?.id);
});

Then("As organizer I want to validated the ISC event is deleted", async function (this: any) {
  await validateEventDeleted(this.event);
});
