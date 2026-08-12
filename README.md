# KX Analyst Orbit — Interactive Presentation

An interactive, animated, browser-based slide deck built with plain HTML, CSS, and JavaScript — no build tools, no frameworks, no dependencies to install. Open `index.html` in any browser and it runs.

## What's in here

- **`index.html`** — all slide content and structure
- **`style.css`** — visual styling, colors, layout, animations
- **`script.js`** — slide navigation, animation logic, and the tool-detail modal system

## Features

- Click-through slide navigation (arrow keys, on-screen buttons, or clicking timeline/workflow steps directly)
- Several slides have their own interactive animations (a "Play" button that runs a short animated sequence) rather than static content
- Clickable tool badges throughout the deck open a modal with a description and a small animated demo of that tool
- A presenter-notes sidebar with suggested talking points and rough timing per slide
- A screenshot-attachment feature per slide, so real product screenshots can be dropped in over time (saved in the browser's local storage)
- Presentation Mode / fullscreen toggle for actually presenting

## Updating ticket / status slides for future work

The ticket-resolved slides are built as repeatable "cards" — adding a new ticket, or updating an old team's status, doesn't require touching any JavaScript or CSS, only `index.html`.

**To add a new ticket to an existing person's slide:**

Find their slide (search `index.html` for their name, e.g. `Tickets Resolved — <span class="presenter-name-tag">`), then copy an existing `.ticket-card` block and edit it:

```html
<div class="ticket-card">
  <div class="ticket-card-header">
    <div class="ticket-id-title">
      <span class="ticket-id-badge">TICKET-ID</span>
      <span class="ticket-title">Short description of what it was</span>
    </div>
    <div style="display:flex;gap:6px;align-items:center;">
      <span class="priority-badge medium">🟡 Medium</span>
      <span class="ticket-status-badge resolved">✅ Resolved &amp; Approved</span>
    </div>
  </div>
  <div class="ticket-date-line">Start date – End date</div>
  <ul class="ticket-list">
    <li>What the problem was</li>
    <li>What you actually did about it</li>
  </ul>
</div>
```

**Status badge options** (`.ticket-status-badge` class, plus one of these):
- `resolved` → ✅ green
- `open` → 🔶 amber (use for "MR open", "awaiting approval", etc. — write the actual text inside the span)
- `paused` → ⏸ red

**Priority badge options** (`.priority-badge` class, plus one of these):
`high`, `medium-high`, `medium`, `low-medium`, `low` — each has its own color, from red (high) to green (low).

**To add a brand new person's ticket slide:**

Copy an entire `<div class="slide" data-slide-id="slide-N">...</div>` block for an existing ticket slide, rename the person, replace the ticket cards, and:
1. Renumber every subsequent slide's `data-slide-id` and its "Click or drop image for Slide N" text, so numbering stays sequential
2. Update `totalSlides` in `script.js`
3. Add one more entry to the `SPEAKER_NOTES` array in `script.js`, in the matching position
4. If you want the cards to animate in on entry, add a matching `else if (index === N)` block in the `onSlideEnter` function in `script.js` (copy the pattern from an existing ticket slide's block — animates `.ticket-card` elements with a staggered delay)

This is the one part that involves touching JavaScript — everything else (adding/editing tickets, changing dates, changing status) only touches `index.html`.

## Deploying from VS Code (repo already created on GitHub)

You said you've already created the empty repo on GitHub — here's the full path from a blank VS Code window to a live site.

**1. Clone the empty repo**
- Open VS Code
- Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- Type **"Git: Clone"**, select it
- Paste your repo's URL (from the green "Code" button on GitHub — copy the HTTPS link)
- Choose a folder on your machine to clone into
- When prompted, click **"Open"** to open the cloned (currently empty) folder in VS Code

**2. Add the presentation files**
- Copy `index.html`, `style.css`, and `script.js` (and this `README.md`) into that cloned folder — either drag them into VS Code's file explorer panel, or copy them in via your OS file manager
- They should sit directly in the root of the folder, not in a subfolder

**3. Commit the files**
- Click the **Source Control** icon in the left sidebar (looks like a branching icon)
- You'll see all 4 files listed as changes
- Type a commit message, e.g. `Add KX Analyst Orbit presentation`
- Click the **✓ Commit** button (or `Ctrl+Enter`)

**4. Push to GitHub**
- Click **"Sync Changes"** (or **"Push"**) in the Source Control panel — VS Code will prompt you to sign in to GitHub the first time if you haven't already
- Once it finishes, refresh your repo page on GitHub — the files should now be there

**5. Enable GitHub Pages**
- On GitHub.com, go to your repo → **Settings → Pages**
- Under "Build and deployment" → Source: select **"Deploy from a branch"**
- Branch: `main`, folder: `/ (root)` → **Save**
- Wait about a minute, then your live URL will appear at the top of that same Pages settings page — typically `https://<your-username>.github.io/<repo-name>/`

**From then on**, any time you edit the files in VS Code:
1. Save the file
2. Source Control panel → commit → push
3. GitHub Pages automatically redeploys within a minute or two — no extra steps needed

## Notes

- No build step, no `npm install`, no dependencies — this is intentional, so it stays simple to edit and deploy
- The only external resource is a Google Fonts link in `index.html` — this requires the viewer to have internet access, same as any normal website
- Screenshots attached via the "📷 Attach Slide Screenshot" buttons are saved in the browser's local storage, per-browser — they won't automatically appear for someone else opening the same live URL on a different computer
