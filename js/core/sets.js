/* Pure practice-set builders. No DOM, no view state: everything comes in as arguments. */
(function (A) {
  const { shuffle } = A.util;

  const unseen = seen => q => !seen.has(q.uid);

  // Round-robin across groups, preferring questions not yet seen.
  function mixed(questions, groupKeys, seen, size) {
    const buckets = groupKeys.map(k => {
      const inGroup = questions.filter(q => q.g === k);
      return shuffle(inGroup.filter(unseen(seen))).concat(shuffle(inGroup.filter(q => seen.has(q.uid))));
    });
    const out = [];
    for (let round = 0; out.length < size; round++) {
      let added = false;
      for (const b of buckets) {
        if (b[round] && out.length < size) { out.push(b[round]); added = true; }
      }
      if (!added) break;
    }
    return shuffle(out);
  }

  function forGroup(questions, key, seen) {
    const all = questions.filter(q => q.g === key);
    const fresh = all.filter(unseen(seen));
    return shuffle(fresh.length ? fresh : all);
  }

  // Per-concept tally for a finished/ongoing set.
  function conceptStats(items, answers) {
    const stats = {};
    items.forEach((q, i) => {
      const s = (stats[q.concept] = stats[q.concept] || { right: 0, total: 0, g: q.g });
      s.total++;
      if (answers[i] === q.ans) s.right++;
    });
    return stats;
  }

  const weakConcepts = stats => Object.keys(stats).filter(c => stats[c].right < stats[c].total);

  // Targeted practice: missed concepts -> same groups -> same groups with `seen` reset.
  function weak(questions, stats, seen, size) {
    const concepts = weakConcepts(stats);
    const groups = [...new Set(concepts.map(c => stats[c].g))];
    let pool = questions.filter(q => concepts.includes(q.concept) && !seen.has(q.uid));
    let resetSeen = false;
    if (!pool.length) pool = questions.filter(q => groups.includes(q.g) && !seen.has(q.uid));
    if (!pool.length) { resetSeen = true; pool = questions.filter(q => groups.includes(q.g)); }
    return { items: shuffle(pool).slice(0, size), resetSeen };
  }

  // Copy of an item with its options in random order. `keys` names the option list, the answer
  // index and (optionally) the per-option explanations so they stay aligned.
  function reorder(item, { opts, ans, why }) {
    const order = shuffle(item[opts].map((_, i) => i));
    const out = { ...item, [opts]: order.map(i => item[opts][i]), [ans]: order.indexOf(item[ans]) };
    if (why) out[why] = order.map(i => item[why][i]);
    return out;
  }
  const reorderQuestion = q => reorder(q, { opts: "opts", ans: "ans", why: "why" });
  const reorderCard = c => reorder(c, { opts: "o", ans: "a" });

  A.sets = { mixed, forGroup, conceptStats, weakConcepts, weak, reorderQuestion, reorderCard };
})(window.APGov);
