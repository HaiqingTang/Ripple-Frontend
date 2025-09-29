## Executive Summary
This document outlines Sprint 3 planning incorporating client feedback from Sprint 2 review. Sprint 3 focuses on authentication enhancements, visual improvements, mood tracking restructuring, and journal functionality expansion based on industry partner requirements.

---

## 1. Sprint 3 Details

**Sprint Number:** Sprint 3  
**Start Date:** 29/09/2025  
**End Date:** 24/10/2025 (4 weeks)  
**Sprint Duration:** 4 weeks  

**Sprint Goal:** Enhance user experience through improved authentication security, visual interface updates, restructured mood tracking system, and expanded journal functionality with multimedia support, based on direct client feedback and user experience improvements.

---

## 2. Team Capacity Analysis

### 2.1 Team Composition & Availability
**Team Size:** 5 part-time members  
**Individual Capacity:** 20 hours/week per member  
**Total Team Capacity:** 100 hours/week  
**Sprint Total Capacity:** 400 hours (4 weeks)  

### 2.2 Capacity Allocation Strategy
- **Buffer for Testing & Bug Fixes:** 15% (60 hours)
- **Sprint Review & Retrospective:** 5% (20 hours)  
- **Available Development Capacity:** 80% (320 hours)
- **Weekly Development Capacity:** 80 hours/week

### 2.3 Weekly Capacity Planning
| Week | Focus Area | Planned Hours | Available Capacity | Utilization |
|------|------------|---------------|-------------------|-------------|
| Week 1 | Authentication & Visual Improvements | 80 hours | 80 hours | 100% |
| Week 2 | Mood Tracking & Journal Topic Selection System & Discussion Board Setup | 70 hours | 80 hours | 87.5% |
| Week 3 | Journal Enhancement & Post Creation | 77 hours | 80 hours | 96.25%* |
| Week 4 | Post Interactions & Final Presentation | 40 hours | 80 hours | 50%** |

*Week 3 overflow will be managed by starting some tasks in Week 2  
**Week 4 reduced capacity due to presentation preparation and delivery

---

## 3. User Story Backlog

### 3.1 User Story Planned for Sprint 3 with Prior Progress
#### **Feature: Historical Log Data Page**
| User Story ID | Title | Status | Remaining Work |
|---------------|-------|--------|----------------|
| *US-MOOD-004 | Historical Data & Filters | Frontend Complete | Backend API implementation only - firestore backend queries |

*This user story was originally planned for Sprint 3, however most of the frontend work was completed ahead of schedule during Sprint 2

#### 3.2 Backbone Feature: Community Discussion Board
| User Story ID | Title | Priority | Story Points | Justification |
|---------------|-------|----------|--------------|---------------|
| US-COMM-001 | Browse & Search Discussions | MUST HAVE | 5 | Post listing, search functionality, and Firestore query optimization |
| US-COMM-002 | Post Creation with Image Upload | MUST HAVE | 5 | Post creation form, image upload integration, and content validation |
| US-COMM-003 | Post Interaction (Like & Comment) | SHOULD HAVE | 3 | Like/unlike functionality and comment system with real-time updates |

### 3.3 New User Stories (From Client Feedback)

#### **Feature: Enhanced User Authentication**
| User Story ID | Title | Priority | Story Points | Justification |
|---------------|-------|----------|--------------|---------------|
| US-AUTH-003 | Email Verification During Sign-up | MUST HAVE | 5 | Multi-step flow requiring Firebase Auth email verification setup and UI flow changes |
| US-AUTH-004 | Organization Field for Business Users | MUST HAVE | 1 | Simple form field addition with Firestore document field update |

#### **Feature: Visual Interface Improvements**
| User Story ID | Title | Priority | Story Points | Justification |
|---------------|-------|----------|--------------|---------------|
| US-UI-001 | Journal Icon for Personal Log Page | MUST HAVE | 1 | Simple asset integration and component update |

