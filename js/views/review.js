/* Review view: topic notes, quick-reference tables, searchable glossary.
   `open` is null (index), "ref", "gloss", or a topic's group key (g). */
(function (A) {
  const { btn, backlink, table, empty } = A.ui;

  const S = A.util.unitState(() => ({ open: null, query: "" }));

  const actions = {
    open(target, u) { Object.assign(S(u), { open: target || null, query: "" }); },
    practiceTopic(g, u) { A.actions["practice.startGroup"](g, u); A.app.show("practice"); },
  };

  // Reference sections render by `kind`, so a unit can add a new table without touching this file.
  const sectionBody = {
    table,
    cards: ({ cols, rows }) => rows.map(r => `<div class="branch"><h4>${r[0]}</h4><dl>
      ${cols.slice(1).map((c, i) => (r[i + 1] === "—" ? "" : `<dt>${c}</dt><dd>${r[i + 1]}</dd>`)).join("")}
    </dl></div>`).join(""),
  };

  const back = () => backlink("All review topics", "review.open");

  function glossaryList(u, query) {
    const t = query.trim().toLowerCase();
    const hits = u.glossary.filter(([term, def]) => !t || term.toLowerCase().includes(t) || def.toLowerCase().includes(t));
    return hits.length
      ? hits.map(([term, def]) => `<div class="gterm"><b>${term}</b><span>${def}</span></div>`).join("")
      : empty("No term matches that. Try a shorter word.");
  }

  // "About this unit": big ideas, essential questions, required documents (unit.frame).
  function about(f) {
    if (!f) return "";
    const list = items => `<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`;
    return `<details class="about"><summary>About this unit</summary>
      <h4>BIG IDEAS</h4><ul>${f.bigideas.map(([n, t]) => `<li><b>${n}.</b> ${t}</li>`).join("")}</ul>
      <h4>ESSENTIAL QUESTIONS</h4>${list(f.questions)}
      <h4>${f.cases ? "REQUIRED DOCUMENTS AND CASES" : "REQUIRED DOCUMENTS"}</h4>${list([...(f.documents || []), ...(f.cases || [])])}
      ${f.docnote ? `<p class="hint">${f.docnote}</p>` : ""}</details>`;
  }

  function index(u) {
    const topics = u.review.map(t => btn(`${t.num} · ${t.name}`, {
      action: "review.open", arg: t.g, sub: `${t.blocks.length} sections · ${t.traps.length} common mistakes`,
    })).join("");
    const ref = u.reference ? btn(u.reference.title, { action: "review.open", arg: "ref", sub: u.reference.summary }) : "";
    const gloss = u.glossary.length ? btn("Glossary", { action: "review.open", arg: "gloss", sub: `${u.glossary.length} terms, searchable` }) : "";
    return `<h1>Review</h1>
      <p class="lede">${u.frame?.overview || "Short sections — about a screen each. Read the one you are shaky on, then go practice it."}</p>
      ${about(u.frame)}
      <div class="stack">${topics}${ref}${gloss}</div>`;
  }

  function reference(u) {
    const r = u.reference;
    const sections = r.sections.map(s =>
      `<h2>${s.title}</h2>${sectionBody[s.kind](s)}${s.note ? `<p class="tnote">${s.note}</p>` : ""}`).join("");
    return `${back()}<h1>${r.title}</h1><p class="lede">${r.lede}</p>${sections}`;
  }

  function glossary(u, query) {
    return `${back()}<h1>Glossary</h1>
      <p class="lede">${u.glossary.length} terms. Start typing to narrow the list.</p>
      <input id="gsearch" class="search" type="search" placeholder="Search terms and definitions" autocomplete="off">
      <div id="glist">${glossaryList(u, query)}</div>`;
  }

  function topic(u, t) {
    const blocks = t.blocks.map(([h, b]) => `<h3>${h}</h3><p>${b}</p>`).join("");
    const traps = t.traps.map(([h, b]) => `<p class="trap"><b>${h}.</b> ${b}</p>`).join("");
    const nxt = u.review[u.review.findIndex(x => x.g === t.g) + 1];
    const after = nxt ? btn(`Keep reading — ${nxt.num} · ${nxt.name}`, { action: "review.open", arg: nxt.g })
      : u.reference ? btn(`Keep reading — ${u.reference.title}`, { action: "review.open", arg: "ref" }) : "";
    const count = u.questions.filter(q => q.g === t.g).length;
    return `${back()}<h1>${t.num} · ${t.name}</h1><p class="tagline">${t.lo}</p><p>${t.core}</p>
      ${blocks}<h3>Where students lose points</h3>${traps}
      <div class="stack">
        ${btn("Practice this topic", { action: "review.practiceTopic", arg: t.g, primary: true, sub: `${count} questions` })}${after}</div>`;
  }

  A.registerView({
    id: "review",
    label: "Review",
    actions,
    enter(u) { S(u).open = null; },
    render(u) {
      const { open, query } = S(u);
      if (open === null) return index(u);
      if (open === "ref" && u.reference) return reference(u);
      if (open === "gloss") return glossary(u, query);
      const t = u.review.find(x => x.g === open);
      return t ? topic(u, t) : index(u);
    },
    afterRender(root, u) {
      const input = root.querySelector("#gsearch");
      if (!input) return;
      const s = S(u);
      input.value = s.query;
      input.oninput = e => { s.query = e.target.value; root.querySelector("#glist").innerHTML = glossaryList(u, s.query); };
    },
  });
})(window.APGov);
