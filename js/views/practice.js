/* Practice view: set picker -> question flow -> results. Owns the current set and the seen pool. */
(function (A) {
  const { act, btn, backlink, icon } = A.ui;
  const { labels, sets } = A;
  const SET_SIZE = 15;
  const LETTERS = ["A", "B", "C", "D"];

  const S = A.util.unitState(() => ({ set: null, seen: new Set() }));

  function start(s, items, label) {
    if (!items.length) return;
    s.set = { items: items.map(sets.reorderQuestion), i: 0, answers: new Array(items.length).fill(null), label };
  }

  /* ---------- actions ---------- */
  const actions = {
    startMixed(_, u) {
      const s = S(u);
      start(s, sets.mixed(u.questions, Object.keys(u.groups), s.seen, SET_SIZE), "Mixed set");
    },
    startGroup(key, u) {
      const s = S(u);
      start(s, sets.forGroup(u.questions, key, s.seen), u.groups[key].name);
    },
    pick(k, u) {
      const s = S(u), { set } = s;
      if (set.answers[set.i] !== null) return;
      set.answers[set.i] = Number(k);
      s.seen.add(set.items[set.i].uid); // only answered questions count as used
    },
    exit(_, u) { S(u).set = null; },
    next(_, u) { S(u).set.i++; },
    retryMissed(_, u) {
      const s = S(u);
      const { items, resetSeen } = sets.weak(u.questions, sets.conceptStats(s.set.items, s.set.answers), s.seen, SET_SIZE);
      if (resetSeen) s.seen = new Set();
      start(s, items, "Targeted practice");
    },
    resetPool(_, u) { const s = S(u); s.seen = new Set(); s.set = null; },
  };

  /* ---------- screens ---------- */
  function home(u, { seen }) {
    const left = u.questions.filter(q => !seen.has(q.uid)).length;
    const list = Object.keys(u.groups).map(k => {
      const total = u.questions.filter(q => q.g === k).length;
      const fresh = u.questions.filter(q => q.g === k && !seen.has(q.uid)).length;
      return btn(labels.group(u, k), {
        action: "practice.startGroup", arg: k,
        sub: `${total} questions${fresh < total ? ` · ${fresh} you haven’t seen` : ""}`,
      });
    }).join("");
    return `<h1>Practice</h1>
      <p class="lede">Answer, see why, and find out which concepts still need work.</p>
      ${btn("Practice the whole unit", { action: "practice.startMixed", primary: true, sub: `${SET_SIZE} questions drawn from every topic` })}
      <h3>Or focus on one area</h3>
      <div class="stack">${list}</div>
      <p class="hint">${left} of ${u.questions.length} questions unused this session.
        ${left < u.questions.length ? `<button class="backlink" ${act("practice.resetPool")}>Reset the pool</button>` : ""}</p>`;
  }

  function question(u, { set }) {
    const q = set.items[set.i], picked = set.answers[set.i], done = picked !== null;
    const rail = set.items.map((_, i) => `<i class="${i < set.i ? "done" : i === set.i ? "now" : ""}"></i>`).join("");
    const stim = q.stim.length
      ? `<blockquote>${q.stim.map(s => `<p>${s}</p>`).join("")}${q.cite ? `<cite>${q.cite}</cite>` : ""}</blockquote>` : "";
    const opts = q.opts.map((o, k) => {
      let cls = "opt", verdict = "", why = "";
      if (done) {
        if (k === q.ans) { cls += " right"; verdict = `<p class="verdict">${icon("check")}Correct answer</p>`; }
        else if (k === picked) { cls += " chosen-wrong"; verdict = `<p class="verdict">${icon("x")}Incorrect — your answer</p>`; }
        why = `<p class="why">${q.why[k]}</p>`;
      }
      return `<button class="${cls}" ${done ? "disabled" : ""} aria-pressed="${picked === k}" data-key="${LETTERS[k].toLowerCase()} ${k + 1}" ${act("practice.pick", k)}>
        <span class="ltr">${done && k === q.ans ? icon("check") : done && k === picked ? icon("x") : LETTERS[k]}</span><span>${o}${verdict}${why}</span></button>`;
    }).join("");
    const note = done && q.note ? `<div class="note"><b>Worth remembering</b>${q.note}</div>` : "";
    const last = set.i + 1 >= set.items.length;
    const cont = done
      ? `<div class="qbar"><div class="qbar-in"><span class="qresult ${picked === q.ans ? "ok" : "bad"}">${picked === q.ans ? `${icon("check")}Correct` : `${icon("x")}Incorrect — the answer is ${LETTERS[q.ans]}`}</span><button class="btn primary" data-key="enter arrowright" ${act("practice.next")}>${last ? "See results" : "Next question"}<span class="keyhint">${icon("corner-down-left")}</span></button></div></div>`
      : "";
    return `<div class="qtop">${backlink("All practice sets", "practice.exit")}<span class="railtext">${set.i + 1} of ${set.items.length}</span></div>
      <div class="rail">${rail}</div>
      <p class="tagline">${labels.tag(u, q)}</p>
      <div class="qlayout"><div class="qmain">${stim}<p class="stem">${q.stem}</p></div>
      <div class="qside"><div class="opts">${opts}</div>${note}</div></div>${cont}`;
  }

  function results(u, { set }) {
    const right = set.items.filter((q, i) => set.answers[i] === q.ans).length;
    const stats = sets.conceptStats(set.items, set.answers);
    const weak = sets.weakConcepts(stats);
    const rows = Object.keys(stats).sort((a, b) => stats[a].right / stats[a].total - stats[b].right / stats[b].total).map(c => {
      const marks = set.items.map((q, i) => (q.concept === c ? `<b class="${set.answers[i] === q.ans ? "ok" : ""}"></b>` : "")).join("");
      return `<div class="lrow"><div class="lhead">
        <div><div class="lname">${c}</div><div class="ltopic">${labels.topic(u, stats[c].g)}</div></div>
        <div class="lmarks">${marks}</div></div></div>`;
    }).join("");
    const cta = weak.length
      ? btn("Practice what you missed", {
          action: "practice.retryMissed", primary: true,
          sub: `${weak.slice(0, 2).join(", ")}${weak.length > 2 ? `, and ${weak.length - 2} more` : ""}`,
        })
      : btn("Go again with new questions", { action: "practice.startMixed", primary: true });
    return `<p class="score">${right}<span> of ${set.items.length}</span></p>
      <p class="lede">${weak.length ? `${weak.length} concept${weak.length > 1 ? "s" : ""} to work on.` : "Every concept clean."}</p>
      ${cta}<h3>Concept by concept</h3>
      <p class="hint">Filled dots are questions you got right.</p>
      <div class="ledger">${rows}</div>
      <div class="row">${btn("Back to practice", { action: "app.go", arg: "practice" })}
        ${btn("Go read up", { action: "app.go", arg: "review" })}</div>`;
  }

  A.registerView({
    id: "practice",
    label: "Practice",
    actions,
    enter(u) { S(u).set = null; },
    render(u) {
      const s = S(u);
      if (!u.questions.length) return A.ui.empty("This unit has no practice questions yet.");
      if (!s.set) return home(u, s);
      return s.set.i >= s.set.items.length ? results(u, s) : question(u, s);
    },
  });
})(window.APGov);
