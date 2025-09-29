# Sprint 2 Review With Industry Partner

This section documents comprehensive feedback from our industry partner client meeting, and outlines strategic actions for the upcoming sprint. The feedback spans six critical areas of the application, providing valuable insights that will directly inform our development priorities and user experience improvements.

## Sprint Review Overview
Date: 19/09/2025<br>
Location: Online Zoom meeting<br>
Participants: Mirela (client), all team members

## Industry Partner Feedback Analysis
### 1. Sign-up & Validation Enhanceent
#### Client Feedback:<br>
- The client would like to add email validation during sign-up to improve security
- The client woudl like to include optional 'Organization' Name field (simple text input, positioned above the email field) on the sign-up page

#### Technical Design Implications:
- Email validation requires Firebase Auth email verification integration and additional sign-up flow screens in React Native
- Organization field adds simple TextInput component above email field, with additional field in Firebase user document
- Database schema change requires migration of existing users to include organization field
- Future form field additions will follow same pattern without major refactoring

#### Action Items:<br>
1. Add email verification to sign-up process
  - Send confirmation email to verify user's email address
  - Prevent account activation until email is verified
  - Include resend verification email functionality

2. Add optional Organization field to sign-up page
  - Position organisation input above email field as requested
  - Store in user database schema


***

### 2. Personal Log Visual Improvements and Restructuring
#### Client Feedback:<br>
- The client would like to improve visual representation of the personal log page with meaningful icon/imagery
- The client would like to replace second emoji (in the mood rating section) with an "angry" emotion option
- The client would like to separate the 'Feelings' and 'Emotions' sections into distinct sections/boxes

#### Technical Design Implications:
- Icon implementation requires asset creation and React Native Image/Icon component integration
- Reusable icon component pattern should be established for consistent implementation across app
- Requires refactoring existing mood component into two separate React Native components
- Firebase document structure update requires migration of existing mood data format
- Angry emoji addition updates existing emoji picker component with minimal changes

#### Action Items:
1. Update emotion selection system
  - Replace second emoji with angry emotion in emoji picker component
  - Update emotion storage and display logic to include angry option

2. Separate Feelings and Emotions into distinct sections
  -  Refactor existing mood component into two distinct UI sections
  - Create separate container components for feelings and emotions
  - Update Firebase document structure: `{ feelings: {...}, emotions: {...} }`
  - Update form validation and submission logic for dual sections

3. Implement page iconography
  - Create or source journal/notebook icon assets
  - Add icon component to Personal Log page header

***

### 3. Multiple Records Functionality for Personal Log Page
#### Client Feedback:
  - The client is happy with the behaviour of the current personal log page - which should enable multiple record additions per day by users.
  - Concern for redundant question in the personal log form, in relation to allowing multiple records per day was brought up during discussion with the client. The conclusion was made that the client will conduct user testing with the MVP, to validate question redundancy.

#### Backend Design Implications:
- Multiple entries require timestamp handling and FlatList optimization for performance

#### Action items:
1. Frontend: As the client is happy with the current behaviour of the logging system, no changes are needed for current FE design.
2. Backend: 
  - Modify Firebase personal log collection to include timestamp field
  - Update document structure to support multiple entries per day: `{ date: "YYYY-MM-DD", entries: [{timestamp, data}] }`

***

### 4. Journal feature enhancement
#### Client feedback:
- The client would like to have an additional image upload functionality for the journaling section

#### Technical design implications:
- Image upload requires React Native ImagePicker library integration and Firebase Storage setup
- Journal component refactoring needed to handle both text and image content rendering
- Firebase Storage security rules implementation required for user-specific image access
- Image handling increases app bundle size and requires storage optimization considerations

#### Action items:
1. **Set up Firebase Storage configuration**
   - Configure Firebase Storage in project settings
   - Set up storage security rules for user-specific image access
   - Configure storage bucket and file organization structure

2. **Integrate React Native ImagePicker**
   - Install and configure react-native-image-picker library
   - Implement image selection from camera and gallery
   - Add image compression and validation (file size, format)

3. **Update Journal component for image handling**
   - Refactor journal entry component to display both text and images
   - Implement image upload progress indicators
   - Add image preview and removal functionality

4. **Implement secure image upload workflow**
   - Create upload function with error handling
   - Generate unique image file names and paths
   - Store image URLs in Firestore journal documents

***

### 5. Journal Topic Taggging List
Client Feedback:
- The client will provide input on potential journal topics for the application
- Ongoing communication is expected to facilitate this collaboration
- No specific topics or timeline were discussed during this meeting

#### Implications:<br>
- Current static topic list stored as const array in frontend needs migration to Firebase collection
- Requires refactoring journal form to fetch topics dynamically instead of using hardcoded values
- Frontend components need loading states and error handling for dynamic topic fetching
- Migration creates dependency on client-provided topic data to populate backend collection

#### Action items:
1. Prepare backend infrastructure
- Create Firebase "topics" collection with document structure: `{ id, name, category, isActive }`
- Implement topic fetching functions with caching for performance
- Add loading and error states to topic selection components

2. Await client topic list and implement
- Coordinate with client to receive initial topic list
- Populate Firebase topics collection with client-provided data
- Update journal form to use dynamic topic fetching instead of static const array

***

## Sprint 3 Implications
_Note: Details for these newly added user stories can be found in the Sprint 3 planning section_

### New User Stories to Add:
**Feature: Enhanced User Authentication**<br>
- **US-001**: Email Verification During Sign-up
- **US-002**: Organization Field for Business Users

**Feature: Improved Personal Logging Experience**<br>
- **US-003**: Journal Icon for Personal Log Page
- **US-004**: Angry Emotion Option Selection
- **US-005**: Separate Feelings and Emotions Sections

**Feature: Enhanced Journal Functionality**<br>
- **US-006**: Image Upload for Journal Entries
- **US-007**: Journal Topic Selection System

**Feature: Multiple Daily Entries**<br>
- US-008: Multiple Personal Log Entries Per Day
