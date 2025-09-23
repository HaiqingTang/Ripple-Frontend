# RP-Wombat

## Table of Contents
- [About Ripple](#about-ripple)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Development Progress](#development-progress)
- [Changelog](#changelog)

## About Ripple
Ripple is a design-led solution created for smart community service organizations, aiming to support early-career community service workers in managing their emotional wellbeing and preventing burnout.

## Installation
Clone the repository:
```sh
git clone https://github.com/your-username/RP-Wombat.git
cd RP-Wombat
```

Install dependencies:
```sh
npm install
```

## Getting Started
Run the development server:
```sh
npm run start
```

Expo will open a QR code in the terminal. You can scan it with **Expo Go** on your phone, or run the app on an Android/iOS simulator.

## Usage
Ripple is designed for early-career community service workers, such as Ellie (a 23-year-old youth caseworker in Sydney), who face challenges like emotional exhaustion, lack of career support, and systemic pressures that often lead to burnout.

After downloading the app, users can:
- Complete a quick emotional and energy check-in  
- Start journaling their thoughts and experiences  
- Connect with peers through clubs and meetups  
- Participate in challenges and local events  
- Earn rewards via the gamified system  

## Features
### Wellbeing Check-in
- Quick survey to track emotional and energy levels  
- Visual representation of wellbeing trends over time  
- Personalized recommendations based on check-in results  

### Journaling
- Voice and text logging options  
- Guided reflection prompts  
- Emotion and health tracking  

### Clubs & Meetups
- Discover and join clubs or local meetups  
- Create and manage events  
- RSVP and track participation  

### Community Feed
- Share posts with peers  
- Filter posts by category (fitness, wellbeing, appreciation of beauty)  

### Challenges & Rewards
- Participate in weekly or monthly challenges  
- Earn rewards through local business partnerships (e.g., gyms, yoga, dining)  

## Screenshots
<img width="1320" height="2868" alt="Simulator Screenshot - iPhone 16 Pro Max - 2025-09-24 at 01 20 33" src="https://github.com/user-attachments/assets/9c3834eb-98b1-48f4-bdbf-5aeae538d5e6" />
<img width="1320" height="2868" alt="Simulator Screenshot - iPhone 16 Pro Max - 2025-09-24 at 01 21 05" src="https://github.com/user-attachments/assets/c13cedbd-30d7-49c8-92a2-5f1a9d03adeb" />
<img width="1320" height="2868" alt="Simulator Screenshot - iPhone 16 Pro Max - 2025-09-24 at 01 21 15" src="https://github.com/user-attachments/assets/01bdc8e6-208a-48c4-9ca2-0e44aca535cf" />
<img width="1320" height="2868" alt="Simulator Screenshot - iPhone 16 Pro Max - 2025-09-24 at 01 21 46" src="https://github.com/user-attachments/assets/23d2ab72-296f-4487-bdac-1db13916c8a6" />
<img width="1320" height="2868" alt="Simulator Screenshot - iPhone 16 Pro Max - 2025-09-24 at 01 20 46" src="https://github.com/user-attachments/assets/76b0fe0e-d16d-4719-a9b7-b09cb60302b9" />


## Tech Stack
- **Framework**: React Native + Expo  
- **Routing**: Expo Router 6  
- **Language**: TypeScript  
- **Navigation**: @react-navigation (stack/tabs)  
- **UI & Icons**: @expo/vector-icons, expo-image, expo-blur  
- **Storage & Data**: Firebase, AsyncStorage  
- **Maps & Location**: react-native-maps, expo-location  
- **Animations & Gestures**: react-native-reanimated, react-native-gesture-handler  
- **Date/Time**: @react-native-community/datetimepicker  

### Versions (from `package.json`)
| Package                   | Version |
|----------------------------|---------|
| Expo SDK                  | 54.0.2  |
| Expo Router               | 6.0.7   |
| React                     | 19.1.0  |
| React Native              | 0.81.4  |
| TypeScript                | 5.9.2   |
| Firebase                  | 12.2.1  |
| React Navigation (Native) | 7.1.6   |
| React Native Maps         | 1.20.1  |
| Reanimated                | 4.1.0   |

## Development Progress

### Sprint 1 (Prototype)
- Completed **UI prototype** using Figma  
- Documented app vision and core features  
- No functional implementation  

### Sprint 2 (Development)
**Frontend**
- Developed **Club** and **Meetup** features with main pages and navigation structure  
- Implemented Home page UI (mock data, backend integration pending)  
- Set up navigation with Expo Router (Tabs → Club/Meetup/Challenge/Profile)  
- Forms: Meetup creation/joining with validation and basic state handling  
- UI improvements based on client feedback:  
  - Date input changed to **dd-mm-yyyy** format with time picker  
  - Fixed location autocomplete bug  
  - Unified and clarified icon usage

**Backend**
- Connected **Club** to Firestore with real-time subscriptions, supporting search, category filtering, and join/leave operations.
- Integrated **Meetups** with Firestore real-time updates, including list, filtering, and detail views.
- Created a **Meetup creation** page, supporting title, description, time, attendees, categories, tags, and location.
- Created a **Meetup editing** page for updating event details, attendees, tags, and location, with map support.
- Enabled meetup participation flow, supporting join and leave operations.
- Built a **Meetup details view**, displaying complete data including sponsors, categories, attendees, and dynamic attendee count.
- Built a **Location view** using Firestore `locationGeo` for map rendering and attendee overview.
- Created a **My Meetups** page to display joined events and allow attendees to leave.
- Built a **Manage My Meetups** to allow creators to list, search, edit, and delete their own events.
- Supported **Club Topic Pages**, providing post updates and membership-based content access.
- Ensured real-time sync for all club and meetup functionality through Firestore subscriptions.
- Designed an extensible data model, including Firestore collections for clubs, meetups, and posts.
- Integrated Expo Location to geocode user-entered addresses into Firestore coordinates.
- Connected Firebase Auth to identify the current user for event creation, participation, and access control.

**Tooling**
- Configured GitHub Actions for ChatGPT PR Review  

**Known Gaps**
- Meetup deletion/cancellation currently lacks participant notification  
- Home page still not connected to backend  

**Next (Sprint 3)**
- Backend integration for Clubs & Meetups  
- Implement participant notifications on event deletion/cancellation  
- Develop Challenge & Reward modules and connect with UI  

## Changelog
- **Sprint 1**: Prototype design only, no functionality  
- **Sprint 2**: Development of Club and Meetup features, including main pages and navigation structure  
