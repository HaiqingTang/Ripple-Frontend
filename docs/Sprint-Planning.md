# Sprint Planning

## Sprint Details
- **Sprint Number**: Sprint 1
- **Start Date**: 2025-08-19
- **End Date**: 2025-08-29
- **Sprint Goal**: Use Figma to show the increment for Interest Subscription, Offline Connections, Challenges & Rewards, including browse/search/recommendation, location-based meetup creation, RSVP & participation management, and challenge discovery, check-in, and reward redemption.

---

## Sprint Backlog

| ID  | User Story Description | Priority | Estimation | Assignee | Status |
|-----|------------------------|----------|------------|----------|--------|
| US1 | Browse clubs and meetups | High | 3 SP | XinYu Ye | To do |
| US2 | Search for a specific club or meetup | High | 3 SP | XinYu Ye | To do |
| US3 | View details of a club or meetup | High | 5 SP | XinYu Ye | To do |
| US4 | Join or leave a club | High | 3 SP | XinYu Ye | To do |
| US5 | RSVP or cancel RSVP for a meetup | High | 3 SP | XinYu Ye | To do |
| US6 | Post and interact (e.g., comment) in a club | High | 8 SP | XinYu Ye | To do |
| US7 | Filter clubs or meetups by category | Medium | 5 SP | XinYu Ye | Not Started |
| US8 | See a list of clubs I have joined | Medium | 3 SP | XinYu Ye | Not Started |
| US9 | See a list of meetups I have registered for | Medium | 3 SP | XinYu Ye | Not Started |
| US10 | See a rotating banner of featured clubs or meetups | Low | 8 SP | XinYu Ye | Not Started |
| US11 | Create and manage my own club | Low | 5 SP | HaiQing Tang | Not Started |
| US12 | Create a meetup and invite members from the same organization | Low | 5 SP | HaiQing Tang | Not Started |
| US13 | Search for nearby meetups (location-based) | High | 5 SP | HaiQing Tang | To do |
| US14 | View a recommended list of meetups | Medium | 3 SP | HaiQing Tang | Not Started |
| US15 | View a “see more” / full list of meetups | High | 3 SP | HaiQing Tang | To do |
| US16 | View meetup details (posted time, host, location, description, participants) | High | 5 SP | HaiQing Tang | To do |
| US17 | Filter meetups by topic (e.g., fitness, art, nutrition, meditation) | Medium | 5 SP | HaiQing Tang | Not Started |
| US18 | Join a meetup | High | 3 SP | HaiQing Tang | To do |
| US19 | Create and publish an offline meetup (topic, location, time, description, capacity) | High | 5 SP | HaiQing Tang | To do |
| US20 | Manage my published meetups (edit details or cancel) | Medium | 5 SP | HaiQing Tang | Not Started |
| US21 | View the current participant count and roster | Low | 3 SP | HaiQing Tang | Not Started |
| US22 | View the challenge welcome message & navigation | High | 3 SP | YiFie Jiang | To do |
| US23 | View challenge cards with different themes | High | 2 SP | YiFie Jiang | To do |
| US24 | Browse lists of challenges in different themes | Medium | 2 SP | YiFie Jiang | Not Started |
| US25 | View challenge cards with different themes | Medium | 1 SP | YiFie Jiang | Not Started |
| US26 | View my ongoing and completed challenges | High | 2 SP | YiFie Jiang | To do |
| US27 | Interact with my challenge cards | High | 3 SP | YiFie Jiang | To do |
| US28 | See a list of completed challenges | Medium | 3 SP | YiFie Jiang | Not Started |
| US29 | View my current challenge information | High | 3 SP | YiFie Jiang | To do |
| US30 | Check in with notes or a photo | High | 3 SP | YiFie Jiang | To do |
| US31 | Post a new challenge | Low | 8 SP | YiFie Jiang | Not Started |
| US32 | View a reward list | High | 3 SP | YiFie Jiang | To do |
| US33 | View detailed reward information | High | 3 SP | YiFie Jiang | To do |
| US34 | Redeem a reward | High | 5 SP | YiFie Jiang | To do |
| US35 | Set rewards for challenges | Low | 8 SP | YiFie Jiang | Not Started |
| US36 | Search for a specific reward | Medium | 3 SP | YiFie Jiang | Not Started |
| US37 | Search for a specific challenge | Medium | 3 SP | YiFie Jiang | Not Started |
| US38 | Observe my current challenge progress bar | High | 3 SP | YiFie Jiang | To do |
| US39 | Post a new challenge | High | 5 SP | YiFie Jiang | To do |
| US40 | Set rewards for challenges | High | 5 SP | YiFie Jiang | To do |

---

## Tasks Breakdown (Sprint 1)

