# Drimora user-experience review

This review records user-facing issues found while opening the local Drimora
app and preparing screenshots. It is based on the pages available in the
current workspace, not a full production or accessibility audit.

## Findings and improvements

1. **The published demo is unavailable.** The README's hosted demo did not
   open. The broken link was removed and replaced with a shortcut to Local
   Setup; add a Live Demo link only after a working deployment is available.
2. **Tours and account pages depend on backend data.** Tour details and the
   dashboard load data through API requests. Ensure local setup instructions
   include a running backend, configured database, and seeded sample tours.
   Keep clear loading, empty, and retry/error states so API trouble does not
   look like a broken page.
3. **Booking and dashboard screenshots require an authenticated session.**
   The booking flow is protected, and the dashboard needs a signed-in user.
   For demos, provide a safe test account or documented sample credentials;
   never publish a real user's session.
4. **Screenshots can expose account details.** The browser session showed a
   signed-in name and email. The saved dashboard and booking screenshots use
   generic or synthetic details; continue checking screenshots for personal
   information before publishing them.
5. **Mobile screenshots need a layout review, not just a capture.** Verify
   that long headings, destination search controls, navigation, and booking
   forms remain readable and usable at narrow widths and do not clip
   horizontally.

## Screenshot files

Screenshots are stored in [`public/screenshots/`](./public/screenshots/):

- `landing-desktop.png` and `landing-mobile.png`
- `tour-details-desktop.png` and `tour-details-mobile.png`
- `booking-details-desktop.png` and `booking-payment-desktop.png`
- `dashboard-desktop.png` and `dashboard-mobile.png`

No confirmed application-code defect was established during this screenshot
pass. The immediate fix was replacing the unavailable demo link with local
setup guidance; the remaining items are recommendations to verify during
deployment and normal end-to-end testing.
