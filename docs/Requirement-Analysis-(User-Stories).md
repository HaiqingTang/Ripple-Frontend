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

### US-AUTH-001: Registration
_As a new user, I want to register with my name, email, and password so that I can create a secure account._  
- **Priority:** Must Have  
- **Estimate:** S  
- **Dependency:** None (foundation for all other features)  

**Acceptance Criteria**
- Given I enter a valid email and password → When I submit → Then my account is created.  
- Given I enter an invalid email or weak password → Then I see an error message.  
- Given my email is already registered → Then I see a duplicate account warning.  

### US-AUTH-002: Secure Login
_As a registered user, I want to log in securely so that I can access my personal data._  
- **Priority:** Must Have  
- **Estimate:** S  
- **Dependency:** Depends on US-AUTH-001 (Registration)  

**Acceptance Criteria**
- Given I enter valid credentials → Then I am logged in and redirected to the home screen.  
- Given I enter invalid credentials → Then I see an error message.  

### US-AUTH-003: Email Verification During Sign-up
_As a new user, I want to verify my email address during sign-up so that my account is secure and validated._  
- **Priority:** Must Have  
- **Estimate:** Medium  
- **Dependency:** Depends on US-AUTH-001 (Registration)  

**Acceptance Criteria**
- Given I complete registration → When I submit → Then I receive a verification email.  
- Given I click the verification link → Then my email is confirmed and I can log in.
- Given I haven't verified my email → When I try to log in → Then I see a prompt to verify my email.

### US-AUTH-004: Organization Field for Business Users
_As a business user, I want to specify my organization during registration so that my account is properly categorized._  
- **Priority:** Must Have  
- **Estimate:** S(Simple form field addition with Firestore document field update)  
- **Dependency:** Depends on US-AUTH-001 (Registration)  

**Acceptance Criteria**
- Given I am registering → When I fill out the form → Then I can enter my organization name optionally.  
- Given I submit registration → Then my organization is saved to my profile.



---

## 4.2 Backbone 2: Profile Management System

### US-PROFILE-001: View Profile
_As a community service worker, I want to view my profile information so that I can see my current account details._  
- **Priority:** Must Have  
- **Estimate:** S  
- **Dependency:** Depends on US-AUTH-002 (Secure Login)  

**Acceptance Criteria**
- Given I am logged in → When I navigate to my profile → Then I can see my current name, email, and join date.  
- Given I view my profile → Then I can see a summary of my recent activity (posts created, days logged, challenges completed).  

### US-PROFILE-002: Edit Profile
_As a community service worker, I want to edit my profile so that I can personalize my account and keep my details up to date._  
- **Priority:** Should Have  
- **Estimate:** M  
- **Dependency:** Depends on US-PROFILE-001 (View Profile)  

**Acceptance Criteria**
- Given I am logged in → When I access profile editing → Then I can update my display name and basic bio.  
- Given I make changes → When I save → Then my changes are reflected immediately on my profile page.  
- Given I want to change my password → When I access account settings → Then I can update my password with proper validation.  

---

## 4.3 Backbone 3: Daily Mood & Sleep Logging

### US-MOOD-001: Rate Daily Mood and Emotion
_As a community service worker, I want to rate my daily mood on a 1–10 scale and choose  emotion so that I can track emotional patterns over time._  
- **Priority:** Must Have  
- **Estimate:** M  
- **Dependency:** Depends on US-AUTH-002 (Secure Login)  

**Acceptance Criteria**
- Given I access mood logging → When I select a number 1–10 → Then my mood rating is saved for today.  
- Given I access emotion logging → when I select one emoji out of five(sad, angry, neutral, happy, very happy ) → click submit my emotion rating is saved for today.

### US-MOOD-002: Sleep Tracking
_As a community service worker, I want to log sleep quality and duration so that I can see patterns._  
- **Priority:** Must Have  
- **Estimate:** M  
- **Dependency:** Depends on US-AUTH-002 (Secure Login)  

**Acceptance Criteria**
- Given I enter sleep hours and quality → Then my data is stored.  
- Given I view history → Then I see my sleep data by day.  

### US-MOOD-003: Personal Journaling
_As a community service worker, I want to record personal journal entries so that I can reflect._  
- **Priority:** Must Have  
- **Estimate:** M  
- **Dependency:** Depends on US-AUTH-002 (Secure Login)  

**Acceptance Criteria**
- Given I open journaling → Then I can add text and tag the journal.  
- Given I save → Then the entry is stored in my private log.  

### US-MOOD-004: View Historical Entries
_As a community service worker, I want to view my historical entries so that I can reflect on past moods, sleep, and journals._  
- **Priority:** Must Have  
- **Estimate:** L  
- **Dependency:** Depends on US-MOOD-001, US-MOOD-002, US-MOOD-003  