| Task ID | Task Description | Related User Story | Assignee | Priority | Estimation | Status | Dependencies | Acceptance Criteria |
|---------|------------------|--------------------|----------|----------|------------|--------|--------------|---------------------|
| T1 | Implement club/meetup browsing UI (Figma prototype) | US1, US2 | XinYu Ye | High | 2 days | To do | Agreed IA; seed data; shared design tokens | User can open Clubs/Meetups pages in prototype, see list of items with placeholders when empty, and navigate to detail screens. |
| T2 | Build club/meetup detail page (Figma prototype) | US3, US16 | XinYu Ye / HaiQing Tang | High | 3 days | To do | T1 list views; content template; component library | Detail page displays description, members/participants, time and location; navigation back works; placeholders shown while loading. |
| T3 | Join/Leave & RSVP flows (Figma prototype) | US4, US5, US18 | XinYu Ye / HaiQing Tang | High | 3 days | To do | T2 detail page; CTA button components | Prototype allows user to tap Join/Leave or RSVP/Cancel; button state updates immediately; “My Clubs/My Meetups” views reflect changes. |
| T4 | Challenge cards and theme browsing (Figma prototype) | US22–US25 | MingYang Wang | High | 5 days | To do | Challenge taxonomy; card component set | Theme overview shows default challenges (Art, Tech, Nutrition, Meditation, Fitness); each card has title/desc/icon; clicking navigates to theme list. |
| T5 | Rewards module (view, redeem, set) (Figma prototype) | US32–US36, US40 | Yifei Jiang / ZiRui Zhao | High | 8 days | To do | Reward schema; Figma asset set | Rewards grid and detail screens designed; redeem confirmation flow works; prototype covers insufficient points and out-of-stock states. |

---

## Risks
  - Concurrent editing in Figma may cause conflicts.
  - Inconsistent interaction patterns across modules.
  - Heavy prototype interactions (map/check-in) may lag or be limited.

---

## Sprint Commitments
- Complete core **Figma prototypes** for:
  - **Clubs & Events**: browse, search, details, join/leave, RSVP.
  - **Challenges & Rewards**: theme browsing, progress, reward list/detail, redemption flows.
- Ensure prototypes demonstrate success/empty/error/loading states.

---

## Notes
- This sprint is **prototype-only**; no production code is expected.

---

- **Sprint Number**: Sprint 2
- **Start Date**: 2025-09-01
- **End Date**: 2025-09-28
- **Sprint Goal**: Deliver the first usable increment for **Interest Subscription** and **Offline Connections** modules, including browse/search/recommendation and location-based meetup creation, RSVP, and details.

---

## Sprint Backlog (Dev)

| ID  | User Story Description                                                                 | Priority | Estimation | Assignee       | Status       |
|-----|-----------------------------------------------------------------------------------------|:--------:|:----------:|----------------|--------------|
| US1 | [IS] Browse clubs and meetups                                                           | High     | 3          | Mingyang Wang  | Not Started  |
| US2 | [IS] Search for a specific club or meetup                                               | High     | 3          | Yifei Jiang    | Not Started  |
| US3 | [IS] View details of a club or meetup                                                   | High     | 5          | Zirui Zhao     | Not Started  |
| US7 | [IS] Filter clubs or meetups by category                                                | Medium   | 5          | Mingyang Wang  | Not Started  |
| US10| [IS] Rotating banner of featured clubs or meetups                                       | Low      | 8          | Zirui Zhao     | Not Started  |
| US14| [IS] Recommended list of meetups                                                        | Medium   | 3          | Yifei Jiang    | Not Started  |
| US15| [IS] “See more” / full list of meetups                                                  | High     | 3          | Mingyang Wang  | Not Started  |
| US17| [IS] Filter meetups by topic (fitness, art, nutrition, meditation)                      | Medium   | 5          | Yifei Jiang    | Not Started  |
| US13| [OC] Search for nearby meetups (location-based)                                         | High     | 5          | Xinyu Ye       | Not Started  |
| US16| [OC] View meetup details (time, host, location, description, participants)              | High     | 3          | Haiqing Tang   | Not Started  |
| US18| [OC] Join a meetup                                                                      | High     | 3          | Haiqing Tang   | Not Started  |
| US19| [OC] Create & publish an offline meetup (topic, location, time, description, capacity)  | High     | 5          | Xinyu Ye       | Not Started  |
| US20| [OC] Manage my published meetups (edit details or cancel)                               | Medium   | 3          | Xinyu Ye       | Not Started  |
| US21| [OC] View current participant count and roster                                          | Low      | 3          | Haiqing Tang   | Not Started  |
| US5 | [OC] RSVP or cancel RSVP for a meetup                                                   | High     | 3          | Haiqing Tang   | Not Started  |
| US9 | [OC] List of meetups I have registered for                                              | Medium   | 3          | Xinyu Ye       | Not Started  |

> `[IS]` = Interest Subscription, `[OC]` = Offline Connections.

---

## Tasks Breakdown (Sprint 2)

