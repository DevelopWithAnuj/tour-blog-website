# Product Requirements Document: Drimora Travel Platform

## 1. Product Overview

Drimora is a travel discovery, booking, and experience-sharing website for travelers, bloggers, and admins. The platform helps users explore destinations, compare tours, book travel packages, read travel stories, and share their own travel experiences through blog-style content.

The current project structure includes a React frontend under `src/pages` and an Express backend organized by routes, controllers, models, middleware, configuration, and utilities.

## 2. Product Goals

- Help travelers discover curated destinations and tour packages.
- Allow users to book tours through a clear booking, payment, and confirmation flow.
- Provide a blog and travel experience-sharing area for travelers and bloggers.
- Provide clear company information, destination information, and customer support resources.
- Give users a dashboard to track bookings and personal activity.
- Give admins tools to manage tours, bookings, users, and blog content.
- Keep the application responsive, easy to navigate, and friendly for first-time travel planners.

## 3. Target Users

| User Type | Description | Primary Needs |
| --- | --- | --- |
| Guest / Non-user | A visitor without an account looking for destinations, tour packages, travel stories, or general help. | Browse public pages, learn about the service, and contact the team. |
| Traveler | A visitor looking for destinations, tour packages, and booking options. | Search, compare, book, pay, view confirmation. |
| Travel Blogger | A traveler or creator who shares experiences, tips, itineraries, and guides. | Publish posts, organize by category, build credibility. |
| Registered User | A logged-in traveler who wants saved history and booking management. | Dashboard, booking status, profile access. |
| Admin | Site operator managing platform content and operations. | Manage tours, bookings, users, and blog posts. |

## 4. Current Structure Alignment

### Frontend Pages

| Product Area | Current Path | Purpose |
| --- | --- | --- |
| Home | `src/pages/Home.jsx` | Landing page, featured destinations, travel inspiration. |
| Tours | `src/pages/Tours/TourListingPage.jsx` | Browse and filter tour packages. |
| Tour Details | `src/pages/Tours/TourDetailsPage.jsx` | Destination details, itinerary, gallery, pricing, booking CTA. |
| Booking | `src/pages/Booking/BookingPage.jsx` | Collect traveler details and selected package data. |
| Payment | `src/pages/Booking/PaymentPage.jsx` | Payment method and payment status flow. |
| Confirmation | `src/pages/Booking/ConfirmationPage.jsx` | Booking success, booking ID, trip summary. |
| Blog | `src/pages/Blog/BlogPage.jsx` | Travel stories, guides, tips, and blogger content. |
| Blog Post | `src/pages/Blog/BlogPostPage.jsx` | Full travel experience or guide article. |
| Public Information & Support | Planned public pages: About, Contact, Contact Support, Help, Privacy, Terms, and Locations. | Company information, self-service help, legal information, destination discovery, and support contact. |
| Dashboard | `src/pages/Dashboard/UserDashboardPage.jsx` | User bookings, saved trips, and profile summary. |
| Auth | `src/pages/Auth/LoginPage.jsx` | Login and user session access. |
| Admin | `src/pages/Admin/AdminDashboardPage.jsx`, `src/pages/Admin/AdminBookingsPage.jsx`, `src/pages/Admin/AdminUsersPage.jsx`, `src/pages/Admin/AdminToursPage.jsx`, `src/pages/Admin/AdminTourFormPage.jsx`, `src/pages/Admin/AdminBlogPage.jsx`, `src/pages/Admin/AdminBlogFormPage.jsx` | Admin dashboard and management of bookings, users, tours, and blog posts. |

### Backend Modules

| Product Area | Current Path | Purpose |
| --- | --- | --- |
| Tours | `backend/routes/tour.Routes.js`, `backend/controllers/tour.Controller.js`, `backend/models/Tour.models.js` | Public tour listing, category, and detail data. |
| Bookings | `backend/routes/booking.Routes.js`, `backend/controllers/booking.Controller.js`, `backend/models/Booking.models.js` | Authenticated booking creation, payment, cancellation, and confirmation. |
| Blog | `backend/routes/blog.Routes.js`, `backend/controllers/blog.Controller.js`, `backend/models/Blog.models.js` | Public blog listing, slug-based post detail, categories, and admin-managed posts. |
| Auth | `backend/routes/auth.Routes.js`, `backend/controllers/auth.Controller.js`, `backend/models/User.models.js`, `backend/middleware/auth.Middleware.js` | Password and OAuth authentication, JWT cookie handling, and role checks. OAuth uses stateless Passport authentication; Express sessions are not used. |
| Admin | `backend/routes/admin.Routes.js`, `backend/controllers/admin.Controller.js`, `backend/validators/index.js` | Admin dashboard metrics and management of bookings, users, tours, and blog posts. |

