# User Story Overview 

| ID  | As a... | I want to... | So that... | Priority | Estimation | Status       |
|-----|---------|--------------|------------|----------|------------|--------------|
| US1 | User | Browse clubs and meetups | I can discover clubs and activities that interest me | High | 3 SP | To do |
| US2 | User | Search for a specific club or meetup | I can quickly find what I’m looking for | High | 3 SP | To do |
| US3 | User | View details of a club or meetup | I can understand the purpose, members, and schedule before joining | High | 5 SP | To do |
| US4 | User | Join or leave a club | I can manage my memberships easily | High | 3 SP | To do |
| US5 | User | RSVP or cancel RSVP for a meetup | I can manage my attendance | High | 3 SP | To do |
| US6 | User | Post and interact(e.g., comment) in a club | I can engage with other members | High | 8 SP | To do |
| US7 | User | Filter clubs or meetups by category | I can not only narrow down my choices but also discover groups that suit my interests, even if I don’t remember the exact club name | Medium | 5 SP | Not Started |
| US8 | User | See a list of clubs I have joined | I can easily access them again | Medium | 3 SP | Not Started |
| US9 | User | See a list of meetups I have registered for | I can keep track of my plans | Medium | 3 SP | Not Started |
| US10 | User | See a rotating banner of featured clubs or meetups | I can quickly discover highlights | Low | 8 SP | Not Started |
| US11 | Organization user | Create and manage my own club | Our members can conveniently discuss shared interests | Low | 5 SP | Not Started |
| US12 | Organization user | Sreate a meetup and invite members from the same organization | They can join our offline activities | Low | 5 SP | Not Started |
| US13 | User | search for nearby meetups (location-based) | I can quickly find activities close to me for in-person catch-ups | High | 5 SP | To do |
| US14 | User | View a recommended list of meetups | I can discover the most relevant or popular offline activities | Medium | 3 SP | Not Started |
| US15 | User | Siew a “see more” / full list of meetups | I can browse all available options beyond the recommendations | High | 3 SP | To do |
| US16 | User | Siew meetup details (posted time, host, location, description, participants) | I can assess the event before joining | High | 5 SP | To do |
| US17 | User | Silter meetups by topic (e.g., fitness, art, nutrition, meditation) | I can quickly find activities that match my interests | Medium | 5 SP | Not Started |
| US18 | User | Join a meetup | I can participate in face-to-face activities (e.g., coffee, walk) | High | 3 SP | To do |
| US19 | Organiser | create and publish an offline meetup (topic, location, time, description, capacity) | I can initiate gatherings and attract like-minded people | High | 5 SP | To do |
| US20 | Organiser | manage my published meetups (edit details or cancel) | I can keep information accurate or stop an event when necessary | Medium | 5 SP | Not Started |
| US21 | Organiser | View the current participant count and roster | I can plan for capacity and onsite arrangements | Low | 3 SP | Not Started |
| US22 | Volunteer user | View the challenge welcome message & navigation | I can quickly access my challenges and rewards | High | 3 SP | To do |
| US23 | Volunteer user | View challenge cards with different themes | I can discover available challenges by topic | High | 2 SP | To do |
| US24 | Volunteer user | Browse lists of challenges in different themes | I can discover challenges by topic | Medium | 2 SP | Not Started |
| US25 | Volunteer user | View challenge cards with different themes | I can discover available theme challenges | Medium | 1 SP | Not Started |
| US26 | Volunteer user | View my ongoing and completed challenges | I can track my progress | High | 2 SP | To do |
| US27 | Volunteer user | Interact with my challenge cards | I can check in and update my progress | High | 3 SP | To do |
| US28 | Volunteer user | See a list of completed challenges | I can review my achievements | Medium | 3 SP | Not Started |
| US29 | Volunteer user | View my current challenge information | I can understand my status | High | 3 SP | To do |
| US30 | Volunteer user | Check in with notes or a photo | I can log my daily progress | High | 3 SP | To do |
| US31 | Enterprise | Post a new challenge | I can engage volunteers in my organization’s initiatives | Low | 8 SP | Not Started |
| US32 | Volunteer user | View a reward list | I can see what incentives are available | High | 3 SP | To do |
| US33 | Volunteer user | View detailed reward information | I can understand what I can redeem | High | 3 SP | To do |
| US34 | Volunteer user | Redeem a reward | I can use the points I earned from challenges | High | 5 SP | To do |
| US35 | Enterprise | Set rewards for challenges | I can incentivize volunteers | Low | 8 SP | Not Started |
| US36 | Volunteer user | Search for a specific reward | I can quickly find the reward I want to redeem | Medium | 3 SP | Not Started |
| US37 | Volunteer user | Search for a specific challenge | I can quickly locate a challenge of interest | Medium | 3 SP | Not Started |
| US38 | Volunteer user | Observe my current challenge progress bar | I can clearly track how close I am to completing the challenge | High | 3 SP | To do |
| US39 | Volunteer user | Post a new challenge | I can create and share activities with the community | High | 5 SP | To do |
| US40 | Volunteer user | Set rewards for challenges | I can incentivize participants with points or small prizes | High | 5 SP | To do |

