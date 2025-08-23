# RP-Koala

# RiPPLE
*A design-led solution for smart community service organisations to help their millennial workforce thrive.*

---

## Overview
### What is RiPPLE?
RiPPLE is a wellbeing and peer-support app designed for people working in the community service sector, especially those early in their careers. Many young workers in this space struggle with high stress, isolation, and the risk of burnout. Our app provides simple tools to help them check in with their wellbeing, share experiences with peers, and build small, positive habits that support a healthier work life.

### Why we built it
Burnout is a common issue in non-profit and social service organisations because staff are often expected to prioritise clients over themselves. Through our research, we found that young workers wanted a way to connect with others who understand their challenges, while also having access to practical and engaging self-care strategies. RiPPLE was created to fill this gap.

---

## Key Features
- **Wellbeing Check-in** → Quick emotional and energy-level surveys to track day-to-day health
- **Journaling** → Personal space for daily reflections
- **Community Feed** → Share uplifting moments, resources, and tips to community and friends;
- **Local Events & Meetups** → Connect with peers through real-world gatherings
- **Discussion Boards** → Spaces for open conversation and peer support
- **Challenges & Rewards** → Gamified activities like step challenges

---

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