## 5. MVP Scope

### In Scope

- Responsive home page with destination highlights and booking entry points.
- Tour listing with destination, location, price, duration, category, and image.
- Tour details page with itinerary, gallery, map/location context, FAQs, and booking button.
- Booking flow with traveler details, trip date, guest count, and status.
- Payment and confirmation pages for a complete booking experience.
- Blog listing for travel experiences, guides, and tips.
- Blog post detail page with title, author, category, publish date, image, and article body.
- Public About, Contact, Contact Support, Help, Privacy, Terms, and Locations pages.
- Guest access to public content and general contact/support resources.
- Authenticated travel-experience submissions with admin review before publication.
- User dashboard with current bookings, booking status, and past trips.
- Admin dashboard with bookings overview and basic management.
- Authentication flow with user and admin roles.

### Out of Scope for MVP

- Real payment gateway integration.
- Real-time chat with agents.
- Complex loyalty or referral programs.
- Multi-vendor marketplace support.
- Native mobile apps.
- AI-generated itinerary planning.

## 6. Key User Journeys

### Traveler Books a Tour

1. User lands on the home page.
2. User browses featured destinations or opens the tours page.
3. User filters or selects a tour package.
4. User reviews tour details, itinerary, price, and gallery.
5. User starts booking.
6. User enters traveler details, travel date, and guest count.
7. User completes payment step.
8. User receives confirmation with booking summary and status.
9. User can view the booking from the dashboard.

### Traveler Reads or Shares an Experience

1. User opens the blog page.
2. User browses posts by category, destination, or recency.
3. User opens a blog post.
4. User reads the full travel experience, tips, and itinerary notes.
5. An authenticated user submits a travel experience and any supported media.
6. The submission remains unpublished until an admin reviews and approves it.

### Guest Finds Information or Requests Help

1. A guest browses public pages, tours, blog posts, and locations without signing in.
2. The guest opens Help for common questions or Contact / Contact Support for assistance.
3. The guest submits a general inquiry with contact details; the form confirms receipt without exposing account or booking data.
4. The guest can register or sign in when accessing account-only actions such as booking or submitting content.

### Admin Manages Operations

1. Admin logs in.
2. Admin opens the admin dashboard.
3. Admin reviews booking metrics and recent activity.
4. Admin opens bookings management.
5. Admin updates booking status or reviews booking details.
6. Admin manages tours, users, and blog content as the admin scope expands.

## 7. Functional Requirements

### Home Page

- Show brand identity, headline, and travel discovery message.
- Show featured destinations and popular tours.
- Provide entry points to tours, booking, and blog content.
- Use responsive layout for desktop, tablet, and mobile.

### Tours

- Display a list of available tour packages.
- Support category or destination grouping.
- Show destination name, location, price, duration, image, and short description.
- Link each tour card to a detail page.
- Use backend routes `/api/v1/tours` and `/api/v1/tours/:id` for listing and detail data.

### Tour Details

- Show tour overview, gallery, itinerary, inclusions, exclusions, FAQs, and pricing.
- Include a clear booking call to action.
- Preserve selected tour information when entering the booking flow.

### Booking

- Collect selected tour, user, date, guest count, contact details, and special requests.
- Create bookings through `/api/v1/bookings`.
- Default new bookings to `pending` unless confirmed.
- Validate required fields before continuing to payment.

### Payment

- Show booking summary, total amount, and mock payment method options.
- Support a payment success path that moves the user to confirmation.
- Show failure or retry state for invalid payment attempts.

### Confirmation

- Show booking ID, tour name, travel date, guest count, amount, and status.
- Give user a way to return home, view dashboard, or browse more tours.