#### **Feature: Mood Tracking System Restructure**
| User Story ID | Title | Priority | Story Points | Justification |
|---------------|-------|----------|--------------|---------------|
| US-MOOD-005 | Angry Emotion Option Selection | MUST HAVE | 1 | Simple emoji component update |
| US-MOOD-006 | Separate Feelings and Emotions Sections | MUST HAVE | 2 | UI restructuring  |
| US-MOOD-007 | Multiple Personal Log Entries Per Day | MUST HAVE | 2 | Firestore array handling and timestamp display updates |

#### **Feature: Enhanced Journal Functionality**  
| User Story ID | Title | Priority | Story Points | Justification |
|---------------|-------|----------|--------------|---------------|
| US-JOURNAL-001 | Image Upload for Journal Entries | MUST HAVE | 8 | React Native ImagePicker integration, Firebase Storage setup, and image handling |
| US-JOURNAL-002 | Journal Topic Selection System | COULD HAVE | 2 | Migrate from static array to Firestore collection with dynamic fetching |

### 3.4 User Story Dependencies & Critical Path Analysis
<img width="1385" height="289" alt="Screenshot 2025-09-29 at 8 15 54 am" src="https://github.com/user-attachments/assets/449aafa6-96d8-4057-b054-e705143ead6f" />

---

## 4. Story Points Justification

### 4.1 Priority Classification System
- **MUST HAVE:** Essential features required for sprint success and core functionality
- **SHOULD HAVE:** Valuable features that enhance the user experience and add significant improvement  
- **COULD HAVE:** Optional features that are desirable but can be deferred to a future sprint if necessary

### 4.2 Story Points Estimation Rationale

**1 Point (Simple):** US-UI-001
- Single asset addition, minimal code changes, no database modifications

**2 Points (Small):** US-AUTH-004, US-MOOD-005, US-MOOD-006  
- Simple form field additions or component updates, minor database changes

**3 Points (Small-Medium):** US-MOOD-007
- Moderate complexity, requires backend optimization and frontend updates

**5 Points (Medium):** US-AUTH-003, US-JOURNAL-002, US-MOOD-004
- Moderate complexity with external dependencies or multi-component changes

**13 Points (Extra Large):** US-JOURNAL-001  
- Most complex feature involving multiple technologies, security considerations, and performance optimization

**Total Sprint Points:** 35 points  
**Team Velocity Estimate:** 35-45 points per sprint (based on 5 part-time developers)

---

## 5. Detailed Task Breakdown

### 5.1 Week 1: Authentication & Visual Improvements (80 hours)

#### **US-AUTH-003: Email Verification During Sign-up (30 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-AUTH-008 | Configure Firebase Auth email verification settings | 4 | None | Firebase project configured to send verification emails |
| T-AUTH-009 | Update registration flow to include verification step | 8 | T-AUTH-008 | Users receive verification email after signup and cannot access app until verified |
| T-AUTH-010 | Implement email verification status checking | 6 | T-AUTH-009 | App checks verification status and shows appropriate screen |
| T-AUTH-011 | Add resend verification email functionality | 4 | T-AUTH-010 | Users can resend verification email if not received |
| T-AUTH-012 | Create verification success/error screens | 6 | T-AUTH-009 | Users see clear feedback when email is verified or verification fails |
| T-AUTH-013 | Testing and error handling | 2 | All above | All verification edge cases work smoothly with helpful error messages |

#### **US-AUTH-004: Organization Field for Business Users (10 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-AUTH-014 | Add organization field to sign-up form UI | 3 | None | Organization input field appears above email field on signup screen |
| T-AUTH-015 | Update Firebase user document schema | 2 | T-AUTH-014 | User profiles can store optional organization information |
| T-AUTH-016 | Implement form validation for organization field | 3 | T-AUTH-015 | Organization field accepts valid text input and handles empty values |
| T-AUTH-017 | Update user registration function | 2 | T-AUTH-016 | Users can successfully sign up with or without organization information |

#### **US-UI-001: Journal Icon for Personal Log Page (5 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-UI-001 | Source or create journal/notebook icon assets | 1 | None | Professional-quality icon assets available in required sizes |
| T-UI-002 | Implement reusable Icon component | 2 | T-UI-001 | Icon component displays consistently across different screen sizes |
| T-UI-003 | Add icon to Personal Log page header | 2 | T-UI-002 | Users can immediately identify Personal Log page purpose through visual icon |

