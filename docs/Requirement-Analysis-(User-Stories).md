# 1. Backbone Features
## 1.1 Core Backbone Components
Our team is responsible for building the following four main backbone features:
| Backbone Feature              | Description                                                         | Priority |
|-------------------------------|---------------------------------------------------------------------|----------|
| User Authentication          | Complete user registration and secure login    | High     |
| Profile Management System    |  Profile management for user to view and edit profile details       | High
| Daily Mood & Sleep Logging    | Personal wellbeing tracking with mood rating and sleep quality monitoring | High     |
| Community Discussion System   | Peer-to-peer support through discussion boards and content sharing   | Medium   |

# 2. Functional Requirements
## 2.1 User Authentication System
* Secure user registration with email/password
* Secure login and session management
* Basic password validation and error handling

## 2.2 Profile Management System
* Profile viewing capabilities
* Profile editing and account details management
* Basic user preferences

## 2.2 Daily Mood & Sleep Logging
* Daily mood rating system (1-10 scale)
* Sleep quality tracking and duration logging
* Daily check-in completion tracking
* Historical data viewing and filter functionality

## 2.3 Community Discussion System
* Browse and search discussion topics and threads
* Post interaction capabilities
* Content creation and publishing capabilities

# 3. Non-Functional Requirements
## 3.1 Performance Requirements
* App response time under 2 seconds for standard actions
* Support for at least 10-20 concurrent users in community features for testing
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
## 4.1 Backbone 1: User Authentication System
### US-AUTH-001:Registration
As a new user, I want to register with my name, email and password so that I can create a secure account.<br>
Priority: High<br>
Dependency: None (foundation for all other features)<br>
Acceptance Criteria:
* Given I enter a valid email and password → When I submit → Then my account is created.
* Given I enter an invalid email or weak password → Then I see an error message.
* Given my email is already registered → Then I see a duplicate account warning.

### US-AUTH-002:Secure Login
As a registered user, I want to log in securely so that I can access my personal data.<br>
Priority: High<br>
Dependency: Depends on US-AUTH-001 (Registration)<br>
Acceptance Criteria:
* Given I enter valid credentials → Then I am logged in and redirected to the home screen.
* Given I enter invalid credentials → Then I see an error message.

## 4.2 Backbone 2: Profile Management System
### US-PROFILE-001: View Profile
As a community service worker, I want to view my profile information so that I can see my current account details.<<br> 
Priority: High<br>
Dependency: Depends on US-AUTH-002 (Secure Login)<br>
Acceptance Criteria:
* Given I am logged in → When I navigate to my profile → Then I can see my current name, email, and join date.
* Given I view my profile → Then I can see a summary of my recent activity (posts created, days logged, challenges completed).

### US-PROFILE-002: Edit Profile 
As a community service worker, I want to edit my profile so that I can personalize my account and keep my details up to date.<br>
Priority: High<br>
Dependency: Depends on Depends on US-PROFILE-001 (View Profile)<br>
Acceptance Criteria:
* Given I am logged in → When I access profile editing → Then I can update my display name and basic bio.
* Given I make changes → When I save → Then my changes are reflected immediately on my profile page.
* Given I want to change my password → When I access account settings → Then I can update my password with proper validation.

## 4.3 Backbone 3: Daily Mood & Sleep Logging
### US-MOOD-001: Rate Daily Mood (1-10 scale)
As a community service worker, I want to rate my daily mood on a 1-10 scale So that I can track emotional patterns over time.<br>
Priority: High<br>
Dependency: Depends on US-AUTH-002 (Secure Login)<br>
Acceptance Criteria:
* Given I access mood logging → When I select a number 1-10 → Then my mood rating is saved for today.
* Given that I've already completed rating for today -> When I navigate to the page -> Then I will see a visual feedback showing that I have completed my ratings for today.

### US-MOOD-002: Sleep Tracking
As a community service worker, I want to log sleep quality and duration so that I can see patterns.<br>
Priority: High<br>
Dependency: Depends on US-AUTH-002 (Secure Login)<br>
Acceptance Criteria:
* Given I enter sleep hours and quality → Then my data is stored.
* Given I view history → Then I see my sleep data by day.

### US-MOOD-003: Personal Journaling
As a community service worker, I want to record personal journal entries so that I can reflect.<br>
Priority: High<br>
Dependency: Depends on US-AUTH-002 (Secure Login)<br>
Acceptance Criteria:
* Given I open journaling → Then I can add text or record voice.
* Given I save → Then the entry is stored in my private log.

### US-MOOD-004: View Historical Entries
As a community service worker, I want to view historical entries with filters so that I can identify patterns.<br>
Priority: High<br>
Dependency: Depends on US-MOOD-001 (Rate Daily Mood), US-MOOD-002 (Sleep Tracking), and US-MOOD-003 (Journaling)<br>
Acceptance Criteria:
* Given I navigate to the history view page → Then all entries are displayed in a simple list format in reverse chronological order of submission
* Given I select the date filters → Then only entries that are submitted within the date range selected.

## 4.4 Backbone 4: Community Discussion Board
### US-COMM-001: Browse & Search Discussions
As a community service worker, I want to browse and search topics so that I can find relevant discussions.<br>
Priority: High<br>
Dependency: Depends on US-AUTH-002 (Secure Login)<br>
Acceptance Criteria:
* Given I navigate to the discussion page → Then I see a list of topics in reverse chronological order of posted date.
* Given I enter a keyword → Then I see matching discussions.

### US-COMM-002: Post Creation
As a community service worker, I want to create posts sharing positive moments, tips, and resources in the community feed
So that I can contribute to peer support and help reduce isolation among colleagues.<br>
Priority: High<br>
Dependency: Depends on US-AUTH-002 (Secure Login)<br>
Acceptance Criteria:
* Given I am logged in → Then I can create a post or reply.
* Given I submit a valid post → Then my post appears in the discussion board immediately.
* Given I click on submit on a post -> The system prompts a message: "Do you want to post this publicly?" to allow the user to confirm before posting publicly.

### US-COMM-003: Post Interaction
As a community service worker, I want to engage with posts through likes, comments, So that I can build connections with peers and access relevant content for my wellbeing<br>
Priority: High<br>
Dependency: Depends on US-COMM-002 (Post Creation) and US-AUTH-002 (Secure Login)<br>
Acceptance Criteria:
* Given I am viewing the community feed → When I see a post I appreciate → Then I can like it to show support.
* Given I want to respond to a post → When I click comment → Then I can add a supportive or helpful comment.
* Give I post a comment → Then my comment appears immediately in the thread.

