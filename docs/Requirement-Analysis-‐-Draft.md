# 1. Backbone Features
## 1.1 Core Backbone Components
Our team is responsible for building the following four main backbone features:
| Backbone Feature              | Description                                                         | Priority |
|-------------------------------|---------------------------------------------------------------------|----------|
| User Authentication          | Complete user registration and secure login    | High     |
| Profile Management System    |  Profile management for user to view and edit profile details       | High
| Daily Mood & Sleep Logging    | Personal wellbeing tracking with mood rating and sleep quality monitoring | High     |
| Community Discussion System   | Peer-to-peer support through discussion boards and content sharing   | Medium   |
| Personal Analytics & Insights [TO REMOVE] | Progress tracking, trend analysis, and wellbeing insights            | Medium   |

# 2. Functional Requirements
## 2.1 User Authentication & Onboarding
* Secure user registration and login system
* Profile creation and management capabilities
* Social interaction controls and personalisation [TO REMOVE - too complex]
## 2.2 Daily Mood & Sleep Logging
* Daily mood rating system (1-10 scale)
* Sleep quality tracking and duration logging
* Personal journaling with voice recording capabilities [TO REMOVE - voice recording too complex]
* Daily check-in completion tracking
* Historical data viewing and filter functionality
## 2.3 Community Discussion System
* Browse and search discussion topics and threads
* Join/leave discussions with community interaction [TO REMOVE - complex state management]
* Content creation and publishing capabilities
* Discussion moderation and community guidelines [TO REMOVE - complex moderation system]
* Advanced analytics for community engagement [TO REMOVE]
## 2.4 Personal Analytics & Insights [TO REMOVE - too complex]
* Weekly and detailed progress summaries
* Mood trend visualisation and analytics dashboard
* navigation across personal data
# 3. Non-Functional Requirements
## 3.1 Performance Requirements
* App response time under 2 seconds for standard actions
* Support for at least 100 concurrent users in community features
## 3.2 Security Requirements
* Secure user authentication (email/password, optional 2FA in later versions)
* Basic data protection and privacy compliance (GDPR-aligned practices where feasible)
## 3.3 Usability Requirements
* Simple, intuitive interface requiring no training
* Mobile-first design optimized for iOS (priority)
* Extendable to Android if time allows
* Basic accessibility support
## 3.4 Scalability Requirements
* Architecture designed to allow future scaling, but MVP supports core features only
* Modular design so advanced features (analytics, enterprise options) can be added later
# 4. Detailed User Stories by Backbone Feature
## 4.1 Backbone 1: User Authentication & Profile System
### US-AUTH-001:Registration
As a new user, I want to register with my name, email and password so that I can create a secure account.<br>
Priority: High<br>
Acceptance Criteria:
* Given I enter a valid email and password → When I submit → Then my account is created.
* Given I enter an invalid email or weak password → Then I see an error message.
* Given my email is already registered → Then I see a duplicate account warning.

### US-AUTH-002:Secure Login
As a registered user, I want to log in securely so that I can access my personal data.<br>
Priority: High<br>
Acceptance Criteria:
* Given I enter valid credentials → Then I am logged in and redirected to the home screen.
* Given I enter invalid credentials → Then I see an error message.

### US-AUTH-003:Profile Management & Account Settings
As a community service worker, I want to view and edit my profile so that I can personalize my account.<br>
Priority: High<br>
Acceptance Criteria:
* Given I am logged in → Then I can update my name, avatar, and preferences.
* Given I save changes → Then they are reflected in my profile page immediately.

### US-AUTH-004: Personal Activity Dashboard [TO REMOVE - too complex for MVP]
As a community service worker, I want to view my personal activity and engagement history, So that I can track my community participation and easily find content I've interacted with[TO REMOVE: Tabs, metrics, followers tracking, engagement stats - all too complex for 8 weeks] <br> 
Priority: High<br>
Acceptance Criteria:
* Given I am on my profile page → When I view my dashboard → Then I can see tabs for different data categories (My Posts, Liked Posts, Challenges Joined etc.)
* Given I want to review my contributions → When I select "My Posts" → Then I can see all posts I've shared in the community feed and discussion boards
* Given I want to revisit content I appreciated → When I select "Liked Posts" → Then I can browse through all posts I've liked, organized by date or category
* Given I want to see my engagement level → When I view my profile stats → Then I can see metrics like number of posts shared, number of followers/following, community connections made, and challenges completed at a glance.


## 4.2 Backbone 2: Daily Mood & Sleep Logging
### US-MOOD-001: Rate Daily Mood (1-10 scale)
As a community service worker, I want to rate my daily mood on a 1-10 scale So that I can track emotional patterns over time.<br>
Priority: High<br>
Acceptance Criteria:
* Given I access mood logging → When I select a number 1-10 → Then my mood rating is saved for today.
* Given I already rated today → When I access mood logging → Then I can see and edit today's rating.
* Given that I've already completed rating for today -> When I navigate to the page -> Then I will see a visual feedback showing that I have completed my ratings for today.

### US-MOOD-002: Sleep Tracking
As a community service worker, I want to log sleep quality and duration so that I can see patterns.<br>
Priority: High<br>
Acceptance Criteria:
* Given I enter sleep hours and quality → Then my data is stored.
* Given I view history → Then I see my sleep data by day.

