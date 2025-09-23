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
> _To be updated with current UI screenshots._

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
