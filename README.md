# AP U.S. Government Study Site

A study site for AP U.S. Government with three tools for each unit:

- **Practice**: AP-style multiple-choice sets (mixed, by topic, or targeted at weak concepts).
- **Drill**: rapid-fire flashcard-style quizzes.
- **Review**: topic notes, common traps, a quick-reference page, a searchable glossary, and a unit overview.

Nothing is saved. Progress lives only in the browser tab and resets on refresh.

**Live site:** _paste the GitHub Pages URL here_

---

## How it works

The site is plain HTML, CSS and JavaScript with no build step. All of the content (questions, drills, notes, glossary) is stored as JSON files in the `data/` folder, so you can update the content without touching any code.

```
index.html          the page
css/                styling
js/                 the site's code (you shouldn't need to edit this)
data/
  manifest.json     list of units, e.g. ["unit1", "unit2"]
  unit1/, unit2/    one folder per unit
    unit.json       unit title, topic groups, and the list of content files
    questions/      practice questions
    review/         review notes
    drills.json, reference.json, glossary.json, frame.json
ADDING_CONTENT.md   the full guide to editing content
```

---

## Testing a change

The site is published with GitHub Pages, so every change you commit to the `main` branch goes live automatically.

1. Open the file on GitHub, click the pencil icon, make your edit, and click **Commit changes**.
2. Wait about a minute for the site to rebuild.
3. Open the live site and do a hard refresh (**Ctrl+Shift+R**, or **Cmd+Shift+R** on Mac). GitHub caches pages for a few minutes, so an ordinary refresh may show the old version.
4. Click through the part you changed. Check a unit's Practice, Drill and Review views.

---

## Editing content

**[ADDING_CONTENT.md](ADDING_CONTENT.md)** has the exact format for every kind of content: questions, drills, review topics, the reference page, the glossary, and new units. The easiest way to add something is to copy an existing entry and change the text. You can also give that file to an AI assistant and ask it to write new questions in the same format. Review its work for accuracy before you publish.

Three mistakes cause most problems:

1. **Invalid JSON.** A missing quote, an extra comma after the last item, or a stray `"` inside text will break the site. Use curly quotes (`“ ”`) inside question text to avoid escaping.
2. **A new file that isn't listed.** If you create a new content file, add its path to the `files` list in that unit's `unit.json`. Otherwise it is silently ignored.
3. **A question with the wrong shape.** Each question needs exactly 4 answer options and exactly 4 explanations, and `ans` is the position of the right answer, counting from 0.

**If the site is blank or something is missing:** press **F12**, open the **Console** tab, and read the red error. It names the file that has the problem.

---

## Running it on your own computer (optional)

You can't just double-click `index.html`, because browsers block the page from loading its JSON files that way. Start a small local server instead:

```
python -m http.server
```

Then open <http://localhost:8000>. (Or use the **Live Server** extension in VS Code.) Add `#unit2` to the address to jump to a unit.
