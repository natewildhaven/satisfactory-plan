// Sanity checks for the guide data and the production math.
// Run with: node tests/check.js
const path = require("path");
const assert = require("assert");

global.window = {};
const root = path.join(__dirname, "..");
require(path.join(root, "js/recipes.js"));
require(path.join(root, "js/solver.js"));
require(path.join(root, "js/missions.js"));
const { GAME, Solver, PHASES, APPROVED_ALTS } = window;

let checks = 0;
function ok(cond, msg) { assert.ok(cond, msg); checks++; }
function near(a, b, msg) { ok(Math.abs(a - b) < 1e-6, msg + ` (got ${a}, want ${b})`); }

// Mission data
const ids = new Set();
for (const p of PHASES) {
  ok(p.missions.length > 0, `${p.id} has missions`);
  for (const m of [...p.missions, ...(p.side || [])]) {
    ok(!ids.has(m.id), `unique id ${m.id}`);
    ids.add(m.id);
    ok(m.steps.length > 0, `${m.id} has steps`);
    if (!m.calc) continue;
    for (const t of Object.keys(m.calc.targets)) ok(GAME.defaults[t], `${m.id}: recipe for ${t}`);
    for (const s of m.calc.supplied || []) ok(GAME.defaults[s] || GAME.raw.includes(s), `${m.id}: supplied item ${s} exists`);
    for (const alts of [[], APPROVED_ALTS.map((a) => a.name)]) {
      const r = Solver.solve(m.calc.targets, alts, m.calc.supplied);
      for (const s of r.steps) {
        ok(Number.isFinite(s.clock) && s.clock > 0 && s.clock <= 100 + 1e-9, `${m.id}: ${s.recipe} clock in range`);
      }
    }
  }
}
for (const a of APPROVED_ALTS) ok(GAME.recipes[a.name], `alternate ${a.name} exists`);

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

console.log(`All ${checks} checks passed.`);