## Detailed User Stories

#### User Story ID: US1

- **Title:** Browse clubs and meetups
- **As a** user, **I want to** browse clubs and meetups, **so that** I can discover clubs and activities that interest me.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - User can see a list of clubs on the “Clubs” page.
  - User can see a list of meetups on the “Meetups” page.
  - Lists are never empty; default recommendations are displayed.
- **Dependencies:**
  - Clubs and meetups data available in the database.
  - UI list component implemented.
- **Notes:**
  - Entry point should be clearly visible on the homepage/navigation.
  - Show placeholders or loading indicators while data loads.

#### User Story ID: US2

- **Title:** Search clubs or meetups
- **As a** user, **I want to** search for a specific club or meetup, **so that** I can quickly find what I’m looking for.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - User can enter keywords in a search bar.
  - The system returns matching clubs or meetups in real time.
  - If no results, show “No results found”.
- **Dependencies:**
  - Search API or retrieval function available.
  - UI search bar component implemented.
- **Notes:**
  - Support fuzzy search (e.g., “foot” should match “Football Club”).
  - Default search view shows popular/recent searches.

#### User Story ID: US3

- **Title:** View details
- **As a** user, **I want to** view details of a club or meetup, **so that** I can understand the purpose, members, and schedule before joining.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Clicking a club/meetup card opens a detail page.
  - Detail page shows key info (description, members/participants, time and location).
  - User can navigate back to the previous page.
- **Dependencies:**
  - Clubs and meetups detail data in database.
  - UI detail page template.
- **Notes:**
  - Keep page simple; highlight key information.

#### User Story ID: US4

- **Title:** Join/leave a club
- **As a** user, **I want to** join or leave a club, **so that** I can manage my memberships easily.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - “Join/Leave” button is visible on club detail page.
  - Button state updates after user action.
  - Membership status persists when user returns.
- **Dependencies:**
  - User–club relationships stored in database.
  - User authentication is required.
- **Notes:**
  - Provide clear feedback after action (e.g., “Joined ”).

#### User Story ID: US5

- **Title:** RSVP/cancel RSVP for a meetup
- **As a** user, **I want to** RSVP or cancel RSVP for a meetup, **so that** I can manage my attendance.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - “Join/Cancel” button is visible on the meetup detail page.
  - RSVP status is displayed in “My Meetups”.
  - Button state updates after action.
- **Dependencies:**
  - RSVP info stored in database.
  - User authentication required.
- **Notes:**
  - If the event is full, button should be disabled or show message.

#### User Story ID: US6

- **Title:** Post and interact in a club
- **As a** user, **I want to** post and interact (e.g., comment) within a club, **so that** I can engage with other members.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 8 Story Points
- **Acceptance Criteria:**
  - User can create a post with title and content.
  - Posts are displayed in the club’s feed.
  - Other users can like or comment.
  - Comments appear under the post.
- **Dependencies:**
  - Posts and comments stored in database.
  - UI components for post cards and comment section.
- **Notes:**
  - Limit post length for readability.
  - Timestamps should display relative time (e.g., “5 min ago”).

#### User Story ID: US7

- **Title:** Filter clubs or meetups by category
- **As a** user, **I want to** filter clubs or meetups by category, **so that** I can not only narrow down my choices but also discover groups that suit my interests, even if I don’t remember the exact name.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Categories (e.g., Sports, Arts, Food) are shown as filter options.
  - User can select one or multiple categories.
  - Filtered list updates in real time.
  - If no match, show “No results found”.
- **Dependencies:**
  - Category fields stored in database.
  - UI filter buttons implemented.
- **Notes:**
  - Filters should be easy to toggle on/off.
  - Default view = “All”.

#### User Story ID: US8

- **Title:** View joined clubs
- **As a** user, **I want to** see a list of clubs I have joined, **so that** I can easily access them again.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - “My Clubs” page lists all clubs user has joined.
  - Clicking a club navigates to its detail page.