### US-MOOD-003: Personal Journaling
As a community service worker, I want to record personal journal entries so that I can reflect.<br>
Priority: High<br>
Acceptance Criteria:
* Given I open journaling → Then I can add text or record voice.
* Given I save → Then the entry is stored in my private log.

### US-MOOD-004: Wellbeing Check-In [TO REMOVE: Push notifications require mobile infrastructure - way too complex]
As a community service worker, I want to receive a quick daily survey notification so that I can easily track my emotional and energy levels without disrupting my busy schedule.<br>
Priority: High<br>
Acceptance Criteria:
* Given it's my preferred check-in time → Then I receive a push notification prompting me to complete a quick wellbeing survey.
* Given I tap the notification → Then I can quickly rate my mood and energy levels in under 30 seconds.
* Given I complete the survey → Then my responses are automatically saved and I can see a brief summary of my wellbeing trend.

# US-MOOD-005: View Historical Entries
As a community service worker, I want to view historical entries with filters so that I can identify patterns. [TO REMOVE: Complex filtering, date ranges - too advanced for MVP]<br>
Priority: High<br>
Acceptance Criteria:
* Given I navigate to the history view page → Then all entries are displayed in a simple list format in reverse chronological order of submission
* Given I select the date filters → Then only entries that are submitted within the date range selected.

## 4.3 Backbone 3: Community Discussion Board
### US-COMM-001: Browse & Search Discussions
As a community service worker, I want to browse and search topics so that I can find relevant discussions.<br>
Priority: High<br>
Acceptance Criteria:
* Given I navigate to the discussion page → Then I see a list of topics in reverse chronological order of posted date.
* Given I enter a keyword → Then I see matching discussions.

### US-COMM-002: Post Creation
As a community service worker, I want to create posts sharing positive moments, tips, and resources in the community feed
So that I can contribute to peer support and help reduce isolation among colleagues.<br>
Priority: High<br>
Acceptance Criteria:
* Given I am logged in → Then I can create a post or reply.
* Given I submit a valid post → Then my post appears in the discussion board immediately.
* Given I click on submit on a post -> The system prompts a message: "Do you want to post this publicly?" to allow the user to confirm before posting publicly.

### US-COMM-003: Post Interaction
As a community service worker, I want to engage with posts through likes, comments, So that I can build connections with peers and access relevant content for my wellbeing<br>
Priority: High<br>
Acceptance Criteria:
* Given I am viewing the community feed → When I see a post I appreciate → Then I can like it to show support.
* Given I want to respond to a post → When I click comment → Then I can add a supportive or helpful comment. [TO REMOVE - too complex for MVP, just likes]
* Give I post a comment → Then my comment appears immediately in the thread.

### US-COMM-004: Current Discussion List(not in figma) [TO REMOVE - entire story too complex for MVP]
As a community service worker, I want to view my active discussions and recent activity in one place, So that I can easily continue conversations and stay connected with my peer support network<br>
Priority: Medium<br>
Acceptance Criteria:
* Given I am logged in → When I access "My Discussions" → Then I can see a list of discussion threads I've participated in
* Given I have unread replies → When I view my discussions → Then I can see unread message indicators (e.g., red dot or number badge)
* Given discussions have recent activity → When I view the list → Then I can see last activity timestamps to know what's current* Quick access to recent conversations

### US-COMM-005: Community Moderation(not in figma) [TO REMOVE - entire story too complex for MVP]
As a community service worker, I want to report inappropriate content when I see it, So that the community remains a safe and supportive space for peer support.<br>
Priority: Low<br>
Acceptance Criteria:
* Given I see inappropriate content → When I click "Report" → Then I can select a reason (spam, inappropriate, harassment, etc.)* Moderation queue for flagged content
* Given I report something → When I submit → Then I receive confirmation that the report was received
* Given I submit a report → When it's processed → Then the content is flagged for admin review (manual process initially)
* User warning and suspension capabilities
* Community guidelines enforcement

## 4.4 Backbone 4: Personal Analytics & Insights[TO REMOVE - entire section too complex for MVP]
### US-ANALYTICS-001: Weekly Progress Summary(not in figma) [TO REMOVE: Automated reports, trend summaries - requires complex analytics system]
As a community service worker, I want to receive weekly summaries of my wellbeing progress so that I can understand my patterns and celebrate achievements.<br>
Priority: Medium<br>
Acceptance Criteria:
* Automated weekly progress reports
* Mood trend summaries
* Personalized insights and recommendations
### US-ANALYTICS-002: Mood Trend Visualization(not in figma)
As a community service worker, I want to see visual representations of my mood trends so that I can identify patterns and triggers.<br>
Priority: Medium<br>
Acceptance Criteria:
* Line charts showing mood over time
* Zoom functionality for different time periods
* Annotation capabilities for date-specific logs (so users can view logs for a selected date)

### US-ANALYTICS-003: Data Export & Sharing(not in figma) [TO REMOVE: Multiple export formats, GDPR compliance - way too complex for student project]
As a community service worker, I want to export my wellbeing data for external analysis so that I can share insights with supervisors or healthcare providers.<br>
Priority: Low<br>
Acceptance Criteria:
* Multiple export formats (CSV, PDF, JSON)
* Selective data export options
* Compliance with data protection regulations