#### **Buffer & Team Coordination (35 hours)**

### 5.2 Week 2: Mood Tracking & Journal Topic Selection System & Discussion Board Setup (70 hours)

#### **US-MOOD-005: Angry Emotion Option Selection (5 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-MOOD-012 | Update emoji picker component with angry option | 3 | None | Users can select angry emotion from emotion picker and it saves correctly |
| T-MOOD-013 | Test emoji rendering across devices | 2 | T-MOOD-012 | Angry emoji displays correctly on different screen sizes and devices |

#### **US-MOOD-006: Separate Feelings and Emotions Sections (12 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-MOOD-015 | Design new dual-section UI layout | 5 | None | Users can clearly distinguish between feelings and emotions sections |
| T-MOOD-016 | Update form validation and submission logic | 5 | T-MOOD-017 | Users can submit form with either section completed and receive appropriate validation feedback |
| T-MOOD-017 | Testing and user flow validation | 2 | All above | Users can complete daily mood logging smoothly without confusion |

#### **US-MOOD-007: Multiple Personal Log Entries Per Day (10 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-MOOD-021 | Update Firestore structure to use entry arrays | 3 | None | Users can create multiple mood entries on the same day without overwriting previous entries |
| T-MOOD-022 | Update FlatList for multiple entry display | 4 | T-MOOD-021 | Users can view all their daily entries in chronological order with clear separation |
| T-MOOD-023 | Add timestamp display for each entry | 3 | T-MOOD-022 | Users can see when each entry was created to distinguish between multiple daily entries |

#### **US-JOURNAL-002: Journal Topic Selection System (8 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-JOURNAL-008 | Create Firestore topics collection | 1 | None | Topics collection created |
| T-JOURNAL-009 | Implement topic fetching function | 3 | T-JOURNAL-008 | Dynamic topic loading from Firestore |
| T-JOURNAL-010 | Update journal form to use dynamic topics | 3 | T-JOURNAL-009 | Topic picker replaces static array |
| T-JOURNAL-011 | Add loading states for topic selection | 1 | T-JOURNAL-010 | Loading indicator during topic fetch |


#### **US-COMM-001: Browse & Search Discussions (25 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-COMM-001 | Create Firestore posts collection structure | 2 | None | Posts collection with proper schema |
| T-COMM-002 | Implement post listing with pagination | 8 | T-COMM-001 | Efficient post loading with scroll pagination |
| T-COMM-003 | Add search functionality for posts | 6 | T-COMM-002 | Users can search posts by keywords |
| T-COMM-004 | Create post list UI components | 6 | T-COMM-003 | Clean, readable post display |
| T-COMM-005 | Implement post filtering and sorting | 3 | T-COMM-004 | Sort by date, popularity, etc. |

#### **Buffer (10 hours)**

### 5.3 Week 3: Journal Enhancement & Discussion Board Posts (77 hours)

#### **US-JOURNAL-001: Image Upload for Journal Entries (40 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-JOURNAL-001 | Set up Firebase Storage with basic security rules | 3 | None | User-specific image access configured |
| T-JOURNAL-002 | Install and configure React Native ImagePicker | 4 | None | Library integrated and configured |
| T-JOURNAL-003 | Implement image selection (camera/gallery) | 6 | T-JOURNAL-002 | Users can select images from both sources |
| T-JOURNAL-004 | Add image compression and validation | 8 | T-JOURNAL-003 | Images compressed to <1MB, JPEG/PNG only |
| T-JOURNAL-005 | Implement image upload to Firebase Storage | 8 | T-JOURNAL-001, T-JOURNAL-004 | Images uploaded with progress indicators |
| T-JOURNAL-006 | Update journal component for image display | 6 | T-JOURNAL-005 | Images display within journal entries |
| T-JOURNAL-007 | Add image preview and removal functionality | 5 | T-JOURNAL-006 | Users can preview and remove images |


