/* View registry. A view is {id, label, render(unit), actions?, enter?, afterRender?}.
   Its actions are exposed to markup as data-action="<view id>.<action name>". */
(function (A) {
  const views = new Map();
  const actions = {};

  A.views = views;
  A.actions = actions;
  A.registerView = view => {
    views.set(view.id, view);
    Object.entries(view.actions || {}).forEach(([name, fn]) => { actions[`${view.id}.${name}`] = fn; });
  };
})(window.APGov);
