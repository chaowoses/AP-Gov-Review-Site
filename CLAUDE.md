# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A no-build static study site for AP U.S. Government. There is no package.json, bundler, linter, or test suite, and the directory is not a git repo. The only external dependency is Google Fonts. It is meant to be hosted as a static site (Netlify). Content is fetched as JSON, so serve the folder over http for local work (`python -m http.server`, then open http://localhost:8000); opening `index.html` directly will not load content. Netlify needs no setup.

## Layout

- `index.html`: shell + ordered `<script>`/`<link>` tags.
- `css/`: `theme.css` (tokens), `base.css`, `components.css`, and one file per view.
- `js/core/`: `registry.js` (units, content merging, group labels), `util.js`, `components.js` (`A.ui` HTML builders), `sets.js` (pure practice-set logic), `views.js` (view/action registry), `loader.js` (fetches the manifest, units and their JSON files).
- `js/views/`: `practice.js`, `drill.js`, `review.js`. Each registers `{id, label, render(unit), actions, enter?(unit), afterRender?(root, unit)}`. View state is kept per unit via `A.util.unitState`, so switching units preserves each unit's progress.
- `js/app.js`: unit tabs (also `#<unit id>` in the URL) and view nav, delegated click dispatch, render loop, boot.
- `data/manifest.json`: list of unit ids. `data/<unit>/unit.json`: unit metadata (`id`, `number`, `title`, `groups`) and `files`, the content JSON files to load. Every other file under `data/<unit>/` is plain JSON whose top-level keys are content keys (below).

## Adding content

- **New question set:** create `data/<unit>/questions/<group>.json` containing `{"questions":[...]}`, add its path to `files` in `unit.json`, and (if it is a new group) add it to `groups` as `{name, topic}`; `topic` is the topic number it belongs to (e.g. "1.7") or `null`. Several groups may share a topic. Question `id` must be unique within the unit and `g` must be a key in `groups`.
- **New unit:** copy `data/unit1/` to `data/unit2/`, change the ids and content, and append `"unit2"` to `data/manifest.json`. It gets a header tab automatically. Unit 2 (`data/unit2/`) is a complete example.
- Content keys a file may provide: `questions`, `drills` (category -> `[{q, o, a, e}]`), `review` (topics `{num, name, lo, core, blocks, traps, g?}`; `g` is the group key the topic opens/practices and defaults to `num`), `glossary` (`[[term, def]]`), `reference` (`{title, lede, summary, sections:[{title, kind:"table"|"cards", cols, rows, note?}]}`), `frame` (`{overview, bigideas, questions, documents, cases?, docnote?}`, shown as the "About this unit" panel on the Review index). To support a new reference `kind`, add a renderer to `sectionBody` in `js/views/review.js`. Unknown keys throw at load time.

## Architecture

**Question shape:** `{id, g, topic, concept, stim[], cite, stem, opts[4], ans (index), why[4] (per-option explanation), note}`. `concept` drives the "targeted practice" weak-area logic. The registry adds `uid` (`<unit>:<id>`), which the `seen` pool uses.

**UI model.** No framework. Markup carries `data-action="<view>.<name>"` (+ `data-arg`); `app.js` dispatches to that view action as `fn(arg, unit)` and then re-renders once, so actions never call render. Cross-view navigation is the `app.go` action (user navigation, calls the target view's `enter`) or `A.app.show(id)` (switch only, no reset). There are no inline handlers or global functions.

**Practice-set logic** lives in `js/core/sets.js` as pure functions: `mixed` round-robins across groups preferring unseen questions, `forGroup` serves one group, `weak` builds a targeted set (missed concepts, then same groups, then resets `seen`). `SET_SIZE` (15) is in `js/views/practice.js`.

**No persistence by design.** The footer promises that nothing is saved. State lives only in memory, so don't add localStorage without also changing that footer copy.

**Theming.** CSS custom properties in `css/theme.css`, with dark values defined twice: once under `prefers-color-scheme` (guarded by `:root:not([data-theme="light"])`) and once under `:root[data-theme="dark"]`. Any new color token has to be added to all three blocks.

## Change log

Keep a separate file, `CHANGELOG.md`, that logs whatever is added to the project. Whenever you add or change content or features (questions, drills, review topics, reference tables, UI behavior), append a dated entry to it describing what was added. Create the file if it doesn't exist yet.
