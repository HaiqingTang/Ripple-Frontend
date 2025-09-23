# Pull Request Title
> e.g., `feat(Interest): add clubTopic with sticky header & infinite scroll`

## Description
**What & Why**
- What changed and why (motivation/context).
- Link design/spec documents (Figma, etc.).

**Scope**
- Impacted routes/screens:
    - `/app/(tabs)/Interest/clubMainPage`
    - `/app/(tabs)/Interest/myClubs`
    - `/app/(tabs)/Interest/allClubs`
    - `/app/(tabs)/Interest/clubTopic`
    - (If applicable) `_layout.tsx` in `app/(tabs)` or `app/(tabs)/Interest`

**Navigation**
- expo-router structure checked:
    - Correct folder names and `_layout.tsx` placement.
    - `Tabs.Screen` names match folder names (e.g., `Interest`, not `Interest/index`).

**Fixes**
- Fixes #<issue-number>

---

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Refactor (no behavior change)
- [ ] Performance
- [ ] UI polish / design parity
- [ ] Documentation
- [ ] Chore (build, tooling, CI)

---

## Implementation Notes
**Data Layer**
- [ ] Still using **mock data** (backend placeholders exist, no real requests)
- [ ] Backend swap points are clearly marked (e.g., `fetchMyClubsFromAPI`, `fetchAllClubsFromAPI`, `fetchPosts`, `fetchClub`)
- [ ] Mocked delay/pagination (e.g., `PAGE_SIZE = 5`, incremental append on scroll)

**Navigation**
- [ ] All navigation works:
    - `clubMainPage → myClubs / allClubs`
    - `myClubs / allClubs → clubTopic?id=<id>&name=<name>`
- [ ] Uses `router.push({...})` or `<Link asChild>` for Pressable
- [ ] `stickyHeaderIndices={[0]}` used to pin the blue header in `clubTopic`

**UI & Layout**
- [ ] Visual parity with design (type scale, spacing, radius, background)
- [ ] Fixed sizes for horizontal lists and grid items to avoid “drifting”
- [ ] Loading / error / empty states (`Loading…`, `Failed to load`, `No results`)
- [ ] Small-screen handling / overflow checks

**Error & Edge Cases**
- [ ] No real network calls without backend; no “Network request failed” warnings
- [ ] Graceful handling for empty search, no results, end of pagination
- [ ] Button disabled states where appropriate (e.g., `Join` ↔ `Joined`)

**Accessibility**
- [ ] `accessibilityRole`, `hitSlop` on tappables
- [ ] Contrast/readability verified
- [ ] Clear action labels (“View post”, “Write”)

---

## How Has This Been Tested?
**Manual QA Steps**
1. Open **Interest** tab → `clubMainPage`: verify search, hero, and sections.
2. Tap **All Clubs / View More** → navigates to `/Interest/allClubs`.
3. In **allClubs**:
    - Type in search, verify grid filters.
    - Tap any **tag** (Arts/Sports/etc.) → navigates to `clubTopic` with tag as name.
    - Tap any **club card** → navigates to `clubTopic` with club name.
4. In **myClubs**: tap any club → navigates to `clubTopic`.
5. In **clubTopic**:
    - Blue info section stays **sticky**.
    - Pull-to-refresh works.
    - Infinite scroll (page size = 5) appends items.
    - `Join/Joined` toggles.
    - “View post” / “Write” mock actions work.

**Platforms**
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Device (optional)

**Build/Run**
- [ ] `npx expo start -c` works locally
- [ ] No red/yellow Metro warnings
- [ ] TypeScript passes (`tsc --noEmit`)
- [ ] Lint passes (`eslint .`)

**Automated (optional)**
- [ ] Unit tests (Jest)
- [ ] Component snapshots
- [ ] E2E (Detox)

---

## Screenshots / Recording
Please attach key screens (before/after if applicable):
- [ ] `clubMainPage`
- [ ] `myClubs` (3-column grid + search)
- [ ] `allClubs` (tags + search + grid)
- [ ] `clubTopic` (sticky header + infinite scroll)

---

## Dependencies
- Depends on PR: #
- Blocks PR: #

**Config/Env**
- [ ] No new `.env` variables
- [ ] If added, document them in README / env template

---

## Risk & Rollback
- **Risks**: navigation regressions, list performance, Android shadow differences
- **Rollback**: revert this PR; keep previous mock-only version as fallback

---

## Checklist for Reviewers
- [ ] File structure and expo-router paths are correct (`_layout.tsx` hierarchy)
- [ ] Reasonable component split; no obvious duplication (shared SectionHeader/cards?)
- [ ] No hardcoded backend hosts; clear separation between mock and real API
- [ ] No event conflicts with `Pressable` vs `Link asChild`
- [ ] Stable `keyExtractor` usage; reasonable `onEndReachedThreshold`
- [ ] Style naming/spacing/color consistency; minimize magic numbers (extract constants)
- [ ] No noisy logs (`console.log`) or unhandled promises
- [ ] Image/icon safety (placeholders/fallbacks)

---

## Request for Specific Feedback
- Areas needing special attention (e.g., pagination implementation, sticky header technique, nav paths, style organization)

---

## Additional Information
- Related docs/links (designs, requirements, integration plans, milestones)
- Future work (backend integration, caching, likes/posting, detail view)