- **Dependencies:**
  - User–club relationships stored in database.
  - User authentication required.
- **Notes:**
  - Empty state message: “You haven’t joined any clubs yet.”

#### User Story ID: US9

- **Title:** View registered meetups
- **As a** user, **I want to** see a list of meetups I have registered for, **so that** I can keep track of my plans.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - “My Meetups” page lists events the user RSVP’d to.
  - Events sorted by date/time.
  - User can click to open detail page.
- **Dependencies:**
  - User–meetup RSVP status stored in database.
  - User authentication required.
- **Notes:**
  - Empty state message: “You haven’t registered for any meetups yet.”

#### User Story ID: US10

- **Title:** Rotating banner
- **As a** user, **I want to** see a rotating banner of featured clubs or meetups, **so that** I can quickly discover highlights.
- **Priority:** Low
- **Status:** Draft
- **Estimation:** 8 Story Points
- **Acceptance Criteria:**
  - Banner area automatically switches every few seconds.
  - User can swipe/scroll manually.
  - Each banner is clickable and navigates to detail page.
- **Dependencies:**
  - UI carousel/slider component.
  - Banner data source (featured clubs/meetups).
- **Notes:**
  - Animation should be smooth.
  - Limit to 3–5 banners maximum.

#### User Story ID: US11

- **Title:** Organization creates a club
- **As a** organization user, **I want to** create and manage my own club, **so that** our members can conveniently discuss shared interests.
- **Priority:** Low
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Organization user can access a “Create Club” option.
  - User can enter club details (name, description, category, logo).
  - The new club appears in the club list after approval.
- **Dependencies:**
  - Organization user authentication and verification system.
  - Database support for club ownership and management.
- **Notes:**
  - Clubs created by organizations should be clearly marked as “Official” or “Verified”.

#### User Story ID: US12

- **Title:** Organization hosts a meetup
- **As a** organization user, **I want to** create a meetup and invite members from the same organization, **so that** they can join our offline activities.
- **Priority:** Low
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Organization user can access a “Create Meetup” option.
  - User can set event details (title, date, time, location, description).
  - The meetup is only open to members of the same organization.
  - Registered users can see the event in “My Meetups”.
- **Dependencies:**
  - Organization user authentication and verification.
  - Database support for associating events with organizations.
- **Notes:**
  - Meetups created by organizations should be highlighted (e.g., “Official Event”).

#### User Story ID: US13

- **Title:** Search nearby meetups (location-based)
- **As a** user, **I want to** search for nearby meetups based on my current location, **so that** I can quickly find convenient in-person activities.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - When permission is granted, the app uses current location and shows meetups within a default radius (e.g., 5–10 km), sorted by distance.
  - If permission is denied or unavailable, the user can search by suburb/postcode or drop a pin.
  - User can adjust the search radius (slider or presets).
  - Empty state never shows a blank screen; fallback to popular city-wide meetups with a prompt to broaden filters.
  - Errors (GPS off / network) display a clear message with retry.
- **Dependencies:**
  - Location permission & geolocation service
  - meetups index with coordinates
  - distance sorting; search UI.
- **Notes:**
  - Consider battery usage and frequency of location updates; show loading/placeholder while fetching.

#### User Story ID: US14

- **Title:** View a recommended list of meetups
- **As a** user, **I want to** view a recommended list of meetups, **so that** I can discover relevant or popular activities quickly.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - “Recommended” section is visible on the Meetups home.
  - Each card shows title, topic, date/time, location (suburb), and distance (if known).
  - Personalisation uses interests/history when available; otherwise shows trending.
  - Limit to N items with a “See more” entry point.
  - List is never empty; default recommendations appear.
- **Dependencies:**
  - Recommendation service (rules or ML)
  - meetups catalogue
  - card list UI.
- **Notes:**
  - Show small “Why recommended” hints (topic match/trending); include skeleton loaders.

#### User Story ID: US15

- **Title:** View a “see more” / full list of meetups
- **As a** user, **I want to** view a full list of meetups, **so that** I can browse beyond the recommended items.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - “See more” opens a paginated/infinite list of all available meetups.
  - Supports sorting (Soonest, Closest, Most popular).
  - Works with active filters (topic, distance).
  - Empty state suggests clearing filters or widening radius.
  - Performance: list loads next page smoothly (no layout shift).
- **Dependencies:**
  - Pagination API
  - sorting options
  - list UI with virtualisation.
- **Notes:**
  - Keep back/restore scroll position when returning from details.

#### User Story ID: US16

- **Title:** View meetup details
- **As a** user, **I want to** view meetup details, **so that** I can assess the event before joining.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Details page shows posted time, organiser, location (map link), description, date/time, capacity, current participants.
  - Shows distance and transport hint (optional).
  - “Join/Leave” (or RSVP) CTA reflects current state; disabled for past/cancelled events.
  - Share action copies link or native share.
  - If data is loading, show placeholders; on error, show retry.
- **Dependencies:**
  - Meetup details API
  - map/deeplink
  - join status endpoint
  - share integration.
- **Notes:**
  - Consider safety guidance and meeting point clarity.

#### User Story ID: US17

- **Title:** Filter meetups by topic
- **As a** user, **I want to** filter meetups by topic (e.g., fitness, art, nutrition, meditation), **so that** I can quickly find activities that match my interests.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Topic filter (chips/multi-select) is available on lists and persists while browsing.
  - Filters combine with distance and sort.
  - Clear “Reset filters” action.
  - Selected filters are visible and removable from the list header.
  - No-result state suggests related topics.
- **Dependencies:**
  - Taxonomy for topics
  - filterable search API
  - filter UI.
- **Notes:**
  - Keep a small set of featured topics plus “View all”.

#### User Story ID: US18

- **Title:** Join a meetup
- **As a** user, **I want to** join a meetup, **so that** I can participate in face-to-face activities (e.g., coffee, walk).
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - Tapping “Join” adds me to the participant list and updates the count instantly.
  - Capacity checks prevent over-booking; show waitlist if enabled.
  - I can cancel my RSVP; organisers see the change.
  - Confirmation/feedback messages are shown (joined / cancelled).
  - Optional: “Add to calendar” after joining.
- **Dependencies:**
  - Auth/session.
  - Join/cancel endpoints.
  - Capacity rules.
  - Optional calendar/deeplink.
- **Notes:**
  - Respect cut-off time and organiser policies (e.g., auto-remove no-shows).

#### User Story ID: US19

- **Title:** Create and publish a meetup
- **As a** organiser, **I want to** create and publish a meetup, **so that** I can initiate in-person gatherings and attract like-minded people.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Form captures topic, title, description, location (map/search), date/time, capacity, visibility.
  - Validates required fields and time in the future.
  - On publish, event is visible in search/recommendations per visibility rules.
  - Success state shows a link to share and a manage button.
  - Draft can be saved and resumed.
- **Dependencies:**
  - Auth/roles (organiser).
  - Create/update API.
  - Geocoding.
  - Validation.
  - Share.
- **Notes:**
  - Consider moderation or flagging.
  - Show guidance for safe, inclusive events.

#### User Story ID: US20

- **Title:** Manage my published meetups (edit/cancel)
- **As a** organiser, **I want to** manage my published meetups, **so that** I can keep details accurate or cancel if needed.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - Organiser can edit title, description, time, location, capacity (with sensible limits once people joined).
  - Cancelling marks the event as cancelled and notifies participants.
  - Changes are reflected on details and lists immediately.
  - Audit of last updated time and by whom (self).
  - Prevent editing past events.
- **Dependencies:**
  - Update/cancel endpoints.
  - Participant notification service.
  - Permissions.
- **Notes:**
  - If time is changed, prompt to notify attendees.
  - Consider re-confirm RSVP.

#### User Story ID: US21

- **Title:** View participant count and roster
- **As a** organiser, **I want to** view the participant count and roster, **so that** I can plan capacity and onsite arrangements.
- **Priority:** Low
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - Shows total count and a roster with name/avatar (respecting privacy settings).
  - Indicates waitlisted users if enabled.
  - Export/Copy list (optional).
  - Updates in real-time when users join/leave.
  - Access restricted to the organiser (and authorised admins).
- **Dependencies:**
  - Participants API.
  - Real-time updates (polling/WebSocket).
  - Auth.
- **Notes:**
  - Consider attendee privacy (e.g., hide contact info; allow users to opt-out of roster visibility).

#### User Story ID: US22

- **Title:** View challenge overview header & navigation
- **As a** volunteer user, **I want to** view the challenge welcome message and navigation links, **so that** I can quickly access my challenges and rewards.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - The welcome message and current challenge cycle (e.g., ‘Day X monthly challenge’) are displayed at the top of the page.
  - Display the ‘Customise your challenges here’ entry, which redirects to the user’s own challenge management page when clicked.
  - Display access links: My Challenges-> redirects to the user's current challenge list; My Rewards-> redirects to the user's rewards page.
