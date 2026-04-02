# Bun Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace npm + Node with Bun as both the package manager and JS runtime, and configure Vercel to use Bun.

**Architecture:** Delete the unused `astro-app/` directory, replace `package-lock.json` with `bun.lockb`, pin the Bun version in `package.json`, and update `.gitignore`. No application source changes.

**Tech Stack:** Bun 1.x, Astro 5, Vercel

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `astro-app/` | Delete | Unused subdirectory, already gitignored |
| `package-lock.json` | Delete | Replaced by `bun.lockb` |
| `package.json` | Modify | Add `"packageManager"` field |
| `.gitignore` | Modify | Ignore `package-lock.json`, track `bun.lockb` |
| `bun.lockb` | Create (via bun install) | Bun lockfile |

---

### Task 1: Clean up unused files

**Files:**
- Delete: `astro-app/` (local only — already in `.gitignore`)
- Delete: `package-lock.json`

- [ ] **Step 1: Delete `astro-app/` directory**

```bash
rm -rf astro-app/
```

Expected: no output, directory gone.

- [ ] **Step 2: Delete `package-lock.json`**

```bash
rm package-lock.json
```

Expected: no output, file gone.

- [ ] **Step 3: Verify**

```bash
ls astro-app 2>&1; ls package-lock.json 2>&1
```

Expected: two "No such file or directory" errors — both are gone.

---

### Task 2: Update `package.json` and `.gitignore`

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Get your installed Bun version**

```bash
bun --version
```

Note the output (e.g. `1.2.5`). You'll use this in the next step.

- [ ] **Step 2: Add `packageManager` field to `package.json`**

Open `package.json` and add the `"packageManager"` field after `"version"`, substituting your actual Bun version from Step 1:

```json
{
  "name": "astro-nano",
  "type": "module",
  "version": "1.0.0",
  "packageManager": "bun@1.2.5",
  ...
}
```

- [ ] **Step 3: Update `.gitignore`**

Add `package-lock.json` to the dependencies section, and remove `astro-app/` (it's being deleted — no need to keep ignoring it). The dependencies section should look like:

```gitignore
# dependencies
node_modules/
package-lock.json
```

And remove this line from the macOS section:
```
astro-app/
```

---

### Task 3: Install with Bun

**Files:**
- Create: `bun.lockb` (generated)

- [ ] **Step 1: Run `bun install`**

```bash
bun install
```

Expected output: lines like `bun install v1.x.x`, package count, and `Done in Xs`. A `bun.lockb` file will be created.

- [ ] **Step 2: Verify `bun.lockb` was created**

```bash
ls -lh bun.lockb
```

Expected: file exists with a non-zero size.

- [ ] **Step 3: Verify `node_modules` looks healthy**

```bash
ls node_modules/.bin/astro
```

Expected: path prints without error.

---

### Task 4: Verify the project builds

- [ ] **Step 1: Run dev to confirm startup works**

```bash
bun run dev
```

Expected: Astro dev server starts, prints a local URL (e.g. `http://localhost:4321`). Hit Ctrl+C once confirmed.

- [ ] **Step 2: Run the build**

```bash
bun run build
```

Expected: `astro check` passes, `astro build` completes, `dist/` directory is populated.

- [ ] **Step 3: If `sharp` fails** (optional — only if build errors mention sharp)

```bash
bun add sharp --optional
bun run build
```

---

### Task 5: Commit

- [ ] **Step 1: Stage files**

```bash
git add package.json .gitignore bun.lockb
git status
```

Expected: shows `package.json` and `.gitignore` as modified, `bun.lockb` as new file, `package-lock.json` as deleted.

- [ ] **Step 2: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore: migrate from npm to Bun

- Replace package-lock.json with bun.lockb
- Add packageManager field for Vercel Bun detection
- Remove unused astro-app/ subdirectory

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Verify Vercel deployment

Vercel detects Bun via the `"packageManager"` field in `package.json` — no dashboard changes needed.

- [ ] **Step 1: Push the branch**

```bash
git push
```

- [ ] **Step 2: Check Vercel build logs**

In the Vercel dashboard, open the triggered deployment and confirm the build log shows Bun being used (e.g. `bun install` instead of `npm install`).

- [ ] **Step 3: If Vercel still uses npm** (fallback)

Add an override in `vercel.json`:

```json
{
  "redirects": [
    { "source": "/rss", "destination": "/rss.xml", "permanent": true }
  ],
  "installCommand": "bun install",
  "buildCommand": "bun run build"
}
```

Then commit and push again.
