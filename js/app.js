/* App shell: unit tabs/nav, click dispatch, render loop, boot.
   Views never call render() themselves; any action triggers one re-render here. */
(function (A) {
  const { esc } = A.util;
  const root = document.getElementById("app");
  const nav = document.getElementById("nav");
  const tabs = document.getElementById("units");

  const { views, actions } = A;
  const state = { unitId: null, viewId: null, menuOpen: false };

  const unit = () => A.unit(state.unitId);
  const currentView = () => views.get(state.viewId);

  /* Navigation. `go` is a user navigation (resets the target view); `show` just switches. */
  actions["app.go"] = id => { state.viewId = id; currentView().enter?.(unit()); };
  actions["app.unitMenu"] = () => { state.menuOpen = !state.menuOpen; };
  actions["app.unit"] = id => {
    state.menuOpen = false;
    if (id === state.unitId) return;
    state.unitId = id;
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* e.g. sandboxed preview */ }
  };
  A.app = { unit, show: id => { state.viewId = id; } };

  /* ---------- rendering ---------- */
  function renderHeader() {
    const u = unit();
    const items = A.units().map(x =>
      `<button role="option" aria-current="${x.id === u.id}" ${A.ui.act("app.unit", x.id)}><b>Unit ${x.number}</b><span>${x.title}</span></button>`).join("");
    tabs.innerHTML = `<button class="unitbtn" aria-haspopup="listbox" aria-expanded="${state.menuOpen}" aria-label="Choose unit" ${A.ui.act("app.unitMenu")}>
        <b>Unit ${u.number}</b><span>${u.title}</span></button>
      ${state.menuOpen ? `<div class="unitmenu" role="listbox" aria-label="Units">${items}</div>` : ""}`;
    document.title = `Unit ${u.number} · ${u.title}`;
  }

  function buildNav() {
    nav.innerHTML = [...views.values()].map(v =>
      `<button data-view="${v.id}" ${A.ui.act("app.go", v.id)}>${v.label}</button>`).join("");
  }

  function render(scrollTop = true) {
    nav.querySelectorAll("button").forEach(b =>
      b.setAttribute("aria-current", b.dataset.view === state.viewId ? "true" : "false"));
    if (scrollTop) window.scrollTo(0, 0);
    const view = currentView();
    renderHeader();
    root.innerHTML = view.render(unit());
    view.afterRender?.(root, unit());
  }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const run = actions[el.dataset.action];
    if (!run) return console.error("No action registered for", el);
    run(el.dataset.arg, unit());
    // Menu toggles and answer picks re-render in place; everything else starts at the top.
    render(!/\.(pick|unitMenu)$/.test(el.dataset.action));
  });

  // Keyboard: any element with data-key="a 1 enter" is clicked by those keys (answers A-D / 1-4, Enter or → for next).
  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest("input, textarea, select")) return;
    const k = e.key.toLowerCase();
    if (k === "enter" && e.target.closest("button, a, summary")) return; // native activation handles it
    const el = [...document.querySelectorAll("[data-key]")].find(x => !x.disabled && x.dataset.key.split(" ").includes(k));
    if (el) { e.preventDefault(); el.click(); }
  });

  // Close the unit menu on outside click or Escape.
  document.addEventListener("click", e => {
    if (state.menuOpen && !e.composedPath().includes(tabs)) { state.menuOpen = false; render(false); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && state.menuOpen) { state.menuOpen = false; render(false); tabs.querySelector(".unitbtn").focus(); }
  });

  /* ---------- boot ---------- */
  (async function start() {
    try {
      await A.loadUnits();
    } catch (err) {
      const hint = location.protocol === "file:" ? " Serve the folder over http (e.g. python -m http.server) instead of opening the file directly." : "";
      root.innerHTML = A.ui.empty(`Could not load study content. ${esc(err.message)}${hint}`);
      return console.error(err);
    }
    const fromHash = A.unit(location.hash.slice(1));
    state.unitId = (fromHash || A.units()[0]).id;
    state.viewId = "practice";
    buildNav();
    render();
  })();
})(window.APGov);