- **Dependencies:**
  - Challenge data and default theme challenges are stored in the database.
  - The user-posted challenge (post my challenges) page has been implemented.
  - The *My Challenges* and *My Rewards* pages have been implemented and are functional.
  - Challenge data (e.g., number of days, cycle type) is stored for front-end display.

#### User Story ID: US23

- **Title:** View theme challenge cards
- **As a** volunteer user, **I want to** view challenge cards with different themes, **so that** I can discover available challenges by topic.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 2 Story Points
- **Acceptance Criteria:**
  - The overview page displays default theme challenge cards (Theme Challenges), with default themes including Art, Tech, Nutrition, Meditation, and Fitness.
  - Each card includes a title, brief description, icon, or image.
  - Clicking on a card redirects the user to the Challenge Themes List page.
- **Dependencies:**
  - Challenge data and default theme challenges are stored in the database.
  - The overview page UI template is complete.

#### User Story ID: US24

- **Title:** Browse theme challenge list
- **As a** volunteer user, **I want to** browse lists of challenges in different themes, **so that** I can discover challenges by topic.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 2 Story Points
- **Acceptance Criteria:**
  - The theme list displays each challenge card in a slider format.
  - Each challenge card includes: title, description, duration, participants, rewards.
  - When no challenges exist under a theme, an empty state is displayed.
- **Dependencies:**
  - Theme metadata in database.
  - UI components support sliding theme display and challenge card list.

#### User Story ID: US25

- **Title:** Navigate theme list
- **As a** volunteer user, **I want to** view challenge cards with different themes, **so that** I can discover available theme challenges.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 1 Story Point
- **Acceptance Criteria:**
  - Each theme challenge has its own page.
  - A blue ‘+’ button is displayed in the bottom-right corner of the page. Clicking it redirects to the user-defined challenge posting page.
  - The top-right corner of the theme challenge includes a back button, which redirects to the Challenge Overview page when clicked.
- **Dependencies:**
  - Custom challenge publication page has been implemented.
  - Challenge overview has been implemented.
- **Notes:**
  - None at this stage.

#### User Story ID: US26

- **Title:** View ongoing and completed challenge lists
- **As a** volunteer user, **I want to** view my ongoing and completed challenges, **so that** I can track my progress.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 2 Story Points
- **Acceptance Criteria:**
  - The *My Challenges* page displays the challenges the user has joined, divided into Ongoing and Completed.
  - The number of current challenges is displayed next to the Ongoing and Completed categories.
  - A back button is located in the top-right corner of the page, which returns to the Challenge overview page.
- **Dependencies:**
  - User and challenge relationship data has been stored in the database.
  - The user authentication system has been implemented.

#### User Story ID: US27

- **Title:** Interact with challenge cards
- **As a** volunteer user, **I want to** interact with my challenge cards, **so that** I can check in and update my progress.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - Challenge cards are displayed in a scrollable list format.
  - Each challenge card includes:  
    - Challenge title (e.g., “Daily 10k steps”)  
    - Duration (e.g., 20 days, 30 days)  
    - Number of participants  
    - Progress bar (showing completion percentage)  
    - Reward information  
    - Check-in button  
  - The check-in button redirects to the check-in page.
- **Dependencies:**
  - Check-in data has been stored and is updated in conjunction with the progress bar.
  - The UI component supports ongoing/completed grouping, progress bars, and check-in buttons.
  - The check-in page has been implemented and can be linked to the current challenge list.

#### User Story ID: US28

- **Title:** View the completed challenge list
- **As a** volunteer user, **I want to** see a list of completed challenges, **so that** I can review my achievements.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - The *Completed Challenges* page shows all finished challenges as a list of challenge cards.
  - Each challenge card contains:  
    - A challenge title  
    - A challenge period (e.g., 30 days)  
    - The number of participants  
    - A progress bar (showing 100%)  
    - Brief reward information  
    - A view button  
  - Clicking the view button redirects to the challenge details page.
  - Completed challenges are sorted by completion date (most recently completed at the top).
  - There is a back button in the top-right corner of the page which redirects to the Challenge overview page.
- **Dependencies:**
  - Completed challenge data is stored in the database.
  - UI list page implemented.

#### User Story ID: US29

