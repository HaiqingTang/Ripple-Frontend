# RP-Koala

# RiPPLE
*A design-led solution for smart community service organisations to help their millennial workforce thrive.*

---

## Overview
### What is RiPPLE?
RiPPLE is a wellbeing and peer-support mobile app designed to support community service workers, especially those early in their careers who are at high risk of burnout. Many young workers in this space struggle with high stress, isolation, and the risk of burnout. Our app provides simple tools to help them check in with their wellbeing, share experiences with peers, and build small, positive habits that support a healthier work life.

### Why we built it
Burnout is a common issue in non-profit and social service organisations because staff are often expected to prioritise clients over themselves. Community service organisations, while focused on helping clients, often lack the resources and systems to adequately support their employees’ wellbeing. Through our research, we found that young workers wanted a way to connect with others who understand their challenges, while also having access to practical and engaging self-care strategies. RiPPLE was created to fill this gap.

---

## Key Features
- **Wellbeing Check-in** → Quick emotional and energy-level surveys to track day-to-day health
- **Journaling** → Personal space for daily reflections
- **Community Feed** → Share uplifting moments, resources, and tips to community and friends;
- **Local Events & Meetups** → Connect with peers through real-world gatherings
- **Discussion Boards** → Spaces for open conversation and peer support
- **Challenges & Rewards** → Gamified activities like step challenges

---

## Tech Stack

### Frontend (Mobile App)
- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)


### Backend & Database
- **Backend**: [Firebase Functions](https://firebase.google.com/docs/functions) (Node.js)
- **Database**: [Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Storage**: [Firebase Storage](https://firebase.google.com/docs/storage)
- **Hosting**: [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Development Tools
- **Version Control**: Git & GitHub
- **Code Quality**: ChatGPT code review
- **Build Tool**: Expo CLI
- **Package Manager**: npm
- **Development Environment**: Node.js 22+

---

## Get Started

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (version 22 or higher)
- **npm** (comes with Node.js)
- **Git**
- **Expo CLI**: `npm install -g @expo/cli`
- **Firebase CLI**: `npm install -g firebase-tools`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/COMP90082-2025-sem2/RP-Koala.git
   cd RP-Koala
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd src/frontend
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd ../backend/functions
   npm install
   ```

4. **Firebase Setup**:
   ```bash
   # Login to Firebase (if not already logged in)
   firebase login
   
   # Navigate to project root and connect to existing Firebase project
   cd ../../..
   firebase use comp90018-rp-koala-277f0
   
   # Initialize Firebase features (if not already done)
   firebase init
   ```

5. **Environment Configuration**:
   - Create a `.env` file in `src/frontend/` with your Firebase configuration
   - Get Firebase config from [Firebase Console](https://console.firebase.google.com/u/0/project/comp90018-rp-koala-277f0/settings/general/)
   - Contact the team for the required environment variables

### Running the Application

#### Frontend Development
```bash
cd src/frontend

# Start the development server
npm expo start


```

## Project Structure

```
RP-Koala/ (root)
├── docs/ # Documentation files
│   └── changelog.md # Changelog for each sprint
├── src/ # Source code
│   └── backend/
│   └── frontend/
└── README.md # This file
```

## Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format**
```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Common types**
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes only
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code changes that neither fix a bug nor add a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance changes (build tools, dependencies, etc.)
- **build**: Changes to the build system or external dependencies
- **ci**: Changes to CI configuration or scripts
- **revert**: Revert a previous commit

**Example**
```
feat(auth): add user login API
```

--- 
## Branch Naming Convention

This project follows a consisten branch naming format to make the purpose of each branch clear.

**Format**
```
<type>/<short-description>
```
**Types (aligned with commit types)**
- **feat/** – new feature development
- **fix/** – bug fixes
- **docs/** – documentation updates
- **chore/** – maintenance or setup tasks
- **efactor/** – code refactoring without new features or bug fixes
- **test/** – testing-related changes

**Example**
```
feat/login-page
fix/navbar-overlap
docs/update-readme
chore/setup-ci
refactor/auth-service
```
---

## Changelog

📖 **See full Changelog:** [Changelog.md](docs/changelog.md)