| Task ID | Task Description | Related User Story | Assignee | Priority | Estimation | Status | Dependencies | Acceptance Criteria |
|---------|------------------|--------------------|----------|----------|------------|--------|--------------|---------------------|
| T1 | Repo bootstrap (monorepo structure, dependencies, env, lint/format, pre-commit) | US1, US2 | Mingyang Wang | High | 2 days | Not Started | Node/Python toolchains; CI tokens | Repo builds locally; lint and format pass; pre-commit hooks active; CI pipeline runs and passes on empty project. |
| T2 | Data models and API draft (Club/Meetup/Category/Topic/RSVP/Participant) | US3, US5, US19 | Xinyu Ye | High | 2 days | Not Started | DB schema; minimal auth | ERD is committed; database migration runs; mock CRUD endpoints return valid JSON; Postman collection created. |
| T3 | Browse and pagination APIs with list pages | US1, US15 | Mingyang Wang | High | 2 days | Not Started | T2 models; seed data | `/clubs` and `/meetups` endpoints support paging/sorting; UI list pages show items, empty states, and load next page smoothly. |
| T4 | Keyword and compound search backend with search UI | US2, US7, US17 | Yifei Jiang | High | 3 days | Not Started | T2 indices; query builder | Search results update in real time; fuzzy search supported; filters combine with keywords; no-result state is shown with message. |
| T5 | Recommendation list (rule-based v1) | US14 | Yifei Jiang | Medium | 2 days | Not Started | Activity logs; rules for trending | `/meetups/recommended` endpoint returns at least 8 items; each shows “why recommended”; fallback to trending items if none. |
| T6 | Featured carousel component with backend configuration | US10 | Zirui Zhao | Low | 2 days | Not Started | Asset storage; CDN | Carousel displays 3–5 featured items; manual pin/weight configuration works; items are clickable and accessible. |
| T7 | Meetup details page and API | US16 | Haiqing Tang | High | 2 days | Not Started | T2 models; map link integration | Detail page shows host, time, location, participants, description; join/leave state updates correctly; error and retry paths covered. |
| T8 | RSVP / Cancel RSVP API and UI flow | US5, US18 | Haiqing Tang | High | 2 days | Not Started | Auth stub; T7 detail page | POST/DELETE RSVP updates participant count; UI toggle updates instantly; “My Meetups” list reflects current status; full event case handled. |
| T9 | “My Registered Meetups” API and page | US9 | Xinyu Ye | Medium | 1.5 days | Not Started | RSVP table; user auth | `/me/meetups` endpoint returns RSVP’d events; UI shows sorted by date; empty state displays “You haven’t registered for any meetups yet.” |
| T10 | Create/Publish meetup form (validation: topic, location, time, capacity, description) | US19 | Xinyu Ye | High | 3 days | Not Started | Geocoding API; role-based auth | Form validates all fields; only future dates allowed; successful POST creates meetup; success toast and link shown; errors inline. |
| T11 | Manage meetups (edit/cancel) and roster display | US20, US21 | Xinyu Ye | Medium | 2 days | Not Started | T10 create; notification service | Editing updates details instantly; cancelling notifies participants; roster shows participants and count; permission checks enforced. |
| T12 | Location permission and nearby meetups list (distance sorting, map view placeholder) | US13 | Haiqing Tang | High | 2 days | Not Started | Browser/device geolocation | When permission is granted, nearby meetups load within radius and sorted by distance; fallback allows postcode search; error states shown. |
| T13 | Seed/fake data and minimal demo environment | All | Zirui Zhao | High | 1 day | Not Started | Fixtures; image assets | Seed script populates demo DB with ≥20 clubs, ≥40 meetups, ≥10 rewards; demo environment runs locally with one command. |
| T14 | Basic unit/API tests and CI integration | Key APIs | Yifei Jiang | High | 2 days | Not Started | T1 CI; test runner | At least 20 unit/API tests passing; coverage report generated; PRs blocked if tests fail. |
| T15 | UX polish: empty/loading/error states and logging | Lists/Details/Form | Mingyang Wang | Medium | 1.5 days | Not Started | Pages from T3/T7/T10 | All main screens show skeletons and error messages; empty state text is user-friendly; client logs errors to console. |
| T16 | Weekly dogfooding and fixes (Week 2 and Week 3 mini-cycles) | All | Team | Medium | 2 days | Not Started | Deploy preview; feedback sheet | Two internal testing cycles completed; top issues logged and triaged; ≥80% fixed; changelog updated. |

---

## Risks
  - Location permission denied → require postcode fallback.
  - Recommendation v1 is rule-based → set expectations.
  - Scope pressure → keep MVP strict; defer advanced sorting/map interactivity.

---

## Sprint Commitments (Dev)
- Ship an **end-to-end MVP demo**:
  - **Interest Subscription**: browse, search, filters, recommendations, featured carousel, “see more”.
  - **Offline Connections**: nearby list, create/publish meetup, details, RSVP (join/cancel), my registrations, organiser management & counts.
- **Definition of Done (DoD)**: working APIs, demonstrable flows, basic error handling, unit/API tests passing, README/Wiki updated, reproducible demo data.

---

## Notes
- Track stories/tasks in GitHub Projects; update blockers in stand-ups.
- All items start **Not Started** unless explicitly promoted to **In progress** during the sprint.
