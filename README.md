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
<img src="https://github.com/user-attachments/assets/1d85e868-0df3-4109-8f2d-8d2e6341496a" alt="e7a540cc36f57d66336bc591d28f7c81" width="320" loading="lazy"/>
<img src="https://github.com/user-attachments/assets/7b360508-b38c-4f85-9dac-0fb502841324" alt="8338c09f3097de924e79de1b57486b5c" width="320" loading="lazy" />
<img src="https://github.com/user-attachments/assets/1a480278-3c52-43a1-9e32-a777c02e96a0" alt="acbe655c20ed0bf4c5c8a310eded334d" width="320" loading="lazy" />
<img src="https://github.com/user-attachments/assets/1bb1b58e-0c77-4f14-809d-cd55ff400e30" alt="f4a13e4cdb7d1058bb6e657cb03db2b7" width="320" loading="lazy" />
<img src="https://github.com/user-attachments/assets/f7d05de1-9c5b-437d-9f56-85b9f0d32950" alt="7941ed09236067eea239d7df5d9f2dc7" width="320" loading="lazy" />
<img src="https://github.com/user-attachments/assets/f3da80af-cf57-4aec-b5f2-1f05c967a9e7" alt="431e394bf6cec3dede64b07e55943bc9" width="320" loading="lazy" />
<img src="https://github.com/user-attachments/assets/40e934c1-9f4e-4004-8df9-9d3dc4634f60" alt="c4040da60dac310ec563418a0d0a0ec8" width="320" loading="lazy" />
<img src="https://github.com/user-attachments/assets/83bbf095-25fd-4f34-99d2-b7ec39f1b744" alt="8c117310053d173b86e260840c46d765" width="320" loading="lazy" />
<img src="https://github.com/user-attachments/assets/32b86ec7-9d79-43ee-9ca7-6f90eaba86a7" alt="98217e915bd2cf22944b74deffb2a4cb" width="320" loading="lazy" />


## Tech Stack
- **Framework**: React Native + Expo  
- **Routing**: Expo Router 6  
- **Language**: TypeScript  
- **Navigation**: @react-navigation (stack/tabs)  
- **UI & Icons**: @expo/vector-icons, expo-image, expo-blur  
- **Storage & Data**: Firebase, AsyncStorage  
- **Maps & Location**: react-native-maps, expo-location  
- **Animations & Gestures**: react-native-reanimated, react-native-gesture-handler  
- **Images & Uploads**: expo-image-picker (gallery & permissions), FormData upload
- **Image Hosting/CDN**: Cloudinary (unsigned preset → secure_url saved to Firestore)

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
- Integrated Cloudinary image upload in Meetup creation, allowing users to select images via expo-image-picker, upload through an unsigned preset, and store the returned secure_url into Firestore.

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
