
Goal
- Make both footer actions (Moon theme toggle + Sign Out) always visible when the sidebar is collapsed, without overlap or clipping.

What I found in current code
- `AppSidebar` collapsed footer currently stacks both buttons vertically and each button uses `flex-1` + `w-full`.
- In collapsed mode (4rem width), this layout is fragile and can hide/clip one action depending on viewport height and sidebar content pressure.
- `SidebarContent` already handles shrinking and clipping behavior in collapsed mode, so footer controls must be made explicitly fixed-size and non-growing.

Implementation plan
1) Refactor collapsed footer actions into explicit icon buttons
- In `src/components/AppSidebar.tsx`, replace the collapsed button layout with fixed-size icon buttons (`h-8 w-8`, `shrink-0`) for both actions.
- Remove `flex-1` behavior in collapsed mode so neither button competes for space.

2) Use a collapsed-only action row/stack designed for visibility
- Keep expanded mode unchanged (text labels remain).
- For collapsed mode, render a compact container with deterministic spacing (`gap-1.5`) and centered alignment so both icons are always present.
- Ensure both controls retain `title` tooltips for clarity.

3) Lock footer sizing behavior
- Keep footer as non-shrinking and bottom-anchored.
- Add `overflow-visible` and `items-center` safeguards on collapsed footer action wrapper so buttons cannot be clipped by container rules.

4) Keep interaction parity
- Moon button continues to toggle the same dark/gold classes.
- Sign Out button continues to call `onLogout` exactly as now.

Technical details
- File: `src/components/AppSidebar.tsx`
- Primary change area: footer action block near current lines ~347–381.
- Class strategy:
  - Expanded: preserve current full-width button styles with labels.
  - Collapsed: switch to icon-only variants (`size="icon"` or explicit `h-8 w-8`), no `flex-1`, no full-width stretching.
- No route/layout logic changes needed in `FinanceLayout.tsx`.

Validation checklist
- Collapse sidebar on desktop: Moon and Sign Out icons both visible at once.
- Resize to shorter desktop heights: both icons remain visible and clickable.
- Expanded sidebar still shows “Black & Gold” and “Sign Out” labels.
- No content overlap with main platform area.
