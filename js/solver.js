// Production math: turns "I want X/min of these items" into machine counts,
// exact clock speeds, raw resource needs and leftover byproducts.
(function () {
  const G = window.GAME;
  const EPS = 1e-9;

  // Which recipe makes each item. `alts` is a list of alternate recipe names
  // the player has unlocked; each one replaces the default for its main product.
  // `supplied` items are brought in from elsewhere (another module, the Depot),
  // so the solver lists them as inputs instead of building their chain.
  function recipeMap(alts, supplied) {
    const map = Object.assign({}, G.defaults);
    (alts || []).forEach(function (name) {
      const r = G.recipes[name];
      if (r) map[r.out[0][0]] = name;
    });
    (supplied || []).forEach(function (item) { delete map[item]; });
    return map;
  }

  function isRaw(item) {
    return G.raw.indexOf(item) !== -1;
  }

  // Fixed-point iteration: byproducts (water from Aluminum Scrap, silica from
  // Alumina Solution...) are netted against demand before new machines are added.
  function solve(targets, alts, supplied) {
    const map = recipeMap(alts, supplied);
    let counts = {}; // recipe name -> machines at 100%
    for (let iter = 0; iter < 500; iter++) {
      const demand = Object.assign({}, targets);
      const supply = {}; // item -> amount made by recipes that aren't its main recipe
      Object.keys(counts).forEach(function (rn) {
        const r = G.recipes[rn];
        r.in.forEach(function (p) {
          demand[p[0]] = (demand[p[0]] || 0) + p[1] * counts[rn];
        });
        r.out.forEach(function (p) {
          if (map[p[0]] !== rn) supply[p[0]] = (supply[p[0]] || 0) + p[1] * counts[rn];
        });
      });
      const next = {};
      Object.keys(demand).forEach(function (item) {
        if (isRaw(item) || !map[item]) return;
        const rn = map[item];
        const r = G.recipes[rn];
        const per = r.out.find(function (p) { return p[0] === item; })[1];
        const need = demand[item] - (supply[item] || 0);
        if (need > EPS) next[rn] = (next[rn] || 0) + need / per;
      });
      let delta = 0;
      Object.keys(Object.assign({}, counts, next)).forEach(function (k) {
        delta = Math.max(delta, Math.abs((counts[k] || 0) - (next[k] || 0)));
      });
      counts = next;
      if (delta < EPS) break;
    }
    return describe(targets, counts, map);
  }

  function machinesFor(count) {
    const n = Math.max(1, Math.ceil(count - 1e-6));
    return { machines: n, clock: (count / n) * 100 };
  }

  function machinePower(r, machines, clock) {
    const m = G.machines[r.machine] || { power: 0, exp: 1.321929 };
    const base = r.power || m.power;
    return machines * base * Math.pow(clock / 100, m.exp);
  }

  function describe(targets, counts, map) {
    const made = {};
    const used = Object.assign({}, targets);
    Object.keys(counts).forEach(function (rn) {
      const r = G.recipes[rn];
      r.out.forEach(function (p) { made[p[0]] = (made[p[0]] || 0) + p[1] * counts[rn]; });
      r.in.forEach(function (p) { used[p[0]] = (used[p[0]] || 0) + p[1] * counts[rn]; });
    });

    // Depth = longest path from a target, so raw processing comes first in build order.
    const depth = {};
    function visit(item, d) {
      const rn = map[item];
      if (!rn || !counts[rn]) return;
      if (depth[rn] !== undefined && depth[rn] >= d) return;
      if (d > 40) return;
      depth[rn] = d;
      G.recipes[rn].in.forEach(function (p) { visit(p[0], d + 1); });
    }
    Object.keys(targets).forEach(function (t) { visit(t, 0); });

    const steps = Object.keys(counts).map(function (rn) {
      const r = G.recipes[rn];
      const mc = machinesFor(counts[rn]);
      return {
        recipe: rn,
        machine: r.machine,
        alt: r.alt,
        exact: counts[rn],
        machines: mc.machines,
        clock: mc.clock,
        power: machinePower(r, mc.machines, mc.clock),
        inputs: r.in.map(function (p) { return [p[0], p[1] * counts[rn]]; }),
        outputs: r.out.map(function (p) { return [p[0], p[1] * counts[rn]]; }),
        depth: depth[rn] || 0,
      };
    }).sort(function (a, b) { return b.depth - a.depth || a.recipe.localeCompare(b.recipe); });

    const raw = [];
    const external = [];
    const surplus = [];
    Object.keys(used).forEach(function (item) {
      const net = used[item] - (made[item] || 0);
      if (net <= 1e-6) return;
      if (isRaw(item)) raw.push([item, net]);
      else if (!map[item]) external.push([item, net]);
    });
    Object.keys(made).forEach(function (item) {
      const extra = made[item] - (used[item] || 0);
      if (extra > 1e-6) surplus.push([item, extra]);
    });

    return {
      targets: Object.keys(targets).map(function (k) { return [k, targets[k]]; }),
      steps: steps,
      raw: raw,
      external: external,
      surplus: surplus,
      power: steps.reduce(function (s, x) { return s + x.power; }, 0),
    };
  }

  window.Solver = { solve: solve, machinesFor: machinesFor, recipeMap: recipeMap };
})();
