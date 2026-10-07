# Adding Content to the AP Gov Study Site

A guide for humans and LLMs. Almost everything is **plain JSON under `data/`**; you rarely touch JavaScript. Read "Rules that break the site" first, then jump to the task you need.

Unit 2 (`data/unit2/`) is the most complete working example. When in doubt, copy its shapes.

---

## Rules that break the site

1. **JSON must be strictly valid.** No comments, no trailing commas. Use curly quotes (`“ ” ’`) inside prose so you don't need to escape `"`; otherwise escape as `\"`.
2. **Every content file must be listed** in its unit's `unit.json` `files` array, or it is silently never loaded.
3. **Paths in `files` are relative to `index.html`**, e.g. `"data/unit2/questions/1.7.json"` (not relative to the unit folder).
4. **Unknown top-level keys throw at load time.** A content file may only contain: `questions`, `drills`, `review`, `glossary`, `reference`, `frame`.
5. **Question `id` must be unique within the unit**, and `g` must be a key in that unit's `groups`. Violations only log a console error; the question is still added, so check the browser console.
6. **Strings are inserted as HTML** (not escaped). Don't put stray `<` or `&` in text; use `&lt;` / `&amp;`. Simple tags like `<b>` work.
7. **No persistence.** The footer tells users nothing is saved. Don't add localStorage without changing that footer copy.
8. **Log every change** in `CHANGELOG.md` (see the last section).

---

## Run and check locally

Content is loaded with `fetch`, so `index.html` won't work via `file://`.

```
python -m http.server
# open http://localhost:8000   (or http://localhost:8000/#unit2 to jump to a unit)
```

Open the browser devtools console. Load errors (bad JSON, 404 on a file, unknown key) and the duplicate-id / unknown-group warnings appear there. There is no test suite, so clicking through is the check.

To validate JSON quickly: `python -c "import json,sys; json.load(open(sys.argv[1], encoding='utf-8'))" data/unit2/questions/1.7.json`

---

## File map

```
data/
  manifest.json                 ["unit1", "unit2"]  ← ordered list of unit ids
  <unit>/
    unit.json                   metadata + groups + files[]
    questions/<group>.json      {"questions": [...]}
    drills.json                 {"drills": {...}}
    review/<topic>.json         {"review": [...]}
    reference.json              {"reference": {...}}
    glossary.json               {"glossary": [...]}
    frame.json                  {"frame": {...}}
```

Only `unit.json` is mandatory in shape; all other files are optional and can be split or combined however you like, since each file just contributes top-level keys. File names are conventions, not requirements.

---

## 1. Add a new unit

1. Copy `data/unit2/` to `data/unit3/` (copy the whole folder).
2. Edit `data/unit3/unit.json`: set `id` (`"unit3"`), `number` (3), `title`, `groups`, and rewrite every path in `files` to `data/unit3/...`.
3. Replace the content in each file (questions, drills, review, reference, glossary, frame). Delete files you don't want and remove them from `files`.
4. Append the id to `data/manifest.json`: `["unit1", "unit2", "unit3"]`.

The header tab, `#unit3` URL, and per-unit progress all appear automatically. **Question ids must be unique within a unit only**, but by convention unit 1 uses 1–99, unit 2 uses 201+; pick a distinct hundreds block (e.g. 301+) for unit 3.

### `unit.json`

```json
{
  "id": "unit3",
  "number": 3,
  "title": "Civil Liberties and Civil Rights",
  "groups": {
    "2.1": { "name": "Bill of Rights Incorporation", "topic": "2.1" },
    "due-process": { "name": "Due Process Clauses", "topic": "2.1" },
    "cases": { "name": "Required Cases", "topic": null }
  },
  "files": [
    "data/unit3/questions/2.1.json",
    "data/unit3/questions/due-process.json",
    "data/unit3/questions/cases.json",
    "data/unit3/review/2.1.json"
  ]
}
```

