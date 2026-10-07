/* Loads data/manifest.json, then each unit's unit.json, then the content files it lists.
   Content files are plain JSON; they are applied in the order unit.json lists them. */
(function (A) {
  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
    return res.json();
  }

  A.loadUnits = async () => {
    const ids = await fetchJson("data/manifest.json");
    for (const id of ids) {
      const def = await fetchJson(`data/${id}/unit.json`);
      A.defineUnit(def);
      const parts = await Promise.all(def.files.map(fetchJson));
      parts.forEach(part => A.content(def.id, part));
    }
  };
})(window.APGov);
