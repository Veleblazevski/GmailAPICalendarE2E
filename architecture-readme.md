# AutomationEmailTask Architecture Overview

This document outlines a scalable Page Object Model (POM) structure for the project so that it can grow beyond Google Calendar into other features and platforms.

```text
AutomationEmailTask/
├── Test Specs
│   ├── Features
│   │   ├── appointments/
│   │   │   └── appointment.feature
│   │   └── future-features/
│   │       └── email.feature
│   └── Step Definitions
│       ├── appointment.steps.ts
│       └── future-feature.steps.ts
│
├── Workflows / Services
│   ├── CalendarInviteService
│   │   └── googleCalendar.service.ts
│   ├── AuthService
│   │   ├── googleAuth.ts
│   │   └── oAuth/
│   ├── EmailService
│   │   └── email.service.ts
│   └── NotificationService
│       └── notification.service.ts
│
├── Page Objects
│   ├── Web
│   │   ├── CalendarPage.ts
│   │   └── SettingsPage.ts
│   ├── Android
│   │   └── androidCalendarPage.ts
│   └── iOS
│       └── iosCalendarPage.ts
│
├── Utilities / Helpers
│   ├── ErrorHandling
│   │   └── errorHandling.ts
│   ├── Data / Config
│   │   └── env.ts
│   ├── Validation
│   │   └── appointment.validation.ts
│   └── Exporters
│       └── icsExport.ts
│
├── Test Config
│   ├── wdio.conf.ts
│   └── tsconfig.json
│
└── Documentation
    ├── readme
    └── architecture-readme.md
```

## Short explanation

This structure is based on the framework I already built. To support multiple platforms, I would introduce additional services and a Page Object / Screen Object layer for web and mobile-specific interactions. This keeps the test scenarios reusable while allowing the UI implementation to vary by platform.

## Suggested purpose of each layer

### Test Specs

- Contains feature files and step definitions.
- Keeps scenarios readable and business-focused.

### Workflows / Services

- Holds business logic and reusable services.
- Examples include calendar invite actions, authentication, email flows, and notifications.

### Page Objects

- Encapsulates UI interactions for each screen or component.
- Keeps locators and actions separate from test steps.
- Can be split by platform: Web, Android, and iOS.

### Utilities / Helpers

- Stores validation, error handling, env setup, and export logic.
- Keeps shared support code centralized.

## Growth direction

This structure allows the framework to expand from Google Calendar automation into:

- email workflows
- notification checks
- profile/settings automation
- mobile automation for Android and iOS

The main idea is to keep test scenarios stable while the underlying page objects and services evolve independently.