### Blog and Experience Sharing

- List travel blog posts with title, author, category, publish date, and excerpt.
- Support categories such as travel guide, itinerary, food, culture, budget travel, and personal experience.
- Show post detail pages with full content and related posts.
- Allow authenticated users to submit travel experiences with a title, category, destination, excerpt, body, and supported media.
- Validate submitted text and media type/size; associate every submission with its author.
- Keep new submissions unpublished until an admin approves them; rejected or pending content must not appear in public listings.
- Allow users to view and manage their own submissions without exposing another user's drafts.
- Use `/api/v1/blogs`, `/api/v1/blogs/:slug`, and `/api/v1/blogs/categories` for public blog reads.

### Public Information and Support

- Provide an About page describing the platform, its purpose, and the travel experience it offers.
- Provide a Contact page with a validated inquiry form that guests and signed-in users can submit.
- Provide a Contact Support path for help with service or bookings; require authentication before displaying or changing private booking details.
- Provide a Help page with browsable common questions and clear links to relevant support/contact options.
- Provide Privacy and Terms pages containing the current policies and effective/updated dates.
- Provide a Locations page to browse supported destinations and link to relevant tours.
- Keep these informational and support pages publicly accessible and usable on mobile and desktop.

### Guest and Non-user Access

- Guests may browse public tours, locations, blog posts, About, Help, Privacy, and Terms pages without an account.
- Guests may submit general contact/support inquiries without signing in, subject to validation and abuse controls.
- Require authentication for booking, viewing personal booking/account data, and submitting or managing travel content.
- Preserve private user, booking, and unpublished content data from unauthenticated access.

### User Dashboard

- Show upcoming bookings, past bookings, booking statuses, and user profile summary.
- Allow the user to view booking details.
- Prepare space for saved destinations and submitted blog posts.

### Admin

- Show total bookings, pending bookings, confirmed bookings, users, and blog stats.
- Allow admin to view and update booking records.
- Use `/api/v1/admin/dashboard`, `/api/v1/admin/bookings`, and `/api/v1/admin/users`.
- Restrict admin pages to users with the `admin` role.

### Authentication

- Support login, logout, and authenticated-user checks using access and refresh token cookies; OAuth uses stateless Passport authentication.
- Use `/api/v1/auth/login`, `/api/v1/auth/logout`, and `/api/v1/auth/current-user`.
- Support at least two roles: `user` and `admin`.

## 8. Data Model Requirements

### User

- `id`
- `name`
- `email`
- `role`
- `createdAt`
- `updatedAt`

### Tour

- `id`
- `destination`
- `location`
- `price`
- `duration`
- `category`
- `description`
- `images`
- `itinerary`
- `inclusions`
- `exclusions`
- `availableDates`

### Booking

- `id`
- `tourId`
- `userId`
- `date`
- `guestCount`
- `travelerName`
- `travelerEmail`
- `travelerPhone`
- `totalAmount`
- `paymentStatus`
- `status`
- `createdAt`
- `updatedAt`

### BlogPost

- `id`
- `title`
- `slug`
- `author`
- `category`
- `destination`
- `excerpt`
- `content`
- `coverImage`
- `publishedAt`
- `status`

