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
## 2.1. User Story Dependencies & Critical Path Analysis
<img width="544" height="221" alt="Screenshot 2025-08-29 at 3 12 28 pm" src="https://github.com/user-attachments/assets/5695def9-4029-4a43-89b6-b655f80e857c" />



## 2.2. Sprint Workflow and Execution Plan

<img width="900" height="500" alt="Sprint 2 Workflow   Execution Plan (5)" src="https://github.com/user-attachments/assets/839fb3fe-2e19-438b-aaed-9641b11b87a0" />


## 2.3. Sprint Backlog
| User Story ID | User Story (Title)            | Backbone Feature                 | Absolute Priority | Sprint Allocation | Dependencies |Story Points | Status
|----------------|-------------------------------|----------------------------------|-----------------|------------|--------------|--------------|----|
| US-AUTH-001      | User Registration               | User Authentication           | 1     | Sprint 2      | None  | 3            | TODO  |
| US-AUTH-002      | Secure Login                    | User Authentication           | 2     | Sprint 2      | US-AUTH-001 | 3            | TODO |
| US-PROFILE-001      | View Profile              | Profile Management System        | 3     | Sprint 2      | US-AUTH-002  | 5            | TODO |
| US-PROFILE-002      | Edit Profile              | Profile Management System        | 4     | Sprint 2      | US-PROFILE-001  | 5            | TODO |
| US-MOOD-001      | Rate Daily Mood (1-10)          | Daily Mood & Sleep Logging    | 5      | Sprint 2     |  US-AUTH-002  | 3            | TODO |
| US-MOOD-002      | Sleep Tracking                  | Daily Mood & Sleep Logging    | 6      | Sprint 2     | US-AUTH-002  | 3            | TODO |
| US-MOOD-003      | Personal Journaling             | Daily Mood & Sleep Logging    | 7      | Sprint 2     |  US-AUTH-002 | 5            | TODO |
| US-MOOD-004      | Historical Data & Filters       | Daily Mood & Sleep Logging    | 8      | Sprint 3     | US-MOOD-001, US-MOOD-002, US-MOOD-003  | 8            | TODO |
| US-COMM-001      | Browse & Search Discussions     | Community Discussion Board    | 9      | Sprint 3     | US-AUTH-002  | 6            | TODO |
| US-COMM-002      | Post Creation         | Community Discussion Board    | 10      | Sprint 3       | US-AUTH-002  | 5          | TODO |
| US-COMM-003      | Post Interaction         | Community Discussion Board    | 11      | Sprint 3    |  US-AUTH-002, US-COMM-002  | 5           | TODO |

## 2.4. Task Breakdown

### Week 1: Authentication Foundation (US-AUTH-001 & US-AUTH-002)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-AUTH-001 | Set up database schema for user accounts | US-AUTH-001 | 6 | TODO | None | Critical
T-AUTH-002 | Implement user registration API endpoint | US-AUTH-001 | 8 | TODO | T-AUTH-001 | Critical
T-AUTH-003 | Build registration form frontend | US-AUTH-001 | 6 | TODO | T-AUTH-002 | Critical
T-AUTH-004 | Implement email validation logic | US-AUTH-001 | 4 | TODO | T-AUTH-003 | Critical
T-AUTH-005 | Implement login API endpoint | US-AUTH-002 | 6 | TODO | T-AUTH-002 | Critical
T-AUTH-006 | Build login form frontend | US-AUTH-002 | 5 | TODO | T-AUTH-005 | Critical
T-AUTH-007 | Add login error handling | US-AUTH-002 | 3 | TODO | T-AUTH-006 | Critical
Week 1 Total: 38 hours

### Week 2: Profile Management (US-PROFILE-001 & US-PROFILE-002)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-PROF-001 | Create profile data schema | US-PROFILE-001 | 4 | TODO | T-AUTH-002 | High
T-PROF-002 | Implement profile view API endpoint | US-PROFILE-001 | 6 | TODO | T-PROF-001 | High
T-PROF-003 | Build profile view frontend | US-PROFILE-001 | 6 | TODO | T-PROF-002 | High
T-PROF-004 | Implement profile update API endpoint | US-PROFILE-002 | 6 | TODO | T-PROF-002 | High
T-PROF-005 | Build profile edit form frontend | US-PROFILE-002 | 7 | TODO | T-PROF-004 | High
T-PROF-006 | Add password change functionality | US-PROFILE-002 | 5 | TODO | T-PROF-004 | High
T-PROF-007 | Implement profile validation logic | US-PROFILE-002 | 4 | TODO | T-PROF-005 | High
Week 2 Total: 38 hours

### Week 3: Mood Logging (US-MOOD-001 & US-MOOD-002)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-MOOD-001 | Create mood/sleep data schema | US-MOOD-001, US-MOOD-002 | 6 | TODO | T-AUTH-002 | High
T-MOOD-002 | Implement mood rating API endpoint | US-MOOD-001 | 6 | TODO | T-MOOD-001 | High
T-MOOD-003 | Build mood rating interface (1-10 scale) | US-MOOD-001 | 6 | TODO | T-MOOD-002 | High
T-MOOD-004 | Add completion status tracking | US-MOOD-001 | 4 | TODO | T-MOOD-003 | High
T-MOOD-005 | Implement sleep tracking API endpoint | US-MOOD-002 | 5 | TODO | T-MOOD-001 | High
T-MOOD-006 | Build sleep quality/duration forms | US-MOOD-002 | 6 | TODO | T-MOOD-005 | High
Week 3 Total: 33 hours

### Week 4: Journaling Feature (US-MOOD-003)
Task ID | Task Description | Related User Story | Estimation (Hours) | Status | Dependencies | Priority
-- | -- | -- | -- | -- | -- | --
T-MOOD-007 | Implement journaling API endpoint | US-MOOD-003 | 6 | TODO | T-MOOD-001 | High
T-MOOD-008 | Build journaling interface frontend | US-MOOD-003 | 8 | TODO | T-MOOD-007 | High
T-MOOD-009 | Design & Implement journaling validation & storage schema | US-MOOD-003 | 4 | TODO | T-MOOD-008 | High
T-MOOD-010 | Implement journal entry history view | US-MOOD-003 | 6 | TODO | T-MOOD-009 | High
T-MOOD-011 | Implement journal entry date filtering function | US-MOOD-003 | 6 | TODO | T-MOOD-010 | High
Week 4 Total: 24 hours

## 2.5. Success metrics
### Feature readiness metrics
1. Authentication Features: Users can successfully register, log in, and log out with secure validation (100% pass rate in test cases).
2. Profile Management Features: Users can view and update their profile information with correct data persistence (≥ 95% of test cases pass).
3. Mood Logging Features: Users can record mood and sleep entries daily, with correct storage and retrieval (≥ 95% of test cases pass).

### Delivery & Completion Metrics
1. Sprint Backlog Completion Rate: ≥ 90% of committed user stories (US-AUTH-001 to US-MOOD-003) are completed and tested.