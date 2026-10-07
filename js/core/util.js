(function (A) {
  A.util = {
    shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    // Session state kept separately per unit: `const S = unitState(u => ({...}))`, then `S(u)`.
    unitState(init) {
      const byUnit = new Map();
      return u => { if (!byUnit.has(u.id)) byUnit.set(u.id, init(u)); return byUnit.get(u.id); };
    },
    esc: s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  };
})(window.APGov);