- **Title:** View challenge check-in page info
- **As a** volunteer user, **I want to** view my current challenge information, **so that** I can understand my status.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - The top of the page displays key information about the current challenge:  
    - Duration and number of participants (e.g., 20 days, 892 joined).  
    - My progress: progress bar and percentage, and remaining days (e.g., 10 days remaining).  
  - Highlighted reward section displayed.
  - Calendar visualisation shows check-in history.
  - If there are no previous check-ins, the calendar will be displayed in an empty style.
  - A back button in the top-right corner of the page redirects to *My Challenges* page.
- **Dependencies:**
  - Check-in data table and services (write/read/deduplicate daily check-ins).
  - Reward information data source (reward content and display copy associated with this challenge).
  - Calendar and progress bar UI components.
  - User authentication (only logged-in users can check in).

#### User Story ID: US30

- **Title:** Enter today’s check-in
- **As a** volunteer user, **I want to** check in with notes or a photo, **so that** I can log my daily progress.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - Below the calendar, the ‘Today’s Check-in’ section includes the following:  
    - **Notes (optional)**  
    - **Add photo (optional)** supports uploading one image (from the album/camera).  
    - ‘Check in’ button; when clicked the button text changes to ‘Checked in,’ the corresponding date on the calendar turns blue, and the progress bar updates with real-time feedback.  
  - The ‘Check In’ button cannot be clicked again on the same day.
- **Dependencies:**
  - Check-in data table and services (write and read).
  - Media upload capability (image storage: file service/object storage and access URL).
  - Calendar and progress bar UI components.
  - User authentication (only logged-in users can check in).

#### User Story ID: US31

- **Title:** Post new challenge (Enterprise only)
- **As a** enterprise, **I want to** post a new challenge, **so that** I can engage volunteers in my organization’s initiatives.
- **Priority:** Low
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - The system provides a "Create Challenge" form with the following fields:
    - Title (required, 30 characters or less)
    - Description (required, 360 characters or less)
    - Theme (select from pre-set themes, such as Fitness, Nutrition, Tech, etc.)
    - Capacity (required, maximum 500 participants)
    - Duration (required, days)
    - Reward (Name, Description, Type, Value)
  - Company users can use the "My Challenges" page to:
    - View published challenges (including status: Active / Expired).
- **Dependencies:**
  - The backend provides APIs for creating, editing, and deleting challenges.
  - The database stores challenge data and its status (active, expired, deleted).
  - An enterprise user authentication mechanism ensures that only authorized users can use this feature.
- **Notes:**
  - Enterprise users can only view and manage challenges they created and cannot edit or delete content created by other enterprises.
  - Future functionality is possible, such as allowing enterprises to upload cover images or attachments for challenges to enhance their appeal.

#### User Story ID: US32

- **Title:** Search Challenge
- **As a** volunteer, **I want to** search for a specific challenge, **so that** I can quickly locate a challenge of interest.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - The page contains a search input box.
  - When the user enters any character, a drop-down suggestion list appears below the input box, containing only challenges matching the name.
  - Suggestions are case-insensitive substring matching (for example, entering D matches "Daily 10k steps").
  - The system should update the matching results in real time (the list refreshes with each keystroke).
  - If there are no matching results, "No challenges found." is displayed.
  - When the input box is cleared, the suggestion list automatically hides.
- **Dependencies:**
  - Challenge data has been indexed and is available for database queries (or queryable datasets on the front end).
  - The search input and drop-down suggestion list UI components have been implemented.
  - A challenge details page exists for navigating to results.
- **Notes:**
  - Support fuzzy search (e.g., typing “Daily” should match “Daily Meditation”).
  - Ensure search performance is optimized for large challenge datasets.

#### User Story ID: US33

- **Title:** Observe Current Challenge Progress Bar
- **As a** volunteer, **I want to** observe my current challenge progress bar, **so that** I can clearly track how close I am to completing the challenge.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - Each challenge card displays the following information:
    - Challenge title (e.g., Daily 10k Steps).
    - Challenge duration (e.g., 20 days).
    - Current number of participants (e.g., 123 joined).
    - A progress bar showing the completion percentage, with a numeric value displayed above the bar (e.g., 20% or 5/20).
    - Reward information (e.g., protein powder discount).
    - A check-in button, allowing users to check in daily.
  - The progress bar automatically updates with each check-in, showing the latest percentage and number of days completed.
  - When the progress bar reaches 100%:
    - The challenge status automatically updates to "Completed."
    - The challenge moves from "Ongoing Challenges" to the "Completed Challenges" list.
  - The challenge moves from "Ongoing Challenges" to the "Completed Challenges" list.
- **Dependencies:**
  - The database stores the total number of challenge days, the number of participants, user check-in records, and reward information.
  - The front-end UI component supports displaying a progress bar, reward labels, and dynamic updates.
  - The back-end interface must support check-in record updates and return the latest progress status.
- **Notes:**
  - The check-in button should be prominent (e.g., highlighted) to encourage users to use it daily.

#### User Story ID: US34

- **Title:** Post New Challenge (Volunteer)
- **As a** volunteer, **I want to** post a new challenge, **so that** I can create and share activities with the community.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - The system provides a "Create Challenge" form with the following fields:
    - Title (required, 30 characters or less)
    - Description (required, 360 characters or less)
    - Theme (select from pre-set themes, such as Fitness, Nutrition, Tech, etc.)
    - Capacity (required, maximum 500 participants)
    - Duration (required, days)
    - Reward (Name, Description, Type, Value)
  - Form Validation Logic:
    - Required fields will display "Required" if left blank.
    - Time and Capacity fields must contain valid numbers.
  - After Submission:
    - The challenge is automatically published and displayed in the Challenge List, and visible to other volunteers.
    - Publishers can edit their own challenges on the "Challenges" page.
- **Dependencies:**
  - Backend challenge creation and storage APIs to ensure successful data submission.
  - User authentication services to ensure only logged-in users can post challenges.
- **Notes:**
  - Functionality can be expanded in the future: support for uploading cover images or attachments.

#### User Story ID: US35

- **Title:** View Reward Catalog
- **As a** volunteer, **I want to** view a categorized reward catalog, **so that** I can easily browse available incentives redeemable with my points.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - The "Rewards" page displays all available rewards in a grid/list view with:
    - Reward name (e.g., "Amazon Gift Card").
    - Points cost (e.g., "1,500 pts").
    - Category tag (e.g., "Gift Cards," "Certificates," "Discounts").
    - Visual indicator for low stock (<10 units).
  - Rewards are grouped by category with collapsible headers.
  - Default sorting shows rewards by popularity (most redeemed first).
  - Clicking a reward card navigates to its detailed view (US18).
- **Dependencies:**
  - Database stores reward metadata (name, points cost, category, stock level).
  - Front-end uses a reusable `RewardCard` component with category filtering.
- **Notes:**
  - Include "Sort by" options (popularity, points cost, newest) in the UI header.

#### User Story ID: US36

- **Title:** View Reward Details
- **As a** volunteer, **I want to** view detailed reward information, **so that** I can verify eligibility and redemption steps before spending points.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - The reward detail page shows:
    - Full description (e.g., "Redeem for $10 Amazon credit").
    - Eligibility requirements (e.g., "Min. 500 points," "Available to volunteers with >3 completed challenges").
    - Step-by-step redemption process (e.g., "1. Click 'Redeem' 2. Confirm 3. Receive code via email").
    - Real-time stock status (e.g., "98 left" or "Out of stock").
    - Points cost prominently displayed with a "Redeem" button (if eligible).
  - A "Back to Catalog" button returns users to the reward list (US17).
  - If the reward is out of stock, the "Redeem" button is disabled with a tooltip: "Currently unavailable."
- **Dependencies:**
  - Backend API provides reward metadata (description, eligibility rules, stock count).
  - Front-end uses a `RewardDetail` template with dynamic stock/status logic.
- **Notes:**
  - Display enterprise name (e.g., "Provided by Nike") for branded rewards.

#### User Story ID: US37

- **Title:** Redeem Reward
- **As a** volunteer, **I want to** redeem a reward, **so that** I can exchange my earned points for tangible incentives.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - The "Redeem" button is:
    - **Enabled** only if the user has sufficient points (e.g., user has 1,600 pts → button active for 1,500-pt rewards).
    - **Disabled** with tooltip "Not enough points" if points are insufficient.
  - On redemption:
    - A confirmation modal displays: "Redeem [Reward Name] for [X] pts? This cannot be undone."
    - Upon confirmation, points are deducted instantly, and a success toast appears: "Redemption successful! Code sent to email."
    - The reward moves to the user’s "My Rewards" list (status: "Pending").
  - Real-time updates:
    - Points balance updates across all pages (e.g., header, profile).
    - Stock count decrements for the redeemed reward (if applicable).
- **Dependencies:**
  - Points tracking system (e.g., `user.points` field in DB).
  - Backend redemption endpoint (`POST /rewards/{id}/redeem`) with atomic point deduction.
  - Email service for delivery codes.
- **Notes:**
  - Prevent duplicate redemptions within 5 seconds to avoid accidental double-spending.

