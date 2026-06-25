Feature: Appoitment loop meeting
  Scenario Outline: Send appotiment loop meeting ISC file and get resposes
    Given As organizer I want to send a ISC invite
    Then As organizer I want to validated the ISC event is created
    When As attendee I receive the ISC invite
    Then As attendee I want to respond to the invite with "declined"
    Then As organizer I remove the event from the calendar
    Then As organizer I want to validated the ISC event is deleted