**Acceptance Criteria**
- Given I navigate to the history page → Then all entries are displayed in reverse chronological order.  
- Filter records based on time range(this month, this week) and tags  

### US-MOOD-005: Angry Emotion Option Selection
_As a community service worker, I want to select an angry emotion option so that I can accurately represent my current emotional state._  
- **Priority:** Must Have  
- **Estimate:** S 
- **Dependency:** Depends on US-MOOD-001 (Rate Daily Mood and Emotion)  

**Acceptance Criteria**
- Given I access emotion logging → When I view available emotions → Then I can see an angry emotion option.  
- Given I select the angry emotion → When I submit → Then my angry emotion is saved for today  

### US-MOOD-006: Separate Feelings and Emotions Sections
_As a community service worker, I want feelings and emotions to be in separate sections so that I can better categorize my mental state._  
- **Priority:** Must Have  
- **Estimate:** S 
- **Dependency:** Depends on US-MOOD-001 (Rate Daily Mood and Emotion)  

**Acceptance Criteria**
- Given I access mood logging → When I view the interface → Then I see distinct sections for feelings and emotions.  
- Given I complete both sections → When I submit → Then both are saved separately to my daily log 

### US-MOOD-007: Multiple Personal Log Entries Per Day
_As a community service worker, I want to create multiple personal log entries per day so that I can capture different moments and experiences._  
- **Priority:** Must Have  
- **Estimate:** S 
- **Dependency:** Depends on US-MOOD-001 (Rate Daily Mood and Emotion) US-MOOD-003 (Personal Journaling)  

**Acceptance Criteria**
- Given I have already created a journal entry today → When I create another entry → Then both entries are saved with different timestamps.  
- Given I view my daily history → When I look at a specific date → Then I see all entries for that day with their respective times.

### US-UI-001: Journal Icon for Personal Log Page
_As a community service worker, I want to see a journal icon on the personal log page so that I can easily identify what this page is for._  
- **Priority:** Must Have  
- **Estimate:** XS  
- **Dependency:** None  

**Acceptance Criteria**
- Given I navigate to the personal log page → When I view the interface → Then I see a clear journal icon.  
- Given I see the journal icon → Then it visually represents the journaling functionality clearly.  

### US-JOURNAL-001: Image Upload for Journal Entries
_As a community service worker, I want to upload images to my journal entries so that I can capture visual memories and moments._  
- **Priority:** Must Have  
- **Estimate:** XL  
- **Dependency:** Depends on US-MOOD-003 (Personal Journaling)  

**Acceptance Criteria**
- Given I am creating a journal entry → When I tap the image button → Then I can select photos from my device or take a new photo.  
- Given I select an image → When I save my journal entry → Then the image is uploaded and stored with my entry.  
- Given I view my journal entries → When I see entries with images → Then the images display properly within the entry.  

### US-JOURNAL-002: Journal Topic Selection System
_As a community service worker, I want to select from predefined journal topics so that I have guidance for my reflections._  
- **Priority:** Could Have  
- **Estimate:** S  
- **Dependency:** Depends on US-MOOD-003 (Personal Journaling)  

**Acceptance Criteria**
- Given I am creating a journal entry → When I access topic selection → Then I see a list of relevant topics to choose from.  
- Given I select a topic → When I create my entry → Then the topic is associated with my journal entry.  
- Given I view my journal history → When I filter by topic → Then I see only entries related to that topic.

---

## 4.4 Backbone 4: Community Discussion Board

### US-COMM-001: Browse Discussions
_As a community service worker, I want to browse discussion topics so that I can find relevant conversations._  
- **Priority:** Must Have  
- **Estimate:** M  
- **Dependency:** Depends on US-AUTH-002 (Secure Login)  

**Acceptance Criteria**
- Given I navigate to the discussion page → Then I see a list of topics in reverse chronological order of posted date.  

### US-COMM-002: Post Creation
_As a community service worker, I want to create posts sharing positive moments, tips, and resources so that I can contribute to peer support._  
- **Priority:** Must Have  
- **Estimate:** L  
- **Dependency:** Depends on US-AUTH-002 (Secure Login)  

**Acceptance Criteria**
- Given I am logged in → Then I can create a post.  
- Given I submit a valid post → Then my post appears immediately on the discussion board.  
- Given I click submit → Then the system prompts a message: "Do you want to post this publicly?"  

### US-COMM-003: Post Interaction
_As a community service worker, I want to like posts so that I can show support._  
- **Priority:** Should Have  
- **Estimate:** L  
- **Dependency:** Depends on US-COMM-002 (Post Creation)  

**Acceptance Criteria**
- Given I am viewing the community feed → When I see a post I appreciate → Then I can like it.  
- Given I want to respond to a post → When I click comment → Then I can add a supportive or helpful comment.
- Give I post a comment → Then my comment appears immediately in the thread.