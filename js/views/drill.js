/* Drill view: quick-fire recall cards, one category at a time. */
(function (A) {
  const { act, icon } = A.ui;
  const { shuffle } = A.util;

  const S = A.util.unitState(u => ({ cat: Object.keys(u.drills)[0] || null, decks: {}, i: 0, picked: null, streak: 0, best: 0 }));

  // Cards in random order with shuffled options, built once per category visit.
  const deck = (s, u) => (s.decks[s.cat] = s.decks[s.cat] || shuffle(u.drills[s.cat].map(A.sets.reorderCard)));

  const actions = {
    setCategory(c, u) { Object.assign(S(u), { cat: c, i: 0, picked: null, streak: 0 }); delete S(u).decks[c]; },
    pick(k, u) {
      const s = S(u);
      if (s.picked !== null) return;
      s.picked = Number(k);
      if (s.picked === deck(s, u)[s.i].a) { s.streak++; s.best = Math.max(s.best, s.streak); } else s.streak = 0;
    },
    next(_, u) { const s = S(u); s.i = (s.i + 1) % deck(s, u).length; s.picked = null; },
  };

  A.registerView({
    id: "drill",
    label: "Drill",
    actions,
    render(u) {
      const s = S(u), { cat, i, picked, streak, best } = s;
      if (!cat) return A.ui.empty("This unit has no drills yet.");
      const cats = Object.keys(u.drills).map(c =>
        `<button class="chip" aria-pressed="${c === cat}" ${act("drill.setCategory", c)}>${c}</button>`).join("");
      const cards = deck(s, u), card = cards[i], answered = picked !== null;
      const opts = card.o.map((o, k) => {
        let cls = "dopt";
        if (answered) { if (k === card.a) cls += " right"; else if (k === picked) cls += " chosen-wrong"; }
        return `<button class="${cls}" ${answered ? "disabled" : ""} data-key="${"abcd"[k]} ${k + 1}" ${act("drill.pick", k)}>${answered && k === card.a ? icon("check") : answered && k === picked ? icon("x") : ""}${o}</button>`;
      }).join("");
      const after = answered
        ? `<p class="dexp">${card.e}</p>
           <div class="qbar"><div class="qbar-in"><span class="qresult ${picked === card.a ? "ok" : "bad"}">${picked === card.a ? `${icon("check")}Correct` : `${icon("x")}Incorrect — the answer is ${"ABCD"[card.a]}`}</span><button class="btn primary" data-key="enter arrowright" ${act("drill.next")}>Next<span class="keyhint">${icon("corner-down-left")}</span></button></div></div>` : "";
      return `<h1>Drill</h1>
        <p class="lede">Fast recall. No scenarios, no reasoning — just the facts you need on hand.</p>
        <div class="chips">${cats}</div>
        <div class="streak"><span>Question ${i + 1} of ${cards.length}</span>
          <span>Streak ${streak}${best ? ` · best ${best}` : ""}</span></div>
        <p class="dq">${card.q}</p><div class="stack">${opts}</div>${after}`;
    },
  });
})(window.APGov);
