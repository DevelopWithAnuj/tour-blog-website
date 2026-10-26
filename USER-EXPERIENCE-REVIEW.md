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
5. **Mobile layout review completed at 375px.** The booking form controls and
   trip summary fit the viewport without page-level horizontal overflow.
   Admin booking and dashboard tables stay inside their cards and scroll
   horizontally within the table area, keeping the rest of the page in view.
   The review used synthetic account and booking data.

## Screenshot files

Screenshots are stored in [`public/screenshots/`](./public/screenshots/):

- `landing-desktop.png` and `landing-mobile.png`
- `tour-details-desktop.png` and `tour-details-mobile.png`
- `booking-details-desktop.png` and `booking-payment-desktop.png`
- `dashboard-desktop.png` and `dashboard-mobile.png`

No additional mobile layout defect was found during the 375px review. The
immediate fix was replacing the unavailable demo link with local setup
guidance; production and end-to-end behavior still require verification with a
running backend and configured database.
