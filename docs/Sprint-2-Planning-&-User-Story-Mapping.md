# Executive Summary
This document outlines the user story mapping and Sprint 2 planning for the RIPPLE app. Sprint 2 focuses on core authentication, profile management and mood logging features to establish the foundation for user engagement.

# 1. User Story Mapping
## 1.1. User Story Map  
<img width="960" height="540" alt="Image_2025-08-29_145503_312" src="https://github.com/user-attachments/assets/893e56d0-95ad-4cc4-81ca-7bc1da09ae3e" />

---

# 2. Sprint 2 Planning
## Sprint Details

Sprint Number: Sprint 2<br>
Start Date: 01/09/2025<br>
End Date: 26/09/2025<br>
Sprint Goal: Establish a secure foundation for user engagement by implementing authentication, profile management, and mood logging features, enabling users to create accounts, manage profiles, and track daily wellbeing.<br>

## Team Capacity Analysis
Team Size: 5 part-time members<br>
Individual Capacity: 10-15 hours/week per member<br>
Total Team Capacity: 50-75 hours/week<br>

## Weekly Capacity Planning

| Week | Focus Area | Planned Hours | Available Capacity | Utilization |
|------|------------|---------------|-------------------|-------------|
| Week 1 | Authentication Foundation | 38 | 50-75 | 51-76% |
| Week 2 | Profile Management | 38 | 50-75 | 51-76% |
| Week 3 | Mood Logging (Basic) | 33 | 50-75 | 44-66% |
| Week 4 | Journaling Feature | 24 | 50-75 | 32-48% |
| **Total** | **Sprint 2 Complete** | **133** | **200-300** | **44-67%** |

**Notes:** First development sprint - team members need to learn and familiarize with tech stacks, extra buffer allocated for setup and learning curve. Conservative utilization accounting for technical risk mitigation.

## 2.1. User Story Dependencies & Critical Path Analysis
<img width="544" height="221" alt="Screenshot 2025-08-29 at 3 12 28 pm" src="https://github.com/user-attachments/assets/5695def9-4029-4a43-89b6-b655f80e857c" />



## 2.2. Sprint Workflow and Execution Plan

<img width="900" height="500" alt="Sprint 2 Workflow   Execution Plan (5)" src="https://github.com/user-attachments/assets/839fb3fe-2e19-438b-aaed-9641b11b87a0" />


## 2.3. Sprint Backlog
| User Story ID | User Story (Title)            | Backbone Feature                 | Absolute Priority | Sprint Allocation | Dependencies |Story Points | Status | Justification |
|----------------|-------------------------------|----------------------------------|-----------------|------------|--------------|--------------|----|---------------|
| US-AUTH-001      | User Registration               | User Authentication           | 1     | Sprint 2      | None  | 3            | DONE | Foundation for all user features; includes database schema, validation, email verification setup |
| US-AUTH-002      | Secure Login                    | User Authentication           | 2     | Sprint 2      | US-AUTH-001 (needs user accounts) | 3            | DONE | Requires security middleware and validate with backend user pool - builds on registration infrastructure |
| US-PROFILE-001      | View Profile              | Profile Management System        | 3     | Sprint 2      | US-AUTH-002 (needs authenticated users)  | 5            | DONE | Basic CRUD read operation with auth integration; includes responsive UI and data display components |
| US-PROFILE-002      | Edit Profile              | Profile Management System        | 4     | Sprint 2      | US-PROFILE-001 (needs view structure)  | 5            | DONE | Complex validation logic, file uploads, password changes, security checks - extends view functionality |
| US-MOOD-001      | Rate Daily Mood and Emotion         | Daily Mood & Sleep Logging    | 5      | Sprint 2     |  US-AUTH-002 (needs user identity)  | 3            | DONE | Simple form with slider/scale interface, basic validation, time-series data storage |
| US-MOOD-002      | Sleep Tracking                  | Daily Mood & Sleep Logging    | 6      | Sprint 2     | US-AUTH-002 (needs user identity)  | 3            | DONE | Duration/quality tracking forms, similar complexity to mood rating, separate data model |
| US-MOOD-003      | Personal Journaling             | Daily Mood & Sleep Logging    | 7      | Sprint 2     |  US-AUTH-002 (needs user identity) | 5            | DONE | Rich text editor implementation, larger data storage requirements, entry history management |
| US-MOOD-004      | Historical Data & Filters       | Daily Mood & Sleep Logging    | 8      | Sprint 3     | US-MOOD-001, US-MOOD-002, US-MOOD-003 (needs existing data to display)  | 8            | TODO | Complex data aggregation, filtering logic, pagination |
| US-COMM-001      | Browse & Search Discussions     | Community Discussion Board    | 9      | Sprint 3     | US-AUTH-002 (needs user context)  | 6            | TODO | Search functionality, pagination, forum structure|
| US-COMM-002      | Post Creation         | Community Discussion Board    | 10      | Sprint 3       | US-AUTH-002 (needs authenticated users)  | 5          | TODO | Form handling, content validation, user permissions, basic text formatting |
| US-COMM-003      | Post Interaction         | Community Discussion Board    | 11      | Sprint 3    |  US-AUTH-002 (user identity), US-COMM-002 (needs posts to interact with)  | 5           | TODO | Comments system, reactions/voting, notification logic|

