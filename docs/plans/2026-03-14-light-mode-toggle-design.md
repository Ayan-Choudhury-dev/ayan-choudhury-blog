# Light Mode Toggle — Design

## Summary

Unhide and complete the existing theme toggle buttons in the header to allow users to switch between dark and light mode. Default to dark mode for first-time visitors.

## Approach

Use the existing hidden `#light-theme-button` (sun icon) and `#dark-theme-button` (moon icon) in Header.astro. The infrastructure for class-based dark mode, CSS variables, localStorage persistence, and FOUC prevention already exists — this work completes it.

## Requirements

- Single icon button next to the RSS subscribe button
- Shows sun icon in dark mode (click to go light), moon icon in light mode (click to go dark)
- Default to dark mode when no localStorage value exists
- Persist user choice across sessions via localStorage
- No FOUC on page load or ClientRouter navigation
- Smooth icon swap without layout shift

## Changes

### 1. Head.astro — Inline theme script (FOUC prevention)

Change the default fallback from system preference to `'dark'`:

```javascript
// Before
const theme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// After
const theme = localStorage.getItem('theme') || 'dark';
```

### 2. Header.astro — Unhide toggle buttons

Remove `hidden` class from both theme buttons. Add a shared CSS approach so buttons start invisible (prevent flash) and JS reveals the correct one.

### 3. Head.astro — Add light button event listener

Wire up `#light-theme-button` to set `localStorage.theme = 'light'` and call `toggleTheme(false)`.

### 4. Head.astro — Button visibility function

Create a function that shows/hides the correct button based on current theme. Call it:
- On initial page load
- After every theme toggle
- During `astro:after-swap` for ClientRouter transitions

### 5. Head.astro — astro:before-swap

Existing hook carries over the dark class. No changes needed here — button visibility is handled by astro:after-swap since the new page's DOM needs to be ready.

## Risk Mitigation

- **FOUC**: Inline script runs before paint, default change is in that script
- **Button flash**: Buttons start hidden via CSS, revealed by JS after theme is determined
- **ClientRouter**: before-swap carries theme class, after-swap updates button visibility

## Files Modified

- `src/components/Head.astro`
- `src/components/Header.astro`
