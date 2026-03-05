

## Diagnostic Summary

After testing the Mushaf page in the browser, the zoom buttons (S/M/L/XL/XXL) **do work** in both cards mode (via settings sheet) and fullscreen mode (inline buttons). However, there are several UX issues that could cause the "buttons don't work" perception:

### Problems Identified

1. **Cards mode**: Font size buttons are buried inside the settings sheet (gear icon). Not discoverable.
2. **Fullscreen mode**: Font buttons only visible when "chrome" overlay is showing. Tapping the screen hides the chrome, and users may not know to tap again to bring it back.
3. **Possible stale state**: The `versioning.ts` RESET_KEYS includes `mushaf_font_size`, which may be resetting the user's zoom preference on every deploy, making it seem like changes don't persist.
4. **Bottom navigation overlap**: The font size buttons at the very bottom of the fullscreen mode could be overlapped by the system bottom nav on some devices.

### Plan

1. **Add inline font size buttons to cards mode** - Place S/M/L/XL/XXL buttons directly in the bottom navigation bar (next to page arrows) so they're always accessible without opening settings.

2. **Make chrome always-visible in fullscreen mode** - Instead of hiding/showing the chrome on tap, keep the font size buttons always visible at the bottom with a semi-transparent background. Only hide the top header on tap.

3. **Add pinch-to-zoom gesture** as an alternative to buttons (using a simple touch handler that cycles through presets).

4. **Remove `mushaf_font_size` from RESET_KEYS** in `versioning.ts` so user's zoom preference persists across deploys.

### Files to Modify

- **`src/pages/MushafPage.tsx`**:
  - Cards mode: Add compact font size selector pills to the fixed bottom navigation bar (line ~1053-1087)
  - Fullscreen mode: Keep font size buttons always visible (not tied to `chromeVisible` state), or make them part of a persistent mini-bar
  
- **`src/config/versioning.ts`**:
  - Remove `mushaf_font_size` from `RESET_KEYS` array to preserve user's zoom preference

