# Light Mode Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable a visible theme toggle in the header that switches between dark and light mode, defaulting to dark.

**Architecture:** Unhide existing sun/moon buttons in Header.astro, wire up missing event listeners in Head.astro, add a `updateThemeButtons()` function to sync button visibility with theme state, and change the default from system-preference to dark.

**Tech Stack:** Astro, Tailwind CSS (class-based dark mode), vanilla JS, localStorage

---

### Task 1: Change default theme to dark

**Files:**
- Modify: `src/components/Head.astro:28-30` (inline FOUC script)
- Modify: `src/components/Head.astro:221-236` (`preloadTheme` function)

**Step 1: Update the inline FOUC prevention script**

In `Head.astro` lines 28-30, change:

```javascript
const theme =
  localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
```

To:

```javascript
const theme = localStorage.getItem('theme') || 'dark';
```

**Step 2: Update the `preloadTheme` function**

In `Head.astro` lines 221-237, change:

```javascript
function preloadTheme() {
  const userTheme = localStorage.theme;

  if (userTheme === 'light' || userTheme === 'dark') {
    if (userTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
```

To:

```javascript
function preloadTheme() {
  const userTheme = localStorage.theme;

  if (userTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }
}
```

**Step 3: Verify locally**

Run: `npm run dev`
Expected: Site loads in dark mode by default. No flash of light mode.

**Step 4: Commit**

```bash
git add src/components/Head.astro
git commit -m "feat: default theme to dark mode instead of system preference"
```

---

### Task 2: Unhide theme toggle buttons in Header

**Files:**
- Modify: `src/components/Header.astro:79-128` (theme buttons)

**Step 1: Update light-theme-button**

In `Header.astro` line 83, change:

```html
class="group size-8 flex items-center justify-center rounded-full opacity-40 hidden"
```

To:

```html
class="group size-8 items-center justify-center rounded-full theme-toggle-btn hidden"
```

Notes:
- Remove `opacity-40` (no reason for the sun to be dimmer)
- Remove `flex` (the `hidden` class will be toggled by JS; when visible, JS adds `flex`)
- Add `theme-toggle-btn` marker class for JS targeting
- Keep `hidden` — JS will remove it for the correct button after determining theme

**Step 2: Update dark-theme-button**

In `Header.astro` line 112, change:

```html
class="group size-8 flex items-center justify-center rounded-full hidden"
```

To:

```html
class="group size-8 items-center justify-center rounded-full theme-toggle-btn hidden"
```

Same changes: remove `flex`, add `theme-toggle-btn`, keep `hidden`.

**Step 3: Update the comment**

In `Header.astro` line 79, change:

```html
<!-- Dark and light mode buttons hidden-->
```

To:

```html
<!-- Theme toggle buttons (visibility controlled by JS in Head.astro) -->
```

**Step 4: Verify locally**

Run: `npm run dev`
Expected: Buttons are still hidden (JS hasn't been wired up yet). No layout shift or flash.

**Step 5: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: prepare theme toggle buttons for JS-controlled visibility"
```

---

### Task 3: Wire up button visibility and event listeners

**Files:**
- Modify: `src/components/Head.astro:257-268` (setupEventListeners)
- Modify: `src/components/Head.astro` (add updateThemeButtons function)

**Step 1: Add `updateThemeButtons` function**

In `Head.astro`, after the `preloadTheme` function (after line 237), add:

```javascript
function updateThemeButtons() {
  var isDark = document.documentElement.classList.contains('dark');
  var lightBtn = document.getElementById('light-theme-button');
  var darkBtn = document.getElementById('dark-theme-button');
  if (lightBtn) {
    if (isDark) {
      lightBtn.classList.remove('hidden');
      lightBtn.classList.add('flex');
    } else {
      lightBtn.classList.add('hidden');
      lightBtn.classList.remove('flex');
    }
  }
  if (darkBtn) {
    if (isDark) {
      darkBtn.classList.add('hidden');
      darkBtn.classList.remove('flex');
    } else {
      darkBtn.classList.remove('hidden');
      darkBtn.classList.add('flex');
    }
  }
}
```

Logic: In dark mode, show sun button (to switch to light). In light mode, show moon button (to switch to dark).

**Step 2: Add light-theme-button event listener**

In `Head.astro` `setupEventListeners` function, after the dark-theme-button listener (after line 268), add:

```javascript
var lightThemeButton = document.getElementById('light-theme-button');
lightThemeButton?.addEventListener('click', function() {
  localStorage.setItem('theme', 'light');
  toggleTheme(false);
  updateThemeButtons();
});
```

**Step 3: Update dark-theme-button listener to also update buttons**

Change the existing dark-theme-button listener from:

```javascript
const darkThemeButton = document.getElementById('dark-theme-button');
darkThemeButton?.addEventListener('click', () => {
  localStorage.setItem('theme', 'dark');
  toggleTheme(true);
});
```

To:

```javascript
var darkThemeButton = document.getElementById('dark-theme-button');
darkThemeButton?.addEventListener('click', function() {
  localStorage.setItem('theme', 'dark');
  toggleTheme(true);
  updateThemeButtons();
});
```

**Step 4: Call `updateThemeButtons` in `initFirstLoad`**

In `Head.astro` `initFirstLoad` function (line 239), add `updateThemeButtons()` after `preloadTheme()`:

```javascript
function initFirstLoad() {
  document.documentElement.classList.add('no-entrance-transition');
  preloadTheme();
  updateThemeButtons();
  onScroll();
  // ... rest unchanged
```

**Step 5: Call `updateThemeButtons` at script bottom**

After the existing `preloadTheme();` at line 284, add:

```javascript
preloadTheme();
updateThemeButtons();
```

This ensures buttons are correct even before `astro:page-load` fires.

**Step 6: Verify locally**

Run: `npm run dev`
Expected:
- Dark mode: sun icon visible next to subscribe button, moon hidden
- Click sun: switches to light mode, moon icon appears, sun hides
- Click moon: switches back to dark, sun icon appears
- Refresh: theme persists, correct button shows
- Navigate between pages: correct button shows, no flash

**Step 7: Commit**

```bash
git add src/components/Head.astro
git commit -m "feat: wire up light mode toggle with button visibility sync"
```

---

### Task 4: Verify build and test edge cases

**Step 1: Run production build**

Run: `npx astro build`
Expected: Build completes with no new errors.

**Step 2: Preview production build**

Run: `npm run preview`
Expected:
- Site loads in dark mode by default
- Theme toggle works
- Page transitions preserve theme and button state
- No FOUC on any page

**Step 3: Test edge cases**

- Clear localStorage, reload — should default to dark
- Set localStorage.theme = 'light', reload — should load light with moon icon
- Navigate with ClientRouter — theme and button state preserved
- Hard refresh on light mode — no flash of dark then light

**Step 4: Final commit if any fixes needed**