## 2.4. Task Breakdown

### Week 1: Authentication Foundation (US-AUTH-001 & US-AUTH-002)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-AUTH-001 | Set up database schema for user accounts | US-AUTH-001 | 6 | DONE | None | Must Have
T-AUTH-002 | Implement user registration API endpoint | US-AUTH-001 | 8 | DONE | T-AUTH-001 | Must Have
T-AUTH-003 | Build registration form frontend | US-AUTH-001 | 6 | DONE | T-AUTH-002 | Must Have
T-AUTH-004 | Implement email validation logic | US-AUTH-001 | 4 | DONE | T-AUTH-003 | Must Have
T-AUTH-005 | Implement login API endpoint | US-AUTH-002 | 6 | DONE | T-AUTH-002 | Must Have
T-AUTH-006 | Build login form frontend | US-AUTH-002 | 5 | DONE | T-AUTH-005 | Must Have
T-AUTH-007 | Add login error handling | US-AUTH-002 | 3 | DONE | T-AUTH-006 | Must Have
Week 1 Total: 38 hours

### Week 2: Profile Management (US-PROFILE-001 & US-PROFILE-002)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-PROF-001 | Create profile data schema | US-PROFILE-001 | 4 | DONE | T-AUTH-002 | Must Have
T-PROF-002 | Implement profile view API endpoint | US-PROFILE-001 | 6 | DONE | T-PROF-001 | Must Have
T-PROF-003 | Build profile view frontend | US-PROFILE-001 | 6 | DONE | T-PROF-002 | Must Have
T-PROF-004 | Implement profile update API endpoint | US-PROFILE-002 | 6 | DONE | T-PROF-002 | Could Have
T-PROF-005 | Build profile edit form frontend | US-PROFILE-002 | 7 | DONE | T-PROF-004 | Could Have
T-PROF-006 | Add password change functionality | US-PROFILE-002 | 5 | DONE | T-PROF-004 | Could Have
T-PROF-007 | Implement profile validation logic | US-PROFILE-002 | 4 | DONE | T-PROF-005 | Could Have
Week 2 Total: 38 hours

### Week 3: Mood Logging (US-MOOD-001 & US-MOOD-002)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-MOOD-001 | Create mood/sleep data schema | US-MOOD-001, US-MOOD-002 | 6 | DONE | T-AUTH-002 | Must Have
T-MOOD-002 | Implement mood rating API endpoint | US-MOOD-001 | 6 | DONE | T-MOOD-001 | Must Have
T-MOOD-003 | Build mood rating interface (1-10 scale) | US-MOOD-001 | 6 | DONE | T-MOOD-002 | Must Have
T-MOOD-004 | Add completion status tracking | US-MOOD-001 | 4 | DONE | T-MOOD-003 | Must Have
T-MOOD-005 | Implement sleep tracking API endpoint | US-MOOD-002 | 5 | DONE | T-MOOD-001 | Must Have
T-MOOD-006 | Build sleep quality/duration forms | US-MOOD-002 | 6 | DONE | T-MOOD-005 | Must Have
Week 3 Total: 33 hours

### Week 4: Journaling Feature (US-MOOD-003)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-MOOD-007 | Implement journaling API endpoint | US-MOOD-003 | 6 | DONE | T-MOOD-001 | Must Have
T-MOOD-008 | Build journaling interface frontend | US-MOOD-003 | 8 | DONE | T-MOOD-007 | Must Have
T-MOOD-009 | Design & Implement journaling validation & storage schema | US-MOOD-003 | 4 | DONE | T-MOOD-008 | Must Have
T-MOOD-010 | Implement journal entry history view | US-MOOD-003 | 6 | DONE | T-MOOD-009 | Must Have
T-MOOD-011 | Implement journal entry date filtering function | US-MOOD-003 | 6 | DONE | T-MOOD-010 | Must Have
Week 4 Total: 24 hours

## 2.5. Success metrics
### Feature readiness metrics
1. Authentication Features: Users can successfully register, log in, and log out with secure validation (100% pass rate in test cases).
2. Profile Management Features: Users can view and update their profile information with correct data persistence (≥ 95% of test cases pass).
3. Mood Logging Features: Users can record mood and sleep entries daily, with correct storage and retrieval (≥ 95% of test cases pass).

### Delivery & Completion Metrics
1. Sprint Backlog Completion Rate: ≥ 90% of committed user stories (US-AUTH-001 to US-MOOD-003) are completed and tested.