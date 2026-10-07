# Changelog

## 2026-10-06 — UI redesign, responsive layout, faster practice flow
- **Look:** all CSS rewritten on one spacing rhythm and two radii (`--r`, `--r-sm`). Cream paper, dark-brown ink and gold accent (light); warm espresso with bright gold (dark). Flat cards with 1px borders, no shadows, gradients or animations. Primary buttons are solid brown. Fonts: Bricolage Grotesque (headings/stems), Figtree (UI), Source Serif 4 (reading text).
- **Responsive:** all sizes in `rem` with a fluid `html` font-size (`clamp(16px … 20px)`); container is a 78rem max-width with fluid gutters (`--wrap`, `--gutter`, `--measure`, `--tap` in `base.css`). Practice, review and drill lists are auto-fill grids (1 column on phones, 2–3 wider); practice questions split into passage/options columns at ≥64rem with a sticky passage. 48px minimum touch targets. Verified no horizontal overflow at 320, 375, 768 and 1920px.
- **Navigation:** unit picker is a flat text trigger ("Unit N · Title") in the same row as the Practice/Drill/Review tabs, with a menu that closes on pick, outside click or Escape. Scales to any number of units.
- **Practice/Drill flow:** Next / See results sits in a docked bottom bar (with "Correct" / "Not quite") and the page is padded so nothing hides behind it. Keyboard shortcuts: A–D or 1–4 answer, Enter or → advances. Picking an answer no longer scrolls to the top. Practice has "← All practice sets" to leave a set mid-way, and questions count as "used" only when answered.
- **Answer feedback:** the chosen wrong option gets a thick red border, a ✕ badge and an "Incorrect — your answer" label; the right option gets a ✓ badge; other options dim. Text glyphs were replaced by inline Tabler SVG icons (`A.ui.icon`, styled by `.icon`).
- **Shuffling:** options (with their explanations and answer index) are shuffled in every practice question and drill card; drill cards are served in random order, reshuffled each time a category is picked.
- **Drill:** "Question n of N" and "Streak" sit together at the left.
- **Fixes:** buttons and unit-menu rows have their content vertically centered with tighter line-height, so no extra space appears under shorter text.

## 2026-10-06 — Split the single-file app into an extensible multi-file structure
- `index.html` is now a thin shell; CSS moved to `css/` (theme, base, components, practice, drill, review) and JS to `js/`.
- Engine split by responsibility: `js/core/` (unit registry, loader, utils, HTML components, pure set-building, view registry), `js/views/` (practice, drill, review), `js/app.js` (shell, dispatch, boot).
- Content moved to `data/<unit>/`: one file per question group (`questions/1.1.js` …), plus `drills.js`, `review/<topic>.js`, `reference.js`, `glossary.js`, `frame.js` (unused by any view), all listed in `data/unit1/unit.js`. Units are registered in `data/manifest.js`.
- Added multi-unit support: a unit selector appears in the header once more than one unit is registered.
- Replaced inline `onclick` handlers and global functions with `data-action` attributes and one delegated click handler.
- Reference tables are now data-driven (`reference.sections[]` with `kind` `table` or `cards`).
- Group labelling no longer relies on a `/^1\./` regex; groups declare `numbered: true/false`.
- Fixed: "Practice this topic" on a review page used to land on the practice home screen instead of starting the set.
- Everything under `data/` is `.json` (no `APGov.content(...)` wrapper): `manifest.json`, `unit1/unit.json`, questions, drills, review, reference, glossary, frame.
- `js/core/loader.js` fetches the JSON instead of injecting script tags; the site now needs to be served over http locally (`python -m http.server`). Netlify is unaffected.
- A load failure on `file://` now shows a hint about serving over http.