#### **US-COMM-002: Post Creation with Image Upload (25 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-COMM-006 | Create post creation form UI | 8 | T-COMM-001 | Clean, intuitive post creation interface |
| T-COMM-007 | Implement text content validation and storage | 4 | T-COMM-006 | Posts saved to Firestore with validation |
| T-COMM-008 | Integrate image upload for posts | 6 | T-JOURNAL-001, T-COMM-007 | Posts can include images from gallery/camera |
| T-COMM-009 | Add post preview functionality | 4 | T-COMM-008 | Users can preview posts before publishing |
| T-COMM-010 | Implement post submission and success feedback | 3 | T-COMM-009 | Posts submitted with user confirmation |

#### **Buffer (12 hours)**

### 5.4 Week 4: Post Interactions & Historical Data (60 hours)

#### **US-COMM-003: Post Interaction (Like & Comment) (30 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-COMM-011 | Implement like/unlike functionality | 8 | T-COMM-007 | Users can like/unlike posts with real-time updates |
| T-COMM-012 | Create comment system with Firestore subcollections | 10 | T-COMM-007 | Users can add comments to posts |
| T-COMM-013 | Build comment display and threading UI | 8 | T-COMM-012 | Comments display in chronological order |
| T-COMM-014 | Add like count and comment count displays | 4 | T-COMM-011, T-COMM-013 | Post metrics visible to users |

#### **US-MOOD-004: Historical Data & Filters Backend (5 hours)**
| Task ID | Description | Hours | Dependencies | Acceptance Criteria |
|---------|-------------|-------|--------------|-------------------|
| T-MOOD-025 | Add date range filtering with Firestore where queries | 1 | None | Users can filter their mood history by selecting start and end dates |
| T-MOOD-026 | Add mood/emotion filtering logic | 2 | T-MOOD-025 | Users can filter their history to show only specific moods or emotions |
| T-MOOD-027 | Connect backend filters to existing frontend | 1 | T-MOOD-026 | Users can see filtered results immediately when applying date or mood filters |
| T-MOOD-028 | Testing filtering functionality | 1 | T-MOOD-027 | All filter combinations work correctly and return expected results |

#### **Integration & Testing (15 hours)**
- Cross-feature integration testing
- End-to-end user flow testing  
- Performance optimization
- Bug fixes and refinements

---

## 6. Risk Management & Dependencies

### 6.1 Critical Dependencies
| Dependency | Impact | Mitigation Strategy |
|------------|---------|-------------------|
| Client topic list for US-JOURNAL-002 | Medium | Prepare with sample topics, implement dynamic system |
| Firebase Storage configuration | High | Start early in Week 3, have backup plan |
| Data migration complexity | High | Thorough testing in development environment |

### 6.2 Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|------------|---------|------------|
| Week 3 capacity overflow | Medium | Medium | Start some tasks in Week 2, prioritize critical features |
| Image upload performance issues | Low | High | Implement compression and progressive loading |
| Data migration failures | Low | Critical | Comprehensive backup and rollback procedures |

---

## 7. Success Metrics & Acceptance Criteria

### 7.1 Sprint Success Metrics
1. **Feature Completion Rate:** ≥85% of committed story points delivered
2. **Critical Features:** 100% completion rate for Critical priority user stories
3. **Quality Standards:** ≥95% test coverage for new features
4. **Performance:** Image uploads complete in <5 seconds for 1MB images
5. **User Experience:** No regression in existing functionality

### 7.2 Definition of Done
- [ ] Feature implementation completed according to acceptance criteria
- [ ] Unit tests written and passing (≥90% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved by team
- [ ] Documentation updated
- [ ] Client demo-ready

### 7.3 Sprint Review & Final Presentation
- **Final Presentation Date:** Week 4 (24/10/2025)
- **Demo Script:** Complete user journey showcasing all Sprint 3 features
- **Stakeholder Presentation:** Client feedback session and feature validation
- **Performance Metrics:** Quantified improvements and benchmarks
- **Post-Presentation:** Feedback collection and Sprint 4 preliminary planning

---