- **`groups`** is an object keyed by *group key*. A group is one bucket of questions (and what "Practice this topic" runs).
- **`topic`** is the AP topic number as a string (`"1.7"`) or `null`. Several groups can share a topic (e.g. `1.7` and `fiscal` both use topic `1.7`). With a topic, labels read "Topic 1.7 · name"; with `null`, the group is shown by name alone.
- Group keys are usually the topic number (`"1.7"`) or a short slug (`"fiscal"`). Keep them stable; questions and review topics refer to them.

---

## 2. Add questions

### New group
1. Create `data/<unit>/questions/<group>.json`:
   ```json
   { "questions": [ /* question objects */ ] }
   ```
2. Add its path to `files` in `unit.json`.
3. If the group key is new, add it to `groups` (`{name, topic}`).

### Add to an existing group
Append objects to that group's `questions` array. Use the next free `id`.

### Question shape

```json
{
  "id": 215,
  "g": "1.7",
  "topic": "1.7",
  "concept": "Federalist No. 39 · operation on individuals",
  "stim": [
    "“Quoted passage, data, or scenario shown above the question.”"
  ],
  "cite": "James Madison, Federalist No. 39 (1788)",
  "stem": "The question text?",
  "opts": ["Option A", "Option B", "Option C", "Option D"],
  "ans": 1,
  "why": [
    "Why A is wrong (or right).",
    "Why B is right.",
    "Why C is wrong.",
    "Why D is wrong."
  ],
  "note": "Optional 'Worth remembering' takeaway shown after answering."
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Number, unique in the unit. |
| `g` | yes | Group key from `groups`. |
| `topic` | yes | Topic number string, e.g. `"1.7"`. For groups with `topic: null`, use a descriptive string or the group key; it is only displayed when the group has a topic. |
| `concept` | yes | Short label, `"<source or idea> · <specific point>"`. **Drives the weak-area logic**: missing a question marks its concept as weak, and targeted practice serves other questions with the *same concept string*. Reuse an exact existing string to cluster related questions; don't invent near-duplicates. |
| `stim` | yes | Array of strings, one paragraph each. Use `[]` for no stimulus. |
| `cite` | no | Source line under the stimulus. Only shown if `stim` is non-empty. |
| `stem` | yes | The question. |
| `opts` | yes | **Exactly 4** strings. |
| `ans` | yes | 0-based index of the correct option. |
| `why` | yes | **Exactly 4** strings, in the same order as `opts`; explain every option, correct and incorrect. |
| `note` | no | Shown after answering. Use for vocabulary traps or the principle to remember. |

Quality guidance (AP style): plausible distractors that reflect real misconceptions, one clearly best answer, stimulus-based questions where the exam would use them, and a `why` that teaches rather than just says "wrong". Balance correct answers across `ans` values 0–3.

Sets are 15 questions (`SET_SIZE` in `js/views/practice.js`). A group needs at least a handful of questions to be useful; mixed practice draws from all groups in the unit.

---

## 3. Add drills (rapid-fire flashcard-style quizzes)

`data/<unit>/drills.json`:

```json
{
  "drills": {
    "Who Holds the Power?": [
      {
        "q": "Coin money",
        "o": ["National government", "State governments", "Both (concurrent)", "Neither"],
        "a": 0,
        "e": "An enumerated national power. States are expressly forbidden to coin money."
      }
    ],
    "Another Category": [ ]
  }
}
```

- Keys of `drills` are category names shown to the user. Adding a key adds a category.
- Item: `q` prompt, `o` options (4 in the examples; keep every item in a category consistent), `a` 0-based correct index, `e` one-sentence explanation.
- If two files both define the same category name, the later file in `files` **replaces** the earlier one (merge is `Object.assign`, not append). Keep each category in one file.

---

## 4. Add review topics

`data/<unit>/review/<topic>.json`:

```json
{
  "review": [
    {
      "g": "1.7",
      "num": "1.7",
      "name": "Relationship Between the States and National Government",
      "lo": "LO 1.7.A — Explain how …",
      "core": "One-paragraph core idea.",
      "blocks": [
        ["Heading", "Paragraph of notes."],
        ["Another heading", "Another paragraph."]
      ],
      "traps": [
        ["Short title of a common mistake", "Why it's wrong and what's right."]
      ]
    }
  ]
}
```

- `blocks` and `traps` are arrays of `[heading, body]` pairs. The review index shows counts of both.
- `g` is the **group key** that "Practice this topic" runs. It defaults to `num`. Set it explicitly when the topic's group key isn't the topic number (e.g. a topic `1.7` whose group is `"fiscal"` needs its own entry with `"num": "1.7"` and `"g": "fiscal"`; see `data/unit2/review/fiscal.json`).
- Also add the file to `files` in `unit.json`.

---

## 5. Add or edit the quick reference

`data/<unit>/reference.json`. A unit has **one** reference object (a later file replaces an earlier one):

```json
{
  "reference": {
    "title": "Quick reference",
    "lede": "Intro line under the title.",
    "summary": "Short description shown on the Review index card.",
    "sections": [
      {
        "title": "Who holds which powers",
        "kind": "table",
        "cols": ["Type", "Who holds it", "Examples"],
        "rows": [
          ["Enumerated", "National", "Declare war · coin money"]
        ],
        "note": "Optional footnote under the section."
      },
      {
        "title": "Checks and balances",
        "kind": "cards",
        "cols": ["Branch", "Checks on the legislature", "Checks on the executive"],
        "rows": [
          ["Judicial", "Judicial review", "Review executive actions"]
        ]
      }
    ]
  }
}
```

- `kind: "table"`: a standard table; each row has one cell per `cols` entry.
- `kind: "cards"`: one card per row. The first column is the card title, remaining columns become label/value pairs. A cell that is exactly `"—"` is hidden.
- To add a **new kind**, add a renderer to `sectionBody` in `js/views/review.js` (the only code change content work may require).

---

## 6. Add glossary terms

`data/<unit>/glossary.json`: an array of `[term, definition]` pairs. Terms from several files accumulate. The glossary is searchable by the user.

```json
{ "glossary": [ ["Block grant", "Federal money for a broad policy area with minimal restrictions."] ] }
```

---

## 7. Edit the unit overview ("About this unit")

`data/<unit>/frame.json` (one per unit):

```json
{
  "frame": {
    "overview": "Paragraph shown on the Review index.",
    "bigideas": [["Constitutionalism", "Description."]],
    "questions": ["Essential question 1?", "Essential question 2?"],
    "documents": ["Federalist No. 39"],
    "cases": ["McCulloch v. Maryland (1819)"],
    "docnote": "Optional note under the required documents list."
  }
}
```

`cases` and `docnote` are optional. If `cases` is omitted the heading reads "Required documents" instead of "Required documents and cases".

---

## Checklist before you finish

- [ ] Every new file is in `files` in `unit.json` (and new units in `data/manifest.json`).
- [ ] New question `g` values exist in `groups`; ids are unique; `opts` and `why` each have 4 entries; `ans` is 0–3.
- [ ] `concept` strings reuse existing ones where the idea is the same.
- [ ] Each group has a matching review topic if one is wanted (review `g` = group key).
- [ ] Site loads over http with a clean console; click through practice, drill, review, and the reference page for the unit.
- [ ] Appended a dated entry to `CHANGELOG.md`.

## Changelog entry format

Append a new section at the **top** of `CHANGELOG.md` (below the title), newest first, matching the existing style:

```
## 2026-10-06 — Added 12 questions to Unit 2, topic 1.9
- `data/unit2/questions/1.9.json`: ids 270–281, concepts: …
- Added glossary terms: …
```

Describe what was added or changed (questions, drills, review topics, reference tables, UI behavior), not how.

---

## Notes for LLMs

- Read an existing file of the same type (e.g. `data/unit2/questions/1.7.json`) before generating a new one and mirror its voice, length, and field order.
- Find the highest existing `id` in the unit (search `"id":` under `data/<unit>/questions/`) and continue from there; never reuse an id.
- Edit JSON surgically (append to arrays) instead of rewriting whole files, to avoid losing content.
- Do not modify `js/` or `css/` for content tasks, other than a new reference `kind`. If a CSS color token is added, it must be defined in all three blocks of `css/theme.css` (light, `prefers-color-scheme` dark guarded by `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]`).
- Be accurate. These are study materials for an exam; verify facts, case names, dates, and amendment numbers before writing them.
