# Pull Request Title
> e.g., `feat(Interest): add clubTopic with sticky header & infinite scroll`

## Description
- What changed and why (motivation/context).
- Link to design/spec if any.

## Scope
- Impacted screens: `clubMainPage`, `myClubs`, `allClubs`, `clubTopic`.
- Fixes #<issue-number>

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / chore

## Testing
1. Open **Interest** tab → verify hero + sections.
2. Navigate to **My Clubs** / **All Clubs** → check search & tag filters.
3. Tap a club → enter `clubTopic`, verify sticky header + infinite scroll.
4. Check pull-to-refresh, join/joined toggle.

## Screenshots
(attach key screens: `clubMainPage`, `myClubs`, `allClubs`, `clubTopic`)

## Checklist
- [ ] Navigation works as expected
- [ ] UI matches design basics (spacing, radius, colors)
- [ ] Mock API points clearly marked
- [ ] No console errors/warnings

## Additional Info
- Future: backend integration, caching, likes/posting, detail view.
