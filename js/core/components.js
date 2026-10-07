/* Small HTML-string builders shared by every view. Interactivity is declarative:
   elements carry data-action="<view>.<name>" and the app dispatches the click. */
(function (A) {
  const { esc } = A.util;

  const act = (name, arg) => `data-action="${name}"${arg === undefined ? "" : ` data-arg="${esc(arg)}"`}`;

  // opts: {action, arg, sub, primary, disabled}
  const btn = (label, { action, arg, sub, primary } = {}) =>
    `<button class="btn${primary ? " primary" : ""}" ${act(action, arg)}>${label}${sub ? `<span class="sub">${sub}</span>` : ""}</button>`;

  // Tabler icons (https://tabler.io/icons, MIT): 24x24 stroke paths, styled by `.icon` in components.css.
  const ICONS = {
    check: "M5 12l5 5l10 -10",
    x: "M18 6l-12 12M6 6l12 12",
    "arrow-left": "M5 12l14 0M5 12l6 6M5 12l6 -6",
    "corner-down-left": "M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4",
  };
  const icon = name =>
    `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

  const backlink = (label, action, arg) =>
    `<button class="backlink" ${act(action, arg)}>${icon("arrow-left")}${label}</button>`;

  const table = ({ cols, rows }) =>
    `<div class="scroller"><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  const empty = msg => `<p class="empty">${msg}</p>`;

  A.ui = { act, btn, backlink, icon, table, empty };
})(window.APGov);