## 9. API Requirements

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/healthcheck` | Server status check. |
| POST | `/api/v1/auth/register` | Register user and send verification email. |
| GET | `/api/v1/auth/verify-email/:verificationToken` | Verify email. |
| POST | `/api/v1/auth/resend-email-verification` | Resend verification link. |
| POST | `/api/v1/auth/login` | Log user in. |
| POST | `/api/v1/auth/logout` | Log user out. |
| GET | `/api/v1/auth/current-user` | Get the authenticated user from the access-token cookie. |
| POST | `/api/v1/auth/refresh-token` | Refresh access token. |
| POST | `/api/v1/auth/forgot-password` | Request password reset. |
| POST | `/api/v1/auth/reset-password/:resetToken` | Reset password. |
| POST | `/api/v1/auth/change-password` | Change password. |
| GET | `/api/v1/auth/google`, `/api/v1/auth/github` | Start OAuth sign-in. |
| GET | `/api/v1/auth/google/callback`, `/api/v1/auth/github/callback` | Complete OAuth sign-in and issue authentication cookies. |
| GET | `/api/v1/tours` | List public tours. |
| GET | `/api/v1/tours/:id` | Get tour details. |
| GET | `/api/v1/tours/categories` | List tour categories. |
| POST | `/api/v1/bookings` | Create a booking (authenticated). |
| GET | `/api/v1/bookings` | List the authenticated user's bookings. |
| GET | `/api/v1/bookings/:id` | Get a booking detail (authenticated). |
| POST | `/api/v1/bookings/:id/pay` | Submit payment for a booking. |
| PATCH | `/api/v1/bookings/:id/cancel` | Cancel a booking. |
| PATCH | `/api/v1/bookings/:id/confirm` | Confirm a booking (admin only). |
| GET | `/api/v1/blogs` | List published blog posts. |
| GET | `/api/v1/blogs/categories` | List public blog categories. |
| GET | `/api/v1/blogs/:slug` | Get a published blog post and related posts by slug. |
| GET | `/api/v1/admin/dashboard` | Get admin dashboard metrics (admin only). |
| GET, PATCH | `/api/v1/admin/bookings`, `/api/v1/admin/bookings/:id/status` | List bookings and update a booking status (admin only). |
| GET, PATCH | `/api/v1/admin/users`, `/api/v1/admin/users/:id/role` | List users and update a user's role (admin only). |
| GET, POST | `/api/v1/admin/tours` | List and create tours (admin only). |
| GET, PUT | `/api/v1/admin/tours/:id` | Get and update a tour (admin only). |
| PATCH | `/api/v1/admin/tours/:id/active` | Change a tour's active status (admin only). |
| GET, POST | `/api/v1/admin/blogs` | List and create blog posts (admin only). |
| GET, PUT, DELETE | `/api/v1/admin/blogs/:id` | Get, update, and delete a blog post (admin only). |
| PATCH | `/api/v1/admin/blogs/:id/status` | Change a blog post's publication status (admin only). |

## 10. Non-Functional Requirements

- The site must be responsive across desktop, tablet, and mobile.
- Pages should load quickly and avoid unnecessary heavy assets.
- Navigation should be clear and consistent across product areas.
- Forms must show validation errors clearly.
- Admin-only areas must be protected by role checks.
- User-facing content should be accessible with semantic HTML, readable contrast, and keyboard-friendly controls.
- API responses should return predictable status codes and error messages.

## 11. Success Metrics

- Tour listing to tour detail click-through rate.
- Tour detail to booking start rate.
- Booking start to confirmation completion rate.
- Blog post views and average reading time.
- Returning users viewing dashboard.
- Admin booking processing time.
- Mobile usability and performance scores.

## 12. Milestones

| Phase | Deliverables |
| --- | --- |
| Phase 1: Structure | Routing, layout, shared header/sidebar, placeholder data wiring. |
| Phase 2: Tours | Tour listing, detail pages, category support, image gallery. |
| Phase 3: Booking | Booking form, payment mock, confirmation, dashboard booking view. |
| Phase 4: Blog | Blog listing, post detail, categories, blogger-ready content model. |
| Phase 5: Admin | Admin dashboard, booking management, user management basics. |
| Phase 6: Polish | Responsive fixes, validation, accessibility, performance pass. |

## 13. Acceptance Criteria

- A user can browse tours, open a tour detail page, and start a booking.
- A user can complete the booking flow through confirmation.
- A user can browse blog posts and open a blog post detail page.
- A guest can access public information, browse locations and content, and submit a general inquiry without signing in.
- An authenticated user can submit a travel experience, and it remains unpublished until admin approval.
- Guests cannot book, access private account/booking data, or submit/manage user-generated content.
- A logged-in user can see their dashboard and booking history.
- An admin can access admin pages and view booking management data.
- Backend route files, controllers, services, and models match the product areas described in this PRD.
- The site works on common mobile and desktop viewport sizes.

## 14. Open Questions

- Should content uploads support image attachments only, or additional media types?
- Which payment gateway should be used after MVP?
- Should tour availability be date-based, inventory-based, or manually controlled by admins?
- Should the project continue migrating legacy HTML pages into React pages, or keep both versions available?
