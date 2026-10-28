// Sanity checks for the guide data and the production math.
// Run with: node tests/check.js
const path = require("path");
const assert = require("assert");

global.window = {};
const root = path.join(__dirname, "..");
require(path.join(root, "js/recipes.js"));
require(path.join(root, "js/solver.js"));
require(path.join(root, "js/missions.js"));
require(path.join(root, "js/goals.js"));
require(path.join(root, "js/comeback.js"));
const { GAME, Solver, ALTS, FOCUS, COMEBACK } = window;
const PLANS = [
  { id: "fresh", phases: window.PHASES, goals: window.GOALS, rates: window.GOAL_RATES },
  COMEBACK,
];

let checks = 0;
function ok(cond, msg) { assert.ok(cond, msg); checks++; }
function near(a, b, msg) { ok(Math.abs(a - b) < 1e-6, msg + ` (got ${a}, want ${b})`); }

// Mission data. Both plans share one progress state, so ids must be unique across plans.
const ids = new Set();
const tierIds = new Set();
const kinds = new Set(["milestone"].concat(FOCUS.map((f) => f.id)));
const allMissions = PLANS.flatMap((plan) => plan.phases.flatMap((p) => p.missions));
for (const m of allMissions) {
  ok(!ids.has(m.id), `unique id ${m.id}`);
  ids.add(m.id);
}
for (const p of PLANS.flatMap((plan) => plan.phases)) {
  ok(!tierIds.has(p.id), `unique tier id ${p.id}`);
  tierIds.add(p.id);
  for (const s of p.supplied || []) ok(GAME.defaults[s] || GAME.raw.includes(s), `${p.id}: supplied item ${s} exists`);
  for (const a of p.hunt || []) ok(ALTS.some((x) => x.name === a), `${p.id}: hunted alternate ${a} is on the pick-list`);

  ok(p.missions.some((m) => !m.optional), `${p.id} has required missions`);
  for (const m of p.missions) {
    ok(kinds.has(m.kind), `${m.id}: known kind ${m.kind}`);
    ok(m.time > 0, `${m.id}: has a time estimate`);
    ok(m.steps.length > 0, `${m.id} has steps`);
    for (const s of m.steps) {
      if (typeof s === "string") continue;
      ok(typeof s.text === "string" && (s.alt || s.notAlt), `${m.id}: conditional step is well formed`);
      ok(GAME.recipes[s.alt || s.notAlt], `${m.id}: conditional step names a real recipe`);
    }
    for (const r of m.requires || []) ok(ids.has(r), `${m.id}: requires ${r} exists`);
    for (const a of m.suggestAlts || []) ok(GAME.recipes[a], `${m.id}: suggested alt ${a} exists`);
    if (!m.calc) continue;
    for (const t of Object.keys(m.calc.targets)) ok(GAME.defaults[t] || (m.calc.forceAlts || []).length, `${m.id}: recipe for ${t}`);
    for (const s of m.calc.supplied || []) ok(GAME.defaults[s] || GAME.raw.includes(s), `${m.id}: supplied item ${s} exists`);
    for (const a of (m.calc.useAlts || []).concat(m.calc.forceAlts || [])) ok(GAME.recipes[a], `${m.id}: alt ${a} exists`);
    const sets = [m.calc.forceAlts || [], (m.calc.useAlts || []).concat(m.calc.forceAlts || [])];
    for (const alts of sets) {
      const r = Solver.solve(m.calc.targets, alts, m.calc.supplied);
      ok(r.steps.length > 0, `${m.id}: solver builds something`);
      for (const s of r.steps) {
        ok(Number.isFinite(s.clock) && s.clock > 0 && s.clock <= 100 + 1e-9, `${m.id}: ${s.recipe} clock in range`);
      }
    }
  }
}
// No dependency cycles.
const byId = Object.fromEntries(allMissions.map((m) => [m.id, m]));
function reaches(from, target, seen = new Set()) {
  for (const r of byId[from].requires || []) {
    if (r === target) return true;
    if (!seen.has(r)) { seen.add(r); if (reaches(r, target, seen)) return true; }
  }
  return false;
}
for (const m of allMissions) ok(!reaches(m.id, m.id), `${m.id}: no dependency cycle`);
for (const a of ALTS) ok(GAME.recipes[a.name], `alternate ${a.name} exists`);
ok(Object.keys(GAME.stack).length > 50, "stack sizes present");

