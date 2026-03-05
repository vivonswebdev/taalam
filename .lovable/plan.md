

## Fix Mushaf page: layout, swipe, BottomNav overlap

### Modifications

**1. `src/App.tsx`** — Hide BottomNav + MiniPlayer on `/mushaf`

Replace the direct `<MiniPlayer />` and `<BottomNav />` with a `ConditionalBottomUI` component that checks `location.pathname` and returns `null` for `/mushaf`.

- Add `useLocation` import
- Create `ConditionalBottomUI` function inside `BrowserRouter` scope
- Replace lines 262-263 with `<ConditionalBottomUI />`

**2. `src/pages/MushafPage.tsx`** — 3 fixes in cards mode (lines 804-1120)

**BUG 1 — Layout**: Change the cards mode root div (line 805) from `min-h-screen pb-24` to a flex column with `height: 100dvh`. Convert the content area (line 1020) to `flex-1 min-h-0 overflow-y-auto`. Convert the two fixed bottom bars (font pills line 1054, nav bar line 1083) from `fixed` positioning to `flex-shrink-0` flow elements at the bottom of the flex column. Add `fillHeight` prop to `DecoratedMushafContent`.

**BUG 2 — Swipe**: Add `touchStartX`/`touchStartY` refs and `handleTouchStart`/`handleTouchMove`/`handleTouchEnd` handlers on the cards mode root div for horizontal swipe navigation between screens/pages.

**BUG 3 — DecoratedMushafContent flex fill**: Add optional `fillHeight?: boolean` prop. When true, outer wrapper gets `height: 100%`, `display: flex`, `flexDirection: column`; inner wrapper gets `flex: 1`, `minHeight: 0`, `overflowY: auto` instead of `minHeight: 50vh`.

### What stays untouched
- Tajwid logic, bookmarks, surah list, settings sheet, immersive mode, fullscreen mushaf mode
- All other files

