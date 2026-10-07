/* Unit registry: the single place that knows what a "unit" is and how content
   files merge into it. Content files never touch the UI; views never parse files. */
(function () {
  const A = (window.APGov = window.APGov || {});
  const units = new Map();

  // One merge strategy per content key a data file may contribute.
  const merge = {
    questions(u, list) {
      list.forEach(q => {
        if (!u.groups[q.g]) console.error(`[${u.id}] question ${q.id} uses unknown group "${q.g}"`);
        if (u.questions.some(x => x.id === q.id)) console.error(`[${u.id}] duplicate question id ${q.id}`);
        u.questions.push({ ...q, uid: `${u.id}:${q.id}` });
      });
    },
    drills:    (u, byCategory) => Object.assign(u.drills, byCategory),
    review:    (u, topics) => u.review.push(...topics.map(t => ({ g: t.num, ...t }))), // g: group key the topic practices
    glossary:  (u, terms) => u.glossary.push(...terms),
    reference: (u, ref) => { u.reference = ref; },
    frame:     (u, frame) => { u.frame = frame; },
  };

  A.defineUnit = def => {
    units.set(def.id, { questions: [], drills: {}, review: [], glossary: [], reference: null, frame: null, ...def });
  };

  A.content = (unitId, part) => {
    const u = units.get(unitId);
    if (!u) throw new Error(`content() for unknown unit "${unitId}"`);
    Object.entries(part).forEach(([key, value]) => {
      if (!merge[key]) throw new Error(`[${unitId}] unknown content key "${key}"`);
      merge[key](u, value);
    });
  };

  A.units = () => [...units.values()];
  A.unit = id => units.get(id);

  /* Group labelling. A group with a `topic` belongs to that numbered topic ("1.7");
     groups without one are shown by name alone. */
  A.labels = {
    group:  (u, k) => (u.groups[k].topic ? `${u.groups[k].topic} · ${u.groups[k].name}` : u.groups[k].name),
    topic:  (u, k) => (u.groups[k].topic ? `Topic ${u.groups[k].topic} · ${u.groups[k].name}` : u.groups[k].name),
    tag:    (u, q) => `${u.groups[q.g].topic ? `Topic ${q.topic}` : u.groups[q.g].name} · ${q.concept}`,
  };
})();