#### User Story ID: US38

- **Title:** Configure Enterprise Rewards
- **As an** enterprise, **I want to** create and manage rewards, **so that** I can incentivize volunteers through challenge participation.
- **Priority:** Low
- **Status:** Draft
- **Estimation:** 8 Story Points
- **Acceptance Criteria:**
  - The "Add Reward" form includes:
    - Title (required, ≤30 chars), Description (required, ≤360 chars).
    - Points cost (required, numeric, ≥100).
    - Quantity (required, numeric, ≤10,000; "Unlimited" toggle available).
    - Visibility options: "Available globally" or "Linked to specific challenges."
  - Form validation:
    - Red error text for empty required fields (e.g., "Points cost is required").
    - Numeric fields reject non-digit inputs.
  - Post-submission:
    - Reward appears in the enterprise’s "My Rewards" dashboard.
    - If linked to challenges, it displays in those challenge cards (US23).
    - Enterprises can edit/delete rewards (deleting updates challenge displays instantly).
- **Dependencies:**
  - Enterprise-only backend endpoint (`POST /enterprise/rewards`).
  - Role-based access control (RBAC) to restrict to enterprise accounts.
  - Real-time sync between reward DB and challenge service.
- **Notes:**
  - Future scope: Support image uploads for reward branding.

#### User Story ID: US39

- **Title:** Search Reward
- **As a** volunteer, **I want to** search for a specific reward, **so that** I can quickly find the reward I want to redeem.
- **Priority:** Medium
- **Status:** Draft
- **Estimation:** 3 Story Points
- **Acceptance Criteria:**
  - A search bar at the top of the reward catalog (US17) supports:
    - Real-time results as users type (debounced by 300ms).
    - Fuzzy matching (e.g., "gft crd" matches "Gift Card").
    - Case-insensitive filtering.
  - Results display:
    - Matching rewards in the same grid/list format as US17.
    - "No rewards found" message with a "Clear search" button if zero results.
  - Default view (before search): Shows top 5 popular rewards + "Trending" section.
  - Search clears when navigating to reward details (US18) and returns to default view on back navigation.
- **Dependencies:**
  - Database indexed for full-text search (e.g., PostgreSQL `pg_trgm`).
  - Front-end `SearchBar` component with debounce logic.
- **Notes:**
  - Optimize for sub-500ms response time; show loading spinner if >1s.

#### User Story ID: US40

- **Title:** Set Rewards for Challenges (Volunteer)
- **As a** volunteer, **I want to** set rewards for challenges, **so that** I can incentivize participants with points or small prizes.
- **Priority:** High
- **Status:** Draft
- **Estimation:** 5 Story Points
- **Acceptance Criteria:**
  - While creating/editing a challenge (US24), volunteers see an "Add Reward" section with:
    - Pre-filled points cost field (default: challenge duration × 100 pts).
    - Toggle for "Use my points" (deducts from volunteer’s balance upon challenge completion).
    - Quantity field (default: 1; max: 100).
  - Rewards display on the challenge card (US23) as:
    - "Reward: [Name] ([X] pts)" with a tooltip showing description.
    - Stock indicator (e.g., "1/50 claimed") if quantity-limited.
  - Volunteers can:
    - Edit/delete rewards **only** for challenges they created.
    - See redemption stats (e.g., "12/50 claimed") in their challenge dashboard.
  - If a volunteer lacks points for "Use my points" rewards, the challenge creation is blocked with: "Insufficient points to fund rewards."
- **Dependencies:**
  - Volunteer-specific reward endpoint (`POST /challenges/{id}/rewards`).
  - Points system validation during challenge creation.
  - Real-time sync between challenge service and points ledger.
- **Notes:**
  - Rewards attached this way are **not** visible in the global reward catalog (US17)—only on the challenge card.

## Product Backlog Considerations

- **Epics:**
  - Challenge Management (US11–US16, US22–US24)
  - Reward System (US17–US21, US25)
- **Sprint Placement Suggestions:**
  - Sprint 1: US11, US13, US15, US17, US18, US19, US23 (High-priority core features)
  - Sprint 2: US12, US14, US21, US22 (Discovery & search)
  - Sprint 3: US24, US25 (Community contribution)
  - Future: US16, US20 (Enterprise features)
- **Business Value:**
  - Empowers volunteers to engage, track progress, and earn rewards.
  - Encourages community-driven content creation.
  - Supports enterprise engagement through branded challenges and rewards.
  - Increases retention through gamification and recognition.