// Goals and production targets
const levels = new Set(window.GOAL_LEVELS.map((l) => l.id));
const counters = new Set(window.GOAL_COUNTERS.map((c) => c.id));
const goalIds = new Set();
for (const plan of PLANS) for (const p of plan.phases) {
  const gs = plan.goals[p.id];
  const rows = plan.rates[p.id] || [];
  for (const r of rows) {
    ok(GAME.defaults[r[0]], `${p.id}: target ${r[0]} has a recipe`);
    ok(r[1] > 0 && r[1] <= r[2] && r[2] <= r[3], `${p.id}: ${r[0]} levels go up`);
  }
  if (!p.delivery) {
    for (let lvl = 0; lvl < 3; lvl++) {
      const t = Object.fromEntries(rows.map((r) => [r[0], r[1 + lvl]]));
      if (!rows.length) continue;
      const alts = (plan.useAlts || []).concat();
      const res = Solver.solve(t, alts, p.supplied);
      for (const s of res.steps) ok(s.clock > 0 && s.clock <= 100 + 1e-9, `${p.id} level ${lvl}: ${s.recipe} clock in range`);
    }
  }
  ok(gs && gs.length >= 10, `${p.id}: has at least 10 goals`);
  ok(gs.some((x) => x.level === "mandatory"), `${p.id}: has mandatory goals`);
  for (const x of gs) {
    ok(!goalIds.has(x.id), `unique goal id ${x.id}`);
    goalIds.add(x.id);
    ok(levels.has(x.level), `${x.id}: known level`);
    ok(kinds.has(x.tag), `${x.id}: known tag ${x.tag}`);
    if (x.counter) ok(counters.has(x.counter) && x.target > 0, `${x.id}: counter goal well formed`);
    for (const i of x.items || []) ok(rows.some((r) => r[0] === i), `${x.id}: ${i} is in the tier's targets`);
  }
}

// Comeback plan
for (const a of COMEBACK.ownedAlts.concat(COMEBACK.useAlts)) ok(GAME.recipes[a] && ALTS.some((x) => x.name === a), `comeback alternate ${a} exists and is on the pick-list`);
ok(COMEBACK.ownedAlts.length === 18, "comeback lists the 18 alternates in the save");

// Known answers
function step(r, recipe) { return r.steps.find((s) => s.recipe === recipe); }
let r = Solver.solve({ "Iron Plate": 20, "Iron Rod": 15, Screws: 60 });
near(r.raw[0][1], 60, "starter iron uses one normal Mk.1 node");
near(step(r, "Screws").clock, 75, "screw constructors at 75%");

r = Solver.solve({ Concrete: 20 });
near(step(r, "Concrete").clock, 200 / 3, "concrete constructors at 66.6667%");

r = Solver.solve({ "Smart Plating": 2 });
near(r.raw[0][1], 46.5, "smart plating 2/min needs 46.5 iron ore");

r = Solver.solve({ "Aluminum Ingot": 120 });
near(r.raw.find((x) => x[0] === "Water")[1], 120, "aluminum loop: fresh water = 180 - 60 byproduct");
near(step(r, "Aluminum Scrap").clock, 50, "one scrap refinery at 50%");
near(step(r, "Silica").exact, 100 / 37.5, "silica constructors cover 150 - 50 byproduct");

r = Solver.solve({ "Nuclear Pasta": 0.5 }, ["Alternate: Pure Copper Ingot"], ["Fused Modular Frame", "Radio Control Unit"]);
near(r.raw.find((x) => x[0] === "Copper Ore")[1], 240, "pure copper cuts pasta ore to 240");

// Comeback hub at Ideal with the old base's parts brought in: copper is the big one.
const c3 = COMEBACK.phases.find((p) => p.id === "c3");
const c3t = Object.fromEntries(COMEBACK.rates.c3.map((x) => [x[0], x[2]]));
r = Solver.solve(c3t, COMEBACK.ownedAlts, c3.supplied);
near(r.raw.find((x) => x[0] === "Copper Ore")[1], 1324, "comeback Phase 4 at Ideal needs 1324 copper ore");
near(r.external.find((x) => x[0] === "Aluminum Casing")[1], 164, "comeback hub takes 164 Aluminum Casing by train");
r = Solver.solve(c3t, COMEBACK.ownedAlts.concat(["Alternate: Pure Copper Ingot"]), c3.supplied);
near(r.raw.find((x) => x[0] === "Copper Ore")[1], 529.6, "Pure Copper Ingot cuts the hub to 529.6 copper ore");

console.log(`All ${checks} checks passed.`);
