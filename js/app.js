(function () {
  const PHASES = window.PHASES;
  const FOCUS = window.FOCUS;
  const STORE_KEY = "sfguide.v1";
  const KIND_ICON = { milestone: "🏁" };
  FOCUS.forEach(function (f) { KIND_ICON[f.id] = f.icon; });

  // ---------- state ----------
  // A new object every time, so saved ticks never leak into the starting state.
  function fresh(over) {
    return Object.assign({
      steps: {}, alts: [], spoilers: false, view: "goals", focus: "balanced",
      order: {}, rates: {}, tierPower: {}, builtWith: {}, skipped: {}, dismissed: {},
      notes: {}, routes: [], calcIn: {},
      listLayout: "stacked", listScope: "all", hideDone: false, tagFilter: [],
      queue: [], collapsed: {},
      goals: {}, counters: {}, goalLayout: "level", goalScope: "all", goalHideDone: false, goalTags: [],
    }, over || {});
  }
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return fresh(JSON.parse(raw));
    } catch (e) { /* private mode or blocked storage: start fresh */ }
    return fresh();
  }
  function save() {
    state.savedAt = Date.now();
    saveLocal();
    queueCloud();
  }
  function saveLocal() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- sync across devices ----------
  // On claude.ai the page can keep your progress in your account (private to you),
  // so any browser or device you sign in on picks up where you left off.
  // Anywhere else it stays in this browser and the progress code moves it.
  let cloud = null; // document reference once connected
  let cloudStatus = "local"; // local | connecting | synced | saving | offline
  let cloudBusy = false, cloudAgain = false, cloudTimer = null;
  function adopt(remote) {
    const keepView = state.view;
    state = fresh(Object.assign({}, remote, { view: keepView }));
    saveLocal();
    render();
  }
  function queueCloud() {
    if (!cloud) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(pushCloud, 1200);
  }
  async function pushCloud() {
    if (!cloud) return;
    if (cloudBusy) { cloudAgain = true; return; }
    cloudBusy = true;
    setCloudStatus("saving");
    try {
      await cloud.set({ state: JSON.stringify(state), savedAt: state.savedAt || Date.now() });
      setCloudStatus("synced");
    } catch (e) {
      setCloudStatus("offline");
    }
    cloudBusy = false;
    if (cloudAgain) { cloudAgain = false; pushCloud(); }
  }
  function setCloudStatus(s) {
    cloudStatus = s;
    document.querySelectorAll(".sync").forEach(function (el) { el.innerHTML = syncLabel(); });
  }
  function syncLabel() {
    return {
      local: "💾 Saved in this browser",
      connecting: "☁ Connecting…",
      synced: "☁ Synced to your account",
      saving: "☁ Saving…",
      offline: "⚠ Sync paused, saved in this browser",
    }[cloudStatus];
  }
  async function initCloud() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    setCloudStatus("connecting");
    try {
      const db = await window.claude.use("db");
      const user = await window.claude.use("user");
      const uid = db && user ? await user.id() : null;
      if (!uid) { setCloudStatus("local"); return; }
      cloud = db.doc("data/users/" + uid + "/progress");
      const snap = await cloud.get();
      const remote = snap.exists ? snap.data() : null;
      if (remote && typeof remote.state === "string" && (remote.savedAt || 0) > (state.savedAt || 0)) {
        adopt(JSON.parse(remote.state));
        setCloudStatus("synced");
      } else {
        await pushCloud();
      }
      // Pick up changes made on another device while this one is open.
      cloud.onSnapshot(function (s) {
        if (!s.exists || s.metadata.hasPendingWrites) return;
        const d = s.data();
        if (d && typeof d.state === "string" && (d.savedAt || 0) > (state.savedAt || 0)) adopt(JSON.parse(d.state));
      }, function () { setCloudStatus("offline"); });
    } catch (e) {
      cloud = null;
      setCloudStatus("offline");
    }
  }

  // ---------- model ----------
  const index = {}; // mission id -> { m, phase, pi, n }
  PHASES.forEach(function (p, pi) {
    p.missions.forEach(function (m, n) { index[m.id] = { m: m, phase: p, pi: pi, n: n }; });
  });
  function info(id) { return index[id] || upgradeIndex[id] || altQuestIndex[id]; }

  function visibleSteps(m) {
    return m.steps.map(function (s, i) { return { s: s, i: i }; }).filter(function (x) {
      if (typeof x.s === "string") return true;
      if (x.s.alt) return owns(x.s.alt);
      if (x.s.notAlt) return !owns(x.s.notAlt);
      return true;
    });
  }
  function stepText(s) { return typeof s === "string" ? s : s.text; }
  function stepsOf(m) { return state.steps[m.id] || []; }
  function isDone(m) {
    if (m.altQuest) return owns(m.altQuest);
    const s = stepsOf(m);
    return visibleSteps(m).every(function (x) { return !!s[x.i]; });
  }
  function doneCount(m) {
    if (m.altQuest) return owns(m.altQuest) ? 1 : 0;
    const s = stepsOf(m);
    return visibleSteps(m).filter(function (x) { return !!s[x.i]; }).length;
  }
  function owns(alt) { return state.alts.indexOf(alt) !== -1; }

  function setOwned(name, v) {
    state.alts = state.alts.filter(function (a) { return a !== name; });
    if (v) state.alts.push(name);
  }
  function setStep(id, i, v) {
    const m = info(id).m;
    if (m.altQuest) return setMission(id, v);
    const before = isDone(m);
    const s = stepsOf(m).slice();
    s[i] = v;
    state.steps[id] = s;
    afterChange(m, before);
  }
  function setMission(id, v) {
    const m = info(id).m;
    const before = isDone(m);
    if (m.altQuest) {
      setOwned(m.altQuest, v);
      if (v && !before) celebrate(m);
      save();
      return;
    }
    const s = [];
    m.steps.forEach(function (_, i) { s[i] = v; });
    state.steps[id] = s;
    afterChange(m, before);
  }
  function afterChange(m, before) {
    const now = isDone(m);
    if (now && !before) {
      delete state.skipped[m.id];
      state.queue = state.queue.filter(function (q) { return q !== m.id; });
      if (m.upgradeOf) state.builtWith[m.upgradeOf] = m.newAlts.slice();
      else if (m.calc) state.builtWith[m.id] = altsFor(m);
      celebrate(m);
    }
    if (!now && before && m.calc && !m.upgradeOf) delete state.builtWith[m.id];
    save();
  }

  // Alternates a module uses: what it was built with, or what you own now.
  function altsFor(m) {
    if (!m.calc) return [];
    if (!m.upgradeOf && isDone(m) && state.builtWith[m.id]) return state.builtWith[m.id];
    if (m.newAlts) return m.newAlts;
    return currentAlts(m);
  }
  function currentAlts(m) {
    const use = (m.calc.useAlts || []).filter(owns);
    return use.concat(m.calc.forceAlts || []);
  }
  function rateKey(mid, item) { return mid + "|" + item; }
  function targetsFor(m) {
    const src = m.upgradeOf ? m.upgradeOf : m.id;
    const out = {};
    Object.keys(m.calc.targets).forEach(function (item) {
      const k = rateKey(src, item);
      out[item] = state.rates[k] !== undefined ? state.rates[k] : m.calc.targets[item];
    });
    return out;
  }
  const solveCache = {};
  function solveFor(m, alts) {
    const a = alts || altsFor(m);
    const t = targetsFor(m);
    const key = JSON.stringify([t, a, m.calc.supplied]);
    if (!solveCache[key]) solveCache[key] = window.Solver.solve(t, a, m.calc.supplied);
    return solveCache[key];
  }

  // Upgrade missions appear when you own an alternate a built module could switch to.
  let upgradeIndex = {};
  function upgrades() {
    upgradeIndex = {};
    const list = [];
    PHASES.forEach(function (p, pi) {
      p.missions.forEach(function (m) {
        if (!m.calc || !m.calc.useAlts || !isDone(m)) return;
        const built = state.builtWith[m.id] || [];
        const now = currentAlts(m);
        const added = now.filter(function (a) { return built.indexOf(a) === -1; });
        if (!added.length) return;
        const id = "up:" + m.id + ":" + now.join("+");
        if (state.dismissed[id]) return;
        const names = added.map(function (a) { return a.replace("Alternate: ", ""); }).join(" + ");
        const u = {
          id: id, kind: "alts", optional: true, time: 30, upgradeOf: m.id, newAlts: now,
          title: "Upgrade: " + m.title.replace(/^(Build|Upgrade) (Module|Outpost): /, "") + " with " + names,
          goal: "Same output, rebuilt with " + names,
          calc: m.calc,
          steps: [
            "You own **" + names + "**. The box below shows the module rebuilt with it.",
            "Swap the machines listed under *What changes*, one floor at a time, then reset the clocks.",
            "Watch the output belt for 5 minutes to confirm it still hits the same rate.",
          ],
        };
        const ct = currentTier();
        upgradeIndex[id] = { m: u, phase: PHASES[ct], pi: ct, n: 999 };
        list.push(u);
      });
    });
    return list;
  }

  // One side quest per alternate worth hunting right now: every top-ranked one from
  // the last few tiers, plus good ones from this tier. Owning it completes the quest.
  let altQuestIndex = {};
  function altQuests() {
    altQuestIndex = {};
    const pi = currentTier();
    const p = PHASES[pi];
    const tierNum = pi; // phase index matches the game tier number
    return window.ALTS.filter(function (a) {
      if (a.tier > tierNum) return false;
      return a.rank === 1 ? a.tier >= tierNum - 3 : a.rank === 2 && a.tier >= tierNum - 2;
    }).map(function (a) {
      const m = {
        id: "alt:" + a.name, kind: "alts", optional: true, time: 20, altQuest: a.name,
        title: "Find alternate: " + altName(a.name),
        goal: a.why,
        steps: ["Research hard drives in the MAM until **" + altName(a.name) + "** is offered, then pick it. Ticking this marks it as owned."],
      };
      altQuestIndex[m.id] = { m: m, phase: p, pi: pi, n: 999 };
      return m;
    });
  }

  function requiresMet(m) {
    return (m.requires || []).every(function (r) { return index[r] && isDone(index[r].m); });
  }
  function blockers(m) {
    return (m.requires || []).filter(function (r) { return index[r] && !isDone(index[r].m); }).map(function (r) { return index[r].m; });
  }
  function tierComplete(pi) {
    return PHASES[pi].missions.every(function (m) { return m.optional || isDone(m); });
  }
  function tierStarted(pi) {
    return PHASES[pi].missions.some(function (m) { return doneCount(m) > 0; });
  }
  function tierVisible(pi) {
    return state.spoilers || pi === 0 || tierComplete(pi - 1) || tierStarted(pi);
  }
  function currentTier() {
    for (let pi = 0; pi < PHASES.length; pi++) if (!tierComplete(pi)) return pi;
    return PHASES.length - 1;
  }
  function firstLockedTier() {
    for (let pi = 0; pi < PHASES.length; pi++) if (!tierVisible(pi)) return pi;
    return -1;
  }

  // Order within a tier: your manual order if you set one, otherwise focus first,
  // then required before optional. Never ahead of a mission it depends on.
  function tierList(pi) {
    let list = PHASES[pi].missions.slice();
    if (pi === currentTier()) list = list.concat(upgrades(), altQuests());
    const manual = state.order[PHASES[pi].id];
    let pref;
    if (manual) {
      const pos = {};
      manual.forEach(function (id, i) { pos[id] = i; });
      pref = list.slice().sort(function (a, b) {
        const pa = pos[a.id] !== undefined ? pos[a.id] : 1000 + list.indexOf(a);
        const pb = pos[b.id] !== undefined ? pos[b.id] : 1000 + list.indexOf(b);
        return pa - pb;
      });
    } else {
      const focus = state.focus;
      const rank = function (m) {
        const hit = focus !== "balanced" && m.kind === focus;
        if (hit) return 0;
        return m.optional ? 2 : 1;
      };
      pref = list.slice().sort(function (a, b) { return rank(a) - rank(b) || list.indexOf(a) - list.indexOf(b); });
    }
    // Skipped missions go to the end.
    pref = pref.filter(function (m) { return !state.skipped[m.id]; }).concat(pref.filter(function (m) { return state.skipped[m.id]; }));
    // Stable dependency pass.
    const ids = {};
    list.forEach(function (m) { ids[m.id] = true; });
    const out = [], placed = {};
    while (pref.length) {
      let k = pref.findIndex(function (m) {
        return (m.requires || []).every(function (r) { return !ids[r] || placed[r]; });
      });
      if (k === -1) k = 0;
      const m = pref.splice(k, 1)[0];
      placed[m.id] = true;
      out.push(m);
    }
    return out;
  }
  function liveQueue() {
    return state.queue.map(function (id) { return info(id); }).filter(function (x) { return x && !isDone(x.m); }).map(function (x) { return x.m; });
  }
  function currentMission() {
    // Your queue comes first, skipping anything still waiting on another quest.
    const ready = liveQueue().find(requiresMet);
    if (ready) return ready;
    const pi = currentTier();
    const list = tierList(pi);
    return list.find(function (m) { return !isDone(m) && requiresMet(m) && !state.skipped[m.id]; }) ||
      list.find(function (m) { return !isDone(m) && requiresMet(m); }) || null;
  }

  function overall() {
    let all = 0, done = 0;
    PHASES.forEach(function (p) { p.missions.forEach(function (m) { if (!m.optional) { all++; if (isDone(m)) done++; } }); });
    return { all: all, done: done };
  }
  function powerBudget() {
    let built = 0, used = 0;
    const retired = {};
    PHASES.forEach(function (p) { p.missions.forEach(function (m) { if (isDone(m)) (m.replaces || []).forEach(function (r) { retired[r] = true; }); }); });
    PHASES.forEach(function (p) {
      p.missions.forEach(function (m) {
        if (!isDone(m)) return;
        if (m.produces && !retired[m.id]) built += m.produces;
        if (m.calc) used += solveFor(m).power;
      });
    });
    return { built: built, used: used };
  }

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function md(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  }
  function plain(s) { return String(s).replace(/\*\*?/g, ""); }
  function fmt(n) { return String(Number(n.toFixed(4))); }
  function unit(item) { return window.GAME.liquids.indexOf(item) !== -1 ? " m³" : ""; }
  function rate(item, n) { return fmt(n) + unit(item) + "/min"; }
  function trunc(s, n) { s = plain(s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function mw(n) { return Math.round(n).toLocaleString() + " MW"; }
  function hours(min) { return min >= 60 ? (Math.round(min / 6) / 10) + " h" : Math.round(min) + " min"; }
  function altName(a) { return a.replace("Alternate: ", ""); }
  function shortTitle(t) { return t.replace(/^(Build|Upgrade|Scale) (Module|Outpost)?:? ?/, ""); }

  // ---------- mission body (used by Now view and the drawer) ----------
  const calcMode = {}; // mission id -> "floors" | "table" | "flow"

  function missionBody(id, opts) {
    const inf = info(id);
    if (!inf) return '<div class="card">This quest no longer applies.</div>';
    const m = inf.m;
    const done = isDone(m);
    const s = stepsOf(m);
    const where = (m.optional ? "Side quest" : "Main quest") + " · " + inf.phase.tier;
    let h = '<div class="card ' + (opts && opts.current ? "current" : "") + '">';
    h += '<div class="eyebrow">' + esc(where) + "</div>";
    h += "<h1>" + (done ? "✅ " : "") + esc(m.title) + "</h1>";
    h += '<div class="row">';
    if (m.goal) h += '<div class="goal">🎯 ' + esc(m.goal) + "</div>";
    h += '<span class="tag kind">' + KIND_ICON[m.kind] + " " + esc(kindLabel(m.kind)) + "</span>";
    if (m.time) h += '<span class="tag">⏱ ~' + hours(m.time) + "</span>";
    h += "</div>";
    const blocked = blockers(m);
    if (blocked.length && !done) {
      h += '<div class="callout warn">🔒 Do this first: ' + blocked.map(function (b) { return '<a href="#" data-open="' + b.id + '">' + esc(b.title) + "</a>"; }).join(", ") + "</div>";
    }
    const wanted = (m.suggestAlts || []).filter(function (a) { return !owns(a); });
    if (wanted.length && !done) {
      h += '<div class="callout alt">💾 <strong>Strongly suggested:</strong> try to find ' + wanted.map(function (a) { return "<strong>" + esc(altName(a)) + "</strong>"; }).join(", ") +
        " on a hard drive before building this. You can build without it; an upgrade mission appears if you get it later.</div>";
    }
    h += '<ul class="steps">';
    visibleSteps(m).forEach(function (x) {
      const on = !!s[x.i];
      h += '<li><label class="' + (on ? "checked" : "") + '"><input type="checkbox" data-step="' + id + '" data-i="' + x.i + '"' + (on ? " checked" : "") + "><span>" + md(stepText(x.s)) + "</span></label></li>";
    });
    h += "</ul>";
    if (m.calc) h += calcBox(m);
    if (!done && !m.calc && m.produces) h += '<div class="callout">⚡ Adds <strong>' + mw(m.produces) + "</strong> to your grid.</div>";
    h += '<details class="notes"' + (state.notes[id] ? " open" : "") + '><summary>📝 My notes</summary><textarea id="note-' + esc(id) + '" data-note="' + esc(id) + '" rows="3" placeholder="Where you built it, coordinates, what to fix later…">' + esc(state.notes[id] || "") + "</textarea></details>";
    h += '<div class="row" style="margin-top:14px">';
    if (!done) {
      h += '<button class="btn primary" data-done="' + id + '">✓ Mark quest done</button>';
      h += '<button class="btn" data-qtoggle="' + id + '">' + (state.queue.indexOf(id) !== -1 ? "Remove from queue" : "📋 Add to queue") + "</button>";
      if (!state.skipped[id]) h += '<button class="btn" data-skip="' + id + '">Skip for now</button>';
      else h += '<button class="btn" data-unskip="' + id + '">Unskip</button>';
      if (m.upgradeOf) h += '<button class="btn" data-dismiss="' + id + '">Not worth it</button>';
    } else h += '<button class="btn" data-undo="' + id + '">↺ Untick quest</button>';
    h += "</div></div>";
    return h;
  }
  function kindLabel(k) {
    if (k === "milestone") return "Milestone";
    const f = FOCUS.find(function (x) { return x.id === k; });
    return f ? f.label : k;
  }

  function calcBox(m) {
    const r = solveFor(m);
    const mode = calcMode[m.id] || "floors";
    const alts = altsFor(m);
    let h = '<div class="calc"><div class="calc-head"><span class="title">🏭 Machines for this module</span>';
    h += '<span class="seg">' + ["floors", "table", "flow"].map(function (k) {
      const label = { floors: "Floor plan", table: "Table", flow: "Flow diagram" }[k];
      return '<button data-calcmode="' + m.id + '" data-mode="' + k + '" class="' + (mode === k ? "active" : "") + '">' + label + "</button>";
    }).join("") + "</span></div>";
    h += '<div class="calc-body">';
    h += '<div class="calc-section">Output (edit on the goal board)</div><div class="chips">' + r.targets.map(function (t) {
      return '<span class="chip">' + esc(t[0]) + " " + rate(t[0], t[1]) + "</span>";
    }).join("") + alts.map(function (a) { return '<span class="chip alt">💾 ' + esc(altName(a)) + "</span>"; }).join("") + "</div>";
    if (m.upgradeOf) h += upgradeDiff(m);
    if (mode === "flow") h += '<div class="diagram-wrap">' + productionSvg(r) + "</div>";
    else if (mode === "table") h += '<div class="table-wrap">' + calcTable(r) + "</div>";
    else h += floorPlan(r);
    if (r.raw.length) {
      h += '<div class="calc-section">Raw resources (mined on site)</div><div class="chips">' + r.raw.map(function (x) {
        return '<span class="chip raw">⛏ ' + esc(x[0]) + " " + rate(x[0], x[1]) + "</span>";
      }).join("") + '</div><div class="muted small">Miner on a normal node: Mk.1 60 · Mk.2 120 · Mk.3 240 /min (impure ½, pure ×2). Water Extractor: 120 m³/min.</div>';
    }
    if (r.external.length) {
      h += '<div class="calc-section">Bring in (from your other modules or the Depot)</div><div class="chips">' + r.external.map(function (x) {
        return '<span class="chip ext">📦 ' + esc(x[0]) + " " + rate(x[0], x[1]) + "</span>";
      }).join("") + "</div>";
    }
    if (r.surplus.length) {
      h += '<div class="calc-section">Byproduct (needs its own overflow → sink/storage)</div><div class="chips">' + r.surplus.map(function (x) {
        return '<span class="chip surplus">♻ ' + esc(x[0]) + " " + rate(x[0], x[1]) + "</span>";
      }).join("") + "</div>";
    }
    const pb = powerBudget();
    const after = pb.used + r.power;
    // Before your first generator the HUB's own burner runs things, so don't warn yet.
    const over = !isDone(m) && pb.built > 0 && after > pb.built;
    h += '<div class="calc-section">Power</div><div>⚡ ~' + fmt(Math.round(r.power * 10) / 10) + " MW for this module";
    if (!isDone(m) && pb.built > 0) h += ' · grid would use <strong class="' + (over ? "bad" : "") + '">' + mw(after) + "</strong> of " + mw(pb.built) + " built" + (over ? " (build more power first)" : "");
    h += "</div></div></div>";
    return h;
  }

  function calcTable(r) {
    let h = "<table><thead><tr><th>Build</th><th>Clock</th><th>Recipe</th><th>In → Out (whole group)</th></tr></thead><tbody>";
    r.steps.forEach(function (s) {
      h += "<tr><td class='num'><strong>" + s.machines + "×</strong> " + esc(s.machine) + "</td>";
      h += "<td class='num clock'>" + fmt(s.clock) + "%</td>";
      h += "<td>" + esc(altName(s.recipe)) + (s.alt ? '<span class="tag alt">alt</span>' : "") + "</td>";
      h += "<td class='io'>" + s.inputs.map(function (p) { return esc(p[0]) + " " + rate(p[0], p[1]); }).join(", ") +
        " → " + s.outputs.map(function (p) { return esc(p[0]) + " " + rate(p[0], p[1]); }).join(", ") + "</td></tr>";
    });
    return h + "</tbody></table>";
  }

  // Floor 1 = deepest raw processing, top floor = the finished product.
  function floorPlan(r) {
    const maxD = r.steps.reduce(function (a, s) { return Math.max(a, s.depth); }, 0);
    const floors = [];
    r.steps.forEach(function (s) { const f = maxD - s.depth; (floors[f] = floors[f] || []).push(s); });
    const floorOf = {};
    r.steps.forEach(function (s) { s.outputs.forEach(function (o) { if (floorOf[o[0]] === undefined || floorOf[o[0]] > maxD - s.depth) floorOf[o[0]] = maxD - s.depth; }); });
    let h = '<div class="floors">';
    for (let f = floors.length - 1; f >= 0; f--) {
      const row = floors[f] || [];
      h += '<div class="floor"><div class="floor-label">Floor ' + (f + 1) + (f === 0 ? " (ground)" : f === floors.length - 1 ? " (top)" : "") + '</div><div class="floor-machines">';
      row.forEach(function (s) {
        h += '<div class="machine"><strong>' + s.machines + "× " + esc(s.machine) + '</strong> <span class="clock">@ ' + fmt(s.clock) + '%</span><div class="muted small">' + esc(altName(s.recipe)) + " → " +
          s.outputs.map(function (o) { return esc(o[0]) + " " + rate(o[0], o[1]); }).join(", ") + "</div></div>";
      });
      h += "</div>";
      // Parts lifted into this floor from below.
      const lifts = {};
      row.forEach(function (s) {
        s.inputs.forEach(function (p) {
          const from = floorOf[p[0]];
          if (from !== undefined && from < f) lifts[p[0]] = (lifts[p[0]] || 0) + p[1];
        });
      });
      const keys = Object.keys(lifts);
      if (keys.length) h += '<div class="lifts">⬆ Lift up to here: ' + keys.map(function (k) { return esc(k) + " " + rate(k, lifts[k]); }).join(" · ") + "</div>";
      h += "</div>";
    }
    return h + "</div>";
  }

  function upgradeDiff(m) {
    const before = solveFor(m, state.builtWith[m.upgradeOf] || []);
    const after = solveFor(m);
    const count = function (r) { const c = {}; r.steps.forEach(function (s) { c[s.machine + " · " + altName(s.recipe)] = s.machines; }); return c; };
    const a = count(before), b = count(after);
    const lines = [];
    Object.keys(Object.assign({}, a, b)).forEach(function (k) {
      const d = (b[k] || 0) - (a[k] || 0);
      if (d) lines.push('<li class="' + (d > 0 ? "add" : "remove") + '">' + (d > 0 ? "+" : "−") + Math.abs(d) + " " + esc(k) + "</li>");
    });
    const p = after.power - before.power;
    return '<div class="calc-section">What changes</div><ul class="diff">' + (lines.join("") || "<li>Only clock speeds change.</li>") + '</ul><div class="muted small">Power: ' + (p <= 0 ? "saves " : "adds ") + fmt(Math.abs(Math.round(p * 10) / 10)) + " MW.</div>";
  }

  // ---------- production flow diagram (top = raw, bottom = output) ----------
  function productionSvg(r) {
    const W = 196, H = 56, GX = 22, GY = 70, PAD = 16;
    const maxD = r.steps.reduce(function (a, s) { return Math.max(a, s.depth); }, 0);
    const nodes = [];
    r.steps.forEach(function (s) {
      nodes.push({
        kind: "step", row: maxD - s.depth + 1, label: s.machines + "× " + s.machine + " @ " + fmt(s.clock) + "%",
        sub: altName(s.recipe), out: s.outputs, in: s.inputs,
      });
    });
    const outRow = maxD + 2;
    r.targets.forEach(function (t) {
      nodes.push({ kind: "target", row: outRow, label: "✔ " + t[0], sub: rate(t[0], t[1]), out: [], in: [[t[0], t[1]]] });
    });
    r.surplus.forEach(function (x) {
      nodes.push({ kind: "surplus", row: outRow, label: "♻ Overflow → Sink", sub: x[0] + " " + rate(x[0], x[1]), out: [], in: [[x[0], x[1]]] });
    });
    // Raw and brought-in items sit one row above the first machine that uses them.
    r.raw.concat(r.external).forEach(function (x) {
      let row = outRow;
      nodes.forEach(function (n) { if (n.in.some(function (p) { return p[0] === x[0]; })) row = Math.min(row, n.row); });
      nodes.push({ kind: r.raw.indexOf(x) !== -1 ? "raw" : "ext", row: Math.max(0, row - 1), label: (r.raw.indexOf(x) !== -1 ? "⛏ " : "📦 ") + x[0], sub: rate(x[0], x[1]), out: [[x[0], x[1]]], in: [] });
    });
    function feeds(src, dst) { return dst.in.some(function (p) { return src.out.some(function (o) { return o[0] === p[0]; }); }); }
    const rows = [];
    nodes.forEach(function (n) { (rows[n.row] = rows[n.row] || []).push(n); });
    const maxCols = rows.reduce(function (a, row) { return Math.max(a, (row || []).length); }, 0);
    const LANE = 80; // gutters for arrows that skip a row (left) or loop back (right)
    const width = LANE * 2 + PAD * 2 + maxCols * W + (maxCols - 1) * GX;
    function place(row, ri) {
      const rowW = row.length * W + (row.length - 1) * GX;
      row.forEach(function (n, ci) { n.x = (width - rowW) / 2 + ci * (W + GX); n.y = PAD + ri * (H + GY); });
    }
    function bary(others) {
      const xs = others.filter(function (o) { return o.x !== undefined; }).map(function (o) { return o.x; });
      return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null;
    }
    rows.forEach(function (row, ri) { if (row) place(row, ri); });
    // Two ordering passes: by what feeds each node, then by what each node feeds.
    for (let pass = 0; pass < 2; pass++) {
      rows.forEach(function (row, ri) {
        if (!row) return;
        row.forEach(function (n) {
          const srcs = nodes.filter(function (o) { return o !== n && feeds(o, n); });
          const dsts = nodes.filter(function (o) { return o !== n && feeds(n, o); });
          const b = bary(srcs.length ? srcs : dsts);
          n.key = b === null ? n.x : b;
        });
        row.sort(function (a, b) { return a.key - b.key; });
        place(row, ri);
      });
    }
    const height = PAD * 2 + (outRow + 1) * (H + GY) - GY;

    // Edges: every producer of an item feeds every consumer, split by its share.
    const made = {};
    nodes.forEach(function (n) { n.out.forEach(function (p) { made[p[0]] = (made[p[0]] || 0) + p[1]; }); });
    let edges = "", labels = "", leftK = 0, rightK = 0;
    nodes.forEach(function (dst) {
      dst.in.forEach(function (need) {
        nodes.forEach(function (src) {
          if (src === dst) return;
          const o = src.out.find(function (p) { return p[0] === need[0]; });
          if (!o) return;
          const amt = need[1] * (o[1] / made[need[0]]);
          if (amt < 1e-6) return;
          const back = dst.row <= src.row; // recycled byproduct flowing back up (e.g. water)
          let path, lx, ly;
          if (back || dst.row - src.row > 1) {
            // Route through a side gutter (left for skips, right for loops) so it never crosses a box.
            const gx = back ? width - 34 + (rightK++ % 4) * 8 : LANE - 34 - (leftK++ % 4) * 8;
            const x1 = src.x + W / 2, y1 = src.y + H, x2 = dst.x + W / 2, y2 = dst.y;
            const g1 = y1 + 22 + (back ? 8 : 0), g2 = y2 - 22 - (back ? 8 : 0);
            path = "M" + x1 + "," + y1 + " L" + x1 + "," + g1 + " L" + gx + "," + g1 + " L" + gx + "," + g2 + " L" + x2 + "," + g2 + " L" + x2 + "," + y2;
            lx = gx; ly = (g1 + g2) / 2;
          } else {
            const x1 = src.x + W / 2, y1 = src.y + H, x2 = dst.x + W / 2, y2 = dst.y;
            path = "M" + x1 + "," + y1 + " C" + x1 + "," + (y1 + GY / 2) + " " + x2 + "," + (y2 - GY / 2) + " " + x2 + "," + y2;
            lx = (x1 + x2) / 2; ly = (y1 + y2) / 2;
          }
          edges += '<path d="' + path + '" fill="none" stroke="' + (back ? "#6fa8dc" : "#5b6170") + '" stroke-width="2"' + (back ? ' stroke-dasharray="5 4"' : "") + ' marker-end="url(#arr)"/>';
          const txt = trunc(need[0], 18) + " " + fmt(amt) + (back ? " ♻" : "");
          labels += '<rect x="' + (lx - txt.length * 3.3 - 4) + '" y="' + (ly - 9) + '" width="' + (txt.length * 6.6 + 8) + '" height="17" rx="4" fill="#121419"/>';
          labels += '<text x="' + lx + '" y="' + (ly + 4) + '" text-anchor="middle" font-size="11" fill="#c9ccd2">' + esc(txt) + "</text>";
        });
      });
    });
    const colors = { raw: "#8a6d3b", ext: "#6fa8dc", step: "#fa9549", target: "#5fbf77", surplus: "#c0504d" };
    let boxes = "";
    nodes.forEach(function (n) {
      boxes += '<g><rect x="' + n.x + '" y="' + n.y + '" width="' + W + '" height="' + H + '" rx="8" fill="#1e2128" stroke="' + colors[n.kind] + '" stroke-width="2"/>';
      boxes += '<text x="' + (n.x + 10) + '" y="' + (n.y + 23) + '" font-size="13" font-weight="700" fill="#e8e6e3">' + esc(trunc(n.label, 26)) + "</text>";
      boxes += '<text x="' + (n.x + 10) + '" y="' + (n.y + 42) + '" font-size="12" fill="#9aa0ab">' + esc(trunc(n.sub, 29)) + "</text></g>";
    });
    return '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + " " + height + '" style="margin:0 auto">' +
      '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#9aa0ab"/></marker></defs>' +
      edges + boxes + labels + "</svg>";
  }

  // ---------- shared pieces ----------
  function focusPicker() {
    let h = '<div class="focus"><span class="focus-label">Focus</span>';
    FOCUS.forEach(function (f) {
      h += '<button class="chip-btn' + (state.focus === f.id ? " active" : "") + '" data-focus="' + f.id + '">' + f.icon + " " + esc(f.label) + "</button>";
    });
    if (Object.keys(state.order).length) h += '<button class="chip-btn ghost" data-resetorder>↺ Clear my manual order</button>';
    return h + "</div>";
  }

  function goalBoard(pi) {
    const p = PHASES[pi];
    const rows = [];
    p.missions.forEach(function (m) {
      if (!m.calc) return;
      Object.keys(m.calc.targets).forEach(function (item) {
        const k = rateKey(m.id, item);
        const v = state.rates[k] !== undefined ? state.rates[k] : m.calc.targets[item];
        rows.push('<label class="goal-row' + (isDone(m) ? " done" : "") + '"><span class="goal-name">' + (isDone(m) ? "✓ " : "") + esc(item) +
          '<span class="muted small"> · ' + esc(trunc(shortTitle(m.title), 34)) + '</span></span><span class="goal-input"><input type="number" min="0" step="any" id="rate-' + esc(k) + '" data-rate="' + esc(k) + '" value="' + v + '"> /min</span></label>');
      });
    });
    const pb = powerBudget();
    const tp = state.tierPower[p.id] !== undefined ? state.tierPower[p.id] : p.power;
    const wide = window.matchMedia ? window.matchMedia("(min-width: 641px)").matches : true;
    let h = '<details class="card goals"' + (wide ? " open" : "") + '><summary><strong>Goal board</strong> <span class="muted">· targets for this tier. Edit any number and the math follows.</span></summary>';
    h += '<label class="goal-row"><span class="goal-name">⚡ Power grid target<span class="muted small"> · built ' + mw(pb.built) + ", using " + mw(pb.used) + '</span></span><span class="goal-input"><input type="number" min="0" step="any" id="tierpower-' + p.id + '" data-tierpower="' + p.id + '" value="' + tp + '"> MW</span></label>';
    h += '<div class="meter"><div style="width:' + Math.min(100, pct(pb.built, tp)) + '%"></div></div>';
    h += rows.join("") || '<div class="muted small">No production targets in this tier.</div>';
    return h + "</details>";
  }

  function missionRow(m, opts) {
    const inf = info(m.id);
    const done = isDone(m);
    const cur = currentMission();
    const blocked = !done && !requiresMet(m);
    const cls = "mission-row" + (done ? " done" : "") + (cur && cur.id === m.id ? " current" : "") + (m.optional ? " side" : "") + (blocked ? " blocked" : "");
    const partial = !done && doneCount(m) > 0 ? " · " + doneCount(m) + "/" + visibleSteps(m).length + " steps" : "";
    const lock = blocked ? " · 🔒 after " + blockers(m).map(function (b) { return trunc(b.title, 28); }).join(", ") : "";
    const drag = opts && opts.drag;
    const compact = opts && opts.compact;
    const inQueue = opts && opts.queue;
    const queued = state.queue.indexOf(m.id) !== -1;
    let h = '<div class="' + cls + '" draggable="' + (drag ? "true" : "false") + '" data-row="' + m.id + '" data-tier="' + (inQueue ? "queue" : inf.phase.id) + '">';
    if (drag) h += '<span class="grip" aria-hidden="true">⋮⋮</span>';
    h += '<input type="checkbox" title="Tick the whole quest" data-mission="' + m.id + '"' + (done ? " checked" : "") + ">";
    h += '<div class="name" data-open="' + m.id + '"><span class="kind-ic" title="' + esc(kindLabel(m.kind)) + '">' + KIND_ICON[m.kind] + "</span> " + esc(m.title) +
      '<div class="meta">' + (opts && opts.tierLabel ? "Tier " + inf.pi + " · " : "") + esc(m.goal || "") + partial + lock + (state.skipped[m.id] ? " · skipped" : "") + "</div></div>";
    h += '<span class="row-tags">';
    if (m.time) h += '<span class="tag">~' + hours(m.time) + "</span>";
    if (compact) h += m.optional ? '<span class="tag side-tag">Side</span>' : '<span class="tag main-tag">Main</span>';
    else if (m.optional) h += '<span class="tag side-tag">' + esc(kindLabel(m.kind)) + "</span>";
    h += "</span>";
    if (inQueue) h += '<button class="q-btn queued" data-unqueue="' + m.id + '" aria-label="Remove from queue">✕</button>';
    else if (!done) h += '<button class="q-btn' + (queued ? " queued" : "") + '" data-qtoggle="' + m.id + '">' + (queued ? "✓ Queued" : "+ Queue") + "</button>";
    if (drag) h += '<span class="move"><button class="icon-btn" data-move="up" data-id="' + m.id + '" aria-label="Move up">▲</button><button class="icon-btn" data-move="down" data-id="' + m.id + '" aria-label="Move down">▼</button></span>';
    return h + "</div>";
  }

  // A collapsible section with a count badge. Open/closed is remembered per key.
  function section(key, title, count, body, cls, closedByDefault) {
    const closed = state.collapsed[key] !== undefined ? state.collapsed[key] : !!closedByDefault;
    return '<details class="sect ' + (cls || "") + '" data-key="' + esc(key) + '" data-default="' + (closedByDefault ? "closed" : "open") + '"' + (closed ? "" : " open") + '><summary><span class="sect-title">' + title + '</span><span class="count">' + count + "</span></summary>" + body + "</details>";
  }
  function doneOf(ms) { return ms.filter(isDone).length + "/" + ms.length; }
  const EMPTY = '<div class="muted small empty">Nothing here with these filters.</div>';

  function queuePanel() {
    const q = liveQueue();
    const body = q.length
      ? '<div class="tier-list" data-tierlist="queue">' + q.map(function (m) { return missionRow(m, { drag: true, queue: true, tierLabel: true }); }).join("") + "</div>"
      : '<div class="muted small empty">Empty. Press <strong>+ Queue</strong> on any quest to line it up here. The first one in the queue becomes your current quest.</div>';
    return section("queue", "📋 My queue", q.length, body, "queue-card");
  }

  // Main quests, then side quests; alternate hunts tucked into their own group.
  // keep: optional filter; columns: put main and side quests side by side.
  function questLists(pi, skipId, big, keep, columns) {
    const list = tierList(pi).filter(function (m) { return m.id !== skipId && (!keep || keep(m)); });
    const main = list.filter(function (m) { return !m.optional; });
    const side = list.filter(function (m) { return m.optional && !m.altQuest; });
    const hunts = list.filter(function (m) { return m.altQuest; });
    const tid = PHASES[pi].id;
    const rows = function (ms) { return '<div class="tier-list" data-tierlist="' + tid + '">' + (ms.map(function (m) { return missionRow(m, { drag: true }); }).join("") || EMPTY) + "</div>"; };
    let a = "", b = "";
    if (main.length || columns) a = section(tid + ":main", "⭐ Main quests", doneOf(main), rows(main), "main-sect");
    if (side.length || columns) b = section(tid + ":side", "◇ Side quests", doneOf(side), rows(side), "side-sect");
    if (hunts.length) b += section(tid + ":hunts", "💾 Alternates to look for", doneOf(hunts), rows(hunts), "hunt-sect", state.focus !== "alts");
    return columns ? '<div class="two-col"><div class="col">' + a + '</div><div class="col">' + b + "</div></div>" : a + b;
  }

  function tierHeader(pi) {
    const p = PHASES[pi];
    const req = p.missions.filter(function (m) { return !m.optional; });
    const done = req.filter(isDone).length;
    const left = req.filter(function (m) { return !isDone(m); }).reduce(function (a, m) { return a + (m.time || 0); }, 0);
    let h = '<div class="card"><div class="eyebrow">' + esc(p.tier) + "</div><h2>" + esc(p.title) + '</h2><div class="muted">' + md(p.blurb) + "</div>";
    h += '<div class="progress"><div style="width:' + pct(done, req.length) + '%"></div></div>';
    h += '<div class="muted small">' + done + " of " + req.length + " main quests · about " + hours(left) + " of main-quest play left in this tier</div></div>";
    return h;
  }

  // ---------- views ----------
  function renderNow() {
    const m = currentMission();
    const pi = currentTier();
    if (!m && tierComplete(PHASES.length - 1)) {
      return '<div class="card celebrate"><div class="big">🚀</div><h1>Project Assembly complete!</h1><p class="muted">Every main quest is ticked. Go chase side quests, or just enjoy the factory.</p></div>';
    }
    let h = tierHeader(pi);
    h += focusPicker();
    h += queuePanel();
    if (m) h += missionBody(m.id, { current: true });
    h += goalBoard(pi);
    h += questLists(pi, m ? m.id : null, true);
    if (pi + 1 < PHASES.length && !tierVisible(pi + 1)) {
      h += '<div class="next-locked">🔒 Finish the main quests here and <strong>' + esc(PHASES[pi + 1].title) + "</strong> (" + esc(PHASES[pi + 1].tier) + ") unlocks.</div>";
    }
    return h;
  }

  // ---------- list view: several layouts and filters ----------
  const LAYOUTS = [
    { id: "stacked", label: "Stacked" },
    { id: "columns", label: "Main | Side" },
    { id: "tags", label: "By tag" },
    { id: "status", label: "By status" },
    { id: "table", label: "Table" },
  ];
  function listTags() {
    return [{ id: "milestone", label: "Milestone", icon: KIND_ICON.milestone }].concat(FOCUS.slice(1));
  }
  function listKeep(m) {
    if (state.hideDone && isDone(m)) return false;
    if (state.tagFilter.length && state.tagFilter.indexOf(m.kind) === -1) return false;
    return true;
  }
  function listTiers() {
    const out = [];
    PHASES.forEach(function (p, pi) {
      if (!tierVisible(pi)) return;
      if (state.listScope === "tier" && pi !== currentTier()) return;
      out.push(pi);
    });
    return out;
  }
  function listToolbar() {
    let h = '<div class="toolbar">';
    h += '<div class="tool-group"><span class="focus-label">Layout</span><span class="seg">' + LAYOUTS.map(function (l) {
      return '<button data-layout="' + l.id + '" class="' + (state.listLayout === l.id ? "active" : "") + '">' + l.label + "</button>";
    }).join("") + "</span></div>";
    h += '<div class="tool-group"><span class="focus-label">Show</span><span class="seg">' +
      '<button data-scope="tier" class="' + (state.listScope === "tier" ? "active" : "") + '">This tier</button>' +
      '<button data-scope="all" class="' + (state.listScope !== "tier" ? "active" : "") + '">All unlocked tiers</button></span>' +
      '<label class="check"><input type="checkbox" id="hide-done"' + (state.hideDone ? " checked" : "") + "> Hide done</label></div>";
    h += '<div class="tool-group tags"><span class="focus-label">Tags</span>' + listTags().map(function (t) {
      const on = state.tagFilter.indexOf(t.id) !== -1;
      return '<button class="chip-btn' + (on ? " active" : "") + '" data-tag="' + t.id + '">' + t.icon + " " + esc(t.label) + "</button>";
    }).join("") + (state.tagFilter.length ? '<button class="chip-btn ghost" data-tag="">✕ Clear tags</button>' : "") + "</div>";
    return h + "</div>";
  }

  function renderList() {
    let h = listToolbar() + queuePanel();
    const layout = state.listLayout;
    const tiers = listTiers();
    const many = tiers.length > 1;
    const all = [];
    tiers.forEach(function (pi) { tierList(pi).forEach(function (m) { if (listKeep(m)) all.push(m); }); });
    const rowOpts = { tierLabel: many, compact: true };

    if (layout === "tags") {
      h += '<div class="board wrap">';
      listTags().forEach(function (t) {
        const ms = all.filter(function (m) { return m.kind === t.id; });
        if (!ms.length) return;
        h += section("tag:" + t.id, t.icon + " " + esc(t.label), doneOf(ms), ms.map(function (m) { return missionRow(m, rowOpts); }).join(""), "board-col");
      });
      return h + "</div>" + (all.length ? "" : emptyNote());
    }
    if (layout === "status") {
      const groups = [
        { label: "▶ Ready now", ms: all.filter(function (m) { return !isDone(m) && requiresMet(m); }) },
        { label: "🔒 Waiting on something", ms: all.filter(function (m) { return !isDone(m) && !requiresMet(m); }) },
        { label: "✓ Done", ms: all.filter(isDone) },
      ];
      h += '<div class="board">';
      groups.forEach(function (g, i) {
        h += section("status:" + i, g.label, g.ms.length, g.ms.map(function (m) { return missionRow(m, rowOpts); }).join("") || '<div class="muted small empty">Nothing here.</div>', "board-col");
      });
      return h + "</div>";
    }
    if (layout === "table") {
      if (!all.length) return h + emptyNote();
      h += '<div class="table-wrap"><table class="quest-table"><thead><tr><th></th><th>Quest</th><th>Tier</th><th>Type</th><th>Tag</th><th>Time</th><th>Status</th></tr></thead><tbody>';
      all.forEach(function (m) {
        const done = isDone(m);
        const status = done ? "✓ Done" : requiresMet(m) ? (doneCount(m) ? "In progress" : "Ready") : "🔒 Waiting";
        h += '<tr class="' + (done ? "done" : "") + '"><td><input type="checkbox" data-mission="' + esc(m.id) + '"' + (done ? " checked" : "") + ' aria-label="Done"></td>';
        h += '<td><a href="#" data-open="' + esc(m.id) + '">' + esc(m.title) + "</a></td><td class='num'>" + info(m.id).pi + "</td>";
        h += "<td>" + (m.optional ? '<span class="tag side-tag">Side</span>' : '<span class="tag main-tag">Main</span>') + "</td>";
        h += "<td>" + KIND_ICON[m.kind] + " " + esc(kindLabel(m.kind)) + "</td><td class='num'>" + (m.time ? "~" + hours(m.time) : "") + "</td><td>" + status + "</td></tr>";
      });
      return h + "</tbody></table></div>";
    }

    // Stacked or Main | Side columns, one section per tier.
    let shownLocked = false;
    PHASES.forEach(function (p, pi) {
      if (!tierVisible(pi)) {
        if (!shownLocked && state.listScope !== "tier") {
          h += '<div class="locked-phase">🔒 <strong>' + esc(p.tier) + "</strong> unlocks when you finish " + esc(PHASES[pi - 1].title) + ".</div>";
          shownLocked = true;
        }
        return;
      }
      if (tiers.indexOf(pi) === -1) return;
      const req = p.missions.filter(function (m) { return !m.optional; });
      const done = req.filter(isDone).length;
      const opt = p.missions.filter(function (m) { return m.optional; });
      const title = '<span class="eyebrow">' + esc(p.tier) + "</span><span class=\"tier-name\">" + esc(p.title) + "</span>";
      const count = done + "/" + req.length + " main" + (opt.length ? " · " + opt.filter(isDone).length + "/" + opt.length + " side" : "");
      const body = '<div class="progress"><div style="width:' + pct(done, req.length) + '%"></div></div>' + questLists(pi, null, false, listKeep, layout === "columns");
      h += section("tier:" + p.id, title, count, body, "phase", pi < currentTier() && state.listScope !== "tier");
    });
    return h;
  }
  function emptyNote() { return '<div class="muted empty">No quests match these filters.</div>'; }

  function nodeState(m) {
    if (isDone(m)) return "done";
    const cur = currentMission();
    if (cur && cur.id === m.id) return "current";
    if (m.optional) return "side";
    return "todo";
  }
  const NODE = {
    done: { fill: "#5fbf7726", stroke: "#5fbf77", text: "#cfe9d6" },
    current: { fill: "#fa954933", stroke: "#fa9549", text: "#ffffff" },
    todo: { fill: "#1e2128", stroke: "#5b6170", text: "#e8e6e3" },
    side: { fill: "#1e2128", stroke: "#6fa8dc", text: "#cfe0f0" },
    locked: { fill: "#15171c", stroke: "#3a3f4b", text: "#7c8290" },
    phase: { fill: "#262a33", stroke: "#fa9549", text: "#ffffff" },
  };

  // Roadmap flowchart: tiers top to bottom, required missions chained, optional ones branching right.
  function renderFlow() {
    const MW = 340, MH = 54, SW = 290, SH = 44, GY = 22, X = 30, SX = 430;
    let y = 20, svg = "", maxY = 0;
    let prevBottom = null;
    function box(x, y, w, h, st, title, sub, id, dashed) {
      const c = NODE[st];
      let g = "<g" + (id ? ' class="node" data-open="' + id + '"' : "") + ">";
      g += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" fill="' + c.fill + '" stroke="' + c.stroke + '" stroke-width="' + (st === "current" ? 3 : 1.6) + '"' + (dashed ? ' stroke-dasharray="6 5"' : "") + "/>";
      g += '<text x="' + (x + 12) + '" y="' + (y + (sub ? 22 : h / 2 + 5)) + '" font-size="14" font-weight="600" fill="' + c.text + '">' + esc(trunc(title, Math.floor(w / 8.2))) + "</text>";
      if (sub) g += '<text x="' + (x + 12) + '" y="' + (y + 40) + '" font-size="12" fill="#9aa0ab">' + esc(trunc(sub, Math.floor(w / 6.8))) + "</text>";
      return g + "</g>";
    }
    function arrow(x, y1, y2) {
      return '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (y2 - 2) + '" stroke="#5b6170" stroke-width="2" marker-end="url(#farr)"/>';
    }
    const lockedPi = firstLockedTier();
    PHASES.forEach(function (p, pi) {
      if (!tierVisible(pi) && pi !== lockedPi) return;
      const locked = !tierVisible(pi);
      if (prevBottom !== null) svg += arrow(X + MW / 2, prevBottom, y);
      const req = p.missions.filter(function (m) { return !m.optional; });
      svg += box(X, y, MW, MH + 4, locked ? "locked" : "phase", (locked ? "🔒 " : "") + p.tier + " · " + p.title,
        locked ? "Unlocks after the tier above" : req.filter(isDone).length + " / " + req.length + " main quests", null, locked);
      const phaseMid = y + (MH + 4) / 2;
      prevBottom = y + MH + 4;
      y = prevBottom + GY;
      if (locked) return;
      const list = tierList(pi).filter(function (m) { return !m.altQuest; });
      let sy = y;
      list.filter(function (m) { return m.optional; }).forEach(function (s) {
        svg += '<path d="M' + (X + MW) + "," + phaseMid + " C" + (SX - 40) + "," + phaseMid + " " + (SX - 40) + "," + (sy + SH / 2) + " " + SX + "," + (sy + SH / 2) + '" fill="none" stroke="#6fa8dc" stroke-width="1.4" stroke-dasharray="4 4"/>';
        const st = nodeState(s);
        svg += box(SX, sy, SW, SH, st === "todo" ? "side" : st, (isDone(s) ? "✓ " : KIND_ICON[s.kind] + " ") + s.title, null, s.id);
        sy += SH + 12;
      });
      list.filter(function (m) { return !m.optional; }).forEach(function (m) {
        svg += arrow(X + MW / 2, prevBottom, y);
        const st = nodeState(m);
        svg += box(X, y, MW, MH, st, (st === "done" ? "✓ " : st === "current" ? "▶ " : KIND_ICON[m.kind] + " ") + m.title, m.goal, m.id);
        prevBottom = y + MH;
        y = prevBottom + GY;
      });
      y = Math.max(y, sy + 10);
      maxY = y;
    });
    maxY = Math.max(maxY, y);
    const width = SX + SW + 30;
    let h = focusPicker();
    h += '<div class="legend"><span><i style="background:#fa9549"></i>Current</span><span><i style="background:#5fbf77"></i>Done</span><span><i style="background:#5b6170"></i>Main quest</span><span><i style="background:#6fa8dc"></i>Side quest</span><span>Click any box to open it</span></div>';
    h += '<div class="diagram-wrap"><svg width="' + width + '" height="' + maxY + '" viewBox="0 0 ' + width + " " + maxY + '">' +
      '<defs><marker id="farr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5b6170"/></marker></defs>' +
      svg + "</svg></div>";
    return h;
  }

  // Mind map: Project Assembly in the middle, tiers around it, missions on the outside.
  function renderMind() {
    const leaves = [];
    const groups = [];
    const lockedPi = firstLockedTier();
    PHASES.forEach(function (p, pi) {
      const visible = tierVisible(pi);
      if (!visible && pi !== lockedPi) return;
      const g = { p: p, pi: pi, locked: !visible, start: leaves.length };
      if (visible) tierList(pi).forEach(function (m) { if (!m.altQuest) leaves.push({ m: m }); });
      else leaves.push({ lockedPhase: true });
      // Pad small groups with empty slots so every tier gets a fair slice of the circle.
      while (leaves.length - g.start < 5) leaves.push({ gap: true });
      g.end = leaves.length;
      groups.push(g);
    });
    const n = leaves.length;
    const R2 = Math.max(300, (n * 30) / (2 * Math.PI));
    const R1 = R2 * 0.52;
    const pad = 250;
    const size = (R2 + pad) * 2;
    const cx = size / 2, cy = size / 2;
    function ang(i) { return -Math.PI / 2 + (i + 0.5) * (2 * Math.PI / n); }
    let lines = "", nodes = "";
    const o = overall();
    groups.forEach(function (g) {
      const a = (ang(g.start) + ang(g.end - 1)) / 2;
      const span = (g.end - g.start) / n; // share of the full circle
      const pr = R1 * Math.max(0.55, Math.min(1, 1.4 - span));
      const px = cx + pr * Math.cos(a), py = cy + pr * Math.sin(a);
      const c = g.locked ? NODE.locked : NODE.phase;
      lines += '<path d="M' + cx + "," + cy + " Q" + (cx + pr * 0.5 * Math.cos(a)) + "," + (cy + pr * 0.5 * Math.sin(a)) + " " + px + "," + py + '" stroke="' + (g.locked ? "#3a3f4b" : "#fa954988") + '" stroke-width="3" fill="none"/>';
      for (let i = g.start; i < g.end; i++) {
        const L = leaves[i];
        if (L.gap) continue;
        const la = ang(i), lx = cx + R2 * Math.cos(la), ly = cy + R2 * Math.sin(la);
        let st = "locked", label = "🔒 ???", id = null;
        if (L.m) { st = nodeState(L.m); label = (L.m.optional ? KIND_ICON[L.m.kind] + " " : "") + L.m.title; id = L.m.id; }
        const c2 = NODE[st];
        lines += '<path d="M' + px + "," + py + " Q" + (cx + (pr + R2) / 2 * Math.cos(la)) + "," + (cy + (pr + R2) / 2 * Math.sin(la)) + " " + lx + "," + ly + '" stroke="' + c2.stroke + '" stroke-opacity=".55" stroke-width="1.5" fill="none"' + (!L.m || L.m.optional ? ' stroke-dasharray="4 4"' : "") + "/>";
        const right = Math.cos(la) >= 0;
        nodes += "<g" + (id ? ' class="node" data-open="' + id + '"' : "") + '><circle cx="' + lx + '" cy="' + ly + '" r="' + (st === "current" ? 9 : 6) + '" fill="' + (st === "done" ? "#5fbf77" : c2.fill) + '" stroke="' + c2.stroke + '" stroke-width="2"/>';
        nodes += '<text x="' + (lx + (right ? 14 : -14)) + '" y="' + (ly + 4) + '" text-anchor="' + (right ? "start" : "end") + '" font-size="13" fill="' + c2.text + '"' + (st === "current" ? ' font-weight="700"' : "") + ">" + esc(trunc(label, 32)) + "</text></g>";
      }
      const label = (g.locked ? "🔒 " : "") + g.p.title;
      const w = Math.max(110, label.length * 7.5 + 20);
      nodes += '<g><rect x="' + (px - w / 2) + '" y="' + (py - 24) + '" width="' + w + '" height="48" rx="10" fill="' + c.fill + '" stroke="' + c.stroke + '" stroke-width="2"' + (g.locked ? ' stroke-dasharray="6 5"' : "") + "/>";
      nodes += '<text x="' + px + '" y="' + (py - 3) + '" text-anchor="middle" font-size="14" font-weight="700" fill="' + c.text + '">' + esc(label) + "</text>";
      nodes += '<text x="' + px + '" y="' + (py + 15) + '" text-anchor="middle" font-size="11" fill="#9aa0ab">' + esc(g.p.tier.split(" · ")[0]) + "</text></g>";
    });
    nodes += '<g><circle cx="' + cx + '" cy="' + cy + '" r="70" fill="#262a33" stroke="#fa9549" stroke-width="3"/>' +
      '<text x="' + cx + '" y="' + (cy - 8) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">Project</text>' +
      '<text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">Assembly</text>' +
      '<text x="' + cx + '" y="' + (cy + 32) + '" text-anchor="middle" font-size="13" fill="#fa9549">' + pct(o.done, o.all) + "%</text></g>";
    let h = '<div class="legend"><span><i style="background:#fa9549"></i>Current</span><span><i style="background:#5fbf77"></i>Done</span><span><i style="background:#6fa8dc"></i>Side quest</span><span>Click a dot to open it</span></div>';
    h += '<div class="diagram-wrap" id="mind-wrap"><svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '">' + lines + nodes + "</svg></div>";
    return h;
  }

  // ---------- logistics ----------
  function routeCalc() {
    const c = Object.assign({ vehicle: "tractor", slots: "", cars: 1, item: "Steel Pipe", rate: 20, loopMin: 3, loopSec: 0 }, state.calcIn);
    const v = window.VEHICLES.find(function (x) { return x.id === c.vehicle; }) || window.VEHICLES[0];
    const slots = c.slots === "" ? v.slots : +c.slots;
    const items = Object.keys(window.GAME.stack).sort();
    let h = '<div class="card"><h2>Route calculator</h2><p class="muted">Time one full loop in game (load → drive → unload → back, docking included) with a stopwatch. The calculator tells you how many vehicles you need and how big the buffers must be, so the factory end gets an exact steady rate.</p>';
    h += '<div class="form-grid">';
    h += '<label>Vehicle<select id="rc-vehicle" data-calc="vehicle">' + window.VEHICLES.map(function (x) { return '<option value="' + x.id + '"' + (x.id === v.id ? " selected" : "") + ">" + esc(x.name) + "</option>"; }).join("") + "</select></label>";
    if (v.fluid) h += '<label>Fluid per car (m³)<input id="rc-fluid" type="number" value="' + v.fluid + '" disabled></label>';
    else h += '<label>Inventory slots<input id="rc-slots" type="number" min="1" data-calc="slots" value="' + slots + '"></label>';
    if (v.perCar) h += '<label>Cars per train<input id="rc-cars" type="number" min="1" data-calc="cars" value="' + c.cars + '"></label>';
    if (!v.fluid) h += '<label>Item<input id="rc-item" list="rc-items" data-calc="item" value="' + esc(c.item) + '"></label>';
    h += '<label>Rate needed (/min)<input id="rc-rate" type="number" min="0" step="any" data-calc="rate" value="' + c.rate + '"></label>';
    h += '<label>Loop time<span class="pair"><input id="rc-min" type="number" min="0" data-calc="loopMin" value="' + c.loopMin + '"> min <input id="rc-sec" type="number" min="0" max="59" data-calc="loopSec" value="' + c.loopSec + '"> s</span></label>';
    h += '</div><datalist id="rc-items">' + items.map(function (i) { return '<option value="' + esc(i) + '">'; }).join("") + "</datalist>";
    const loop = (+c.loopMin || 0) + (+c.loopSec || 0) / 60;
    const stack = v.fluid ? null : window.GAME.stack[c.item];
    const r = +c.rate || 0;
    if (!v.fluid && !stack) {
      h += '<div class="callout warn">Pick an item from the list so I know its stack size.</div>';
    } else if (loop <= 0 || r <= 0) {
      h += '<div class="callout">Enter the rate and your loop time.</div>';
    } else {
      const perUnit = v.fluid ? v.fluid : slots * stack;
      const cars = v.perCar ? Math.max(1, +c.cars || 1) : 1;
      const cap = perUnit * cars;
      let vehicles, delivery;
      let res = "";
      if (v.perCar) {
        const carsNeeded = Math.ceil((r * loop) / perUnit - 1e-9);
        vehicles = 1;
        delivery = r * loop;
        const ok = carsNeeded <= cars;
        res += '<div class="result ' + (ok ? "ok" : "bad") + '">' + (ok ? "✓" : "✗") + " One train with <strong>" + cars + " car" + (cars > 1 ? "s" : "") + "</strong> carries up to " + fmt(cap / loop) + "/min. You need at least <strong>" + carsNeeded + " car" + (carsNeeded > 1 ? "s" : "") + "</strong>.</div>";
      } else {
        vehicles = Math.ceil((r * loop) / cap - 1e-9);
        delivery = (r * loop) / vehicles;
        res += '<div class="result ok">Use <strong>' + vehicles + " " + esc(v.name) + (vehicles > 1 ? "s" : "") + "</strong> on this loop. Each one carries up to " + fmt(cap / loop) + "/min (" + fmt(cap) + " per trip).</div>";
      }
      const interval = loop / vehicles;
      const unitName = v.fluid ? "m³" : c.item;
      res += '<ul class="facts"><li>A delivery arrives every <strong>' + fmt(interval * 60) + " s</strong> carrying about <strong>" + fmt(delivery) + " " + esc(unitName) + "</strong>.</li>";
      const buffer = delivery * 2;
      if (v.fluid) {
        const ifb = Math.ceil(buffer / 2400 - 1e-9);
        res += "<li>Buffer at each end: at least <strong>" + fmt(buffer) + " m³</strong> → <strong>" + ifb + " Industrial Fluid Buffer" + (ifb > 1 ? "s" : "") + "</strong> (2400 m³ each).</li>";
        res += "<li>Pipes between buffer and platform: a Mk.2 pipe carries 600 m³/min, " + (r <= 600 ? "enough for this rate ✓" : "not enough on its own, so use two") + ".</li>";
      } else {
        const stacks = Math.ceil(buffer / stack - 1e-9);
        const ind = Math.ceil(stacks / 48 - 1e-9);
        res += "<li>Buffer at each end: at least <strong>" + fmt(buffer) + " " + esc(c.item) + "</strong> (" + stacks + " stacks) → <strong>" + ind + " Industrial Storage Container" + (ind > 1 ? "s" : "") + "</strong> (48 stacks each).</li>";
        res += "<li>Belts between buffer and station: two Mk.3 belts move 540/min, " + (r <= 540 ? "plenty for " + fmt(r) + "/min ✓" : "not enough. Use Mk.4+ belts") + ".</li>";
      }
      res += "<li>The factory takes exactly " + fmt(r) + "/min out of the unloading buffer, so it never notices the gaps between deliveries.</li></ul>";
      h += res;
    }
    return h + "</div>";
  }

  function network() {
    const built = [];
    PHASES.forEach(function (p) { p.missions.forEach(function (m) { if (m.calc && isDone(m)) built.push(m); }); });
    let h = '<div class="card"><h2>What feeds what</h2>';
    if (!built.length) return h + '<p class="muted">Modules you finish show up here, with what they make and what they need from elsewhere.</p></div>';
    const makers = {};
    built.forEach(function (m) { Object.keys(targetsFor(m)).forEach(function (item) { (makers[item] = makers[item] || []).push(m); }); });
    h += '<div class="net">';
    built.forEach(function (m) {
      const r = solveFor(m);
      const feeds = built.filter(function (o) { return o !== m && solveFor(o).external.some(function (x) { return targetsFor(m)[x[0]] !== undefined; }); });
      h += '<div class="net-card"><div class="net-title" data-open="' + m.id + '">' + KIND_ICON[m.kind] + " " + esc(shortTitle(m.title)) + "</div>";
      h += '<div class="small">Makes: ' + r.targets.map(function (t) { return esc(t[0]) + " " + rate(t[0], t[1]); }).join(", ") + "</div>";
      if (r.external.length) {
        h += '<div class="small">Needs: ' + r.external.map(function (x) {
          const src = makers[x[0]];
          return esc(x[0]) + " " + rate(x[0], x[1]) + (src ? ' <span class="muted">(from ' + src.map(function (s) { return esc(trunc(shortTitle(s.title), 24)); }).join(", ") + ")</span>" : ' <span class="bad">(no module makes this yet)</span>');
        }).join(", ") + "</div>";
      }
      if (feeds.length) h += '<div class="small warnline">If this stops: ' + feeds.map(function (f) { return esc(trunc(shortTitle(f.title), 26)); }).join(", ") + " slow down.</div>";
      h += "</div>";
    });
    return h + "</div></div>";
  }

  function routesList() {
    let h = '<div class="card"><h2>My routes</h2><p class="muted">Write down each belt, truck, train or drone route so you always know how things move.</p>';
    if (state.routes.length) {
      h += '<div class="table-wrap"><table><thead><tr><th>From → To</th><th>Item</th><th>Rate</th><th>By</th><th></th></tr></thead><tbody>';
      state.routes.forEach(function (rt, i) {
        h += "<tr><td>" + esc(rt.from) + " → " + esc(rt.to) + "</td><td>" + esc(rt.item) + "</td><td class='num'>" + esc(rt.rate) + "/min</td><td>" + esc(rt.by) + '</td><td><button class="icon-btn" data-delroute="' + i + '" aria-label="Delete route">✕</button></td></tr>';
      });
      h += "</tbody></table></div>";
    }
    h += '<form class="form-grid" id="route-form"><label>From<input id="rt-from" name="from" required placeholder="Steel outpost"></label><label>To<input id="rt-to" name="to" required placeholder="Main base"></label>';
    h += '<label>Item<input id="rt-item" name="item" required list="rc-items" placeholder="Steel Pipe"></label><label>Rate (/min)<input id="rt-rate" name="rate" type="number" step="any" required></label>';
    h += '<label>By<select id="rt-by" name="by"><option>Belt</option><option>Tractor</option><option>Truck</option><option>Train</option><option>Drone</option><option>Depot</option><option>Pipe</option></select></label><button class="btn" type="submit">Add route</button></form>';
    return h + "</div>";
  }

  function renderLogistics() {
    return "<h1>Logistics</h1>" + routeCalc() + network() + routesList();
  }

  // ---------- alternates ----------
  function renderAlts() {
    const pi = currentTier();
    const wanted = {};
    PHASES.forEach(function (p, i) {
      if (i > pi + 1) return;
      p.missions.forEach(function (m) { if (!isDone(m)) (m.suggestAlts || []).forEach(function (a) { if (!owns(a)) wanted[a] = (wanted[a] || []).concat(m.title); }); });
    });
    let h = '<h1>Alternate recipes</h1><p class="muted">Tick the ones you own. Modules you haven\'t built yet switch their math straight away; built modules get an upgrade side quest.</p>';
    const keys = Object.keys(wanted);
    if (keys.length) {
      h += '<div class="card"><h2>Hunting for now</h2><ul class="facts">' + keys.map(function (a) { return "<li><strong>" + esc(altName(a)) + "</strong>: helps " + wanted[a].map(esc).join(", ") + "</li>"; }).join("") + "</ul></div>";
    }
    h += '<div class="card"><h2>Pick-list</h2><p class="muted">A hard drive offers a choice? Take whichever is highest on this list. ★★★ = take it whenever offered.</p>';
    const list = window.ALTS.slice().sort(function (a, b) { return a.rank - b.rank || a.tier - b.tier; });
    list.forEach(function (a) {
      const on = owns(a.name);
      h += '<label class="toggle"><input type="checkbox" id="alt-' + esc(a.name) + '" data-alt="' + esc(a.name) + '"' + (on ? " checked" : "") + "><span><strong>" + esc(altName(a.name)) + '</strong> <span class="stars">' + "★★★".slice(0, 4 - a.rank) + '</span> <span class="tag">Tier ' + a.tier + '+</span><br><span class="muted">' + esc(a.why) + "</span></span></label>";
    });
    return h + "</div>";
  }

  // ---------- stats ----------
  function renderStats() {
    const o = overall();
    const pb = powerBudget();
    const byKind = {};
    let minutes = 0, modules = 0;
    const output = {};
    PHASES.forEach(function (p, pi) {
      if (!tierVisible(pi)) return;
      p.missions.forEach(function (m) {
        const k = byKind[m.kind] = byKind[m.kind] || { all: 0, done: 0 };
        k.all++;
        if (!isDone(m)) return;
        k.done++;
        minutes += m.time || 0;
        if (m.calc) {
          modules++;
          const t = targetsFor(m);
          Object.keys(t).forEach(function (i) { output[i] = (output[i] || 0) + t[i]; });
        }
      });
    });
    let h = '<h1>Stats</h1><div class="stat-grid">';
    h += stat("Main quests", o.done + " / " + o.all, pct(o.done, o.all) + "%");
    h += stat("Power", mw(pb.built), "using " + mw(pb.used));
    h += stat("Modules built", modules, "");
    h += stat("Play logged", hours(minutes), "from finished missions");
    h += stat("Alternates owned", state.alts.length, "of " + window.ALTS.length + " on the pick-list");
    h += "</div>";
    h += '<div class="card"><h2>Every corner of the game</h2><p class="muted">How much of each kind of mission you\'ve done in the tiers you\'ve unlocked.</p>';
    ["milestone"].concat(FOCUS.slice(1).map(function (f) { return f.id; })).forEach(function (k) {
      const v = byKind[k];
      if (!v) return;
      h += '<div class="kind-row"><span>' + KIND_ICON[k] + " " + esc(kindLabel(k)) + '</span><div class="meter"><div style="width:' + pct(v.done, v.all) + '%"></div></div><span class="num small">' + v.done + "/" + v.all + "</span></div>";
    });
    h += "</div>";
    const items = Object.keys(output).sort();
    if (items.length) {
      h += '<div class="card"><h2>Production running</h2><div class="chips">' + items.map(function (i) { return '<span class="chip">' + esc(i) + " " + rate(i, output[i]) + "</span>"; }).join("") + "</div></div>";
    }
    return h;
  }
  function stat(label, value, sub) {
    return '<div class="stat"><div class="muted small">' + esc(label) + '</div><div class="stat-value">' + esc(value) + '</div><div class="muted small">' + esc(sub) + "</div></div>";
  }

  function renderRules() {
    let h = '<h1>Rules</h1><p class="muted">Decided once, so you don\'t have to decide again. Ask Claude to change any of them.</p><div class="rules">';
    window.RULES.forEach(function (r) {
      h += '<div class="card"><h3>' + esc(r.title) + "</h3><ul>" + r.body.map(function (b) { return "<li>" + md(b) + "</li>"; }).join("") + "</ul></div>";
    });
    return h + "</div>";
  }

  function renderSettings() {
    let h = "<h1>Settings</h1>";
    h += '<div class="card"><h2>Reveal</h2><label class="toggle"><input type="checkbox" id="spoilers"' + (state.spoilers ? " checked" : "") + '><span><strong>Show every tier</strong><br><span class="muted">Useful to catch up if you\'re already further in the game. Tick what you\'ve done, then switch it back off.</span></span></label></div>';
    h += '<div class="card"><h2>Order</h2><p class="muted">You\'ve set your own order in ' + Object.keys(state.order).length + ' tier(s). Clearing it goes back to the focus order.</p><button class="btn" data-resetorder>Clear my manual order</button></div>';
    h += '<div class="card"><h2>Save & sync</h2><p class="muted">' + (cloud
      ? "Your progress is saved to your claude.ai account, so it follows you to any browser or device where you open this page signed in. It's also kept in this browser as a backup."
      : "Progress is saved in this browser. Opened from claude.ai while signed in, it also syncs to your account. Otherwise, use the progress code below to move it.") + '</p><p class="small">Status: <span class="sync">' + syncLabel() + "</span></p>";
    h += '<p class="muted">Progress code: a backup you can paste into any copy of this guide (for example a GitHub Pages version).</p>';
    h += '<label class="calc-section" for="backup">Progress code</label><textarea id="backup" class="backup" rows="3" spellcheck="false">' + esc(JSON.stringify(state)) + "</textarea>";
    h += '<div class="row"><button class="btn" id="copy">Copy code</button><button class="btn" id="load">Load pasted code</button>';
    h += resetArmed
      ? '<button class="btn danger" id="reset-yes">Yes, untick everything</button><button class="btn" id="reset-no">Keep my progress</button>'
      : '<button class="btn" id="reset">Reset everything</button>';
    h += '</div><div class="muted" id="backup-msg" role="status">' + esc(backupMsg) + "</div></div>";
    h += '<div class="card"><h2>About the numbers</h2><p class="muted">Recipes come from Satisfactory 1.x game data (via SatisfactoryTools). Clock speeds assume 100% = the recipe\'s base rate with no power shards. If something in-game disagrees, the game wins.</p></div>';
    return h;
  }

  // ---------- goals tab: what to achieve per tier, not how ----------
  function counterValue(id) { return id === "alts" ? state.alts.length : (+state.counters[id] || 0); }
  function goalDone(goal) { return goal.counter ? counterValue(goal.counter) >= goal.target : !!state.goals[goal.id]; }
  function goalsOf(pi) { return window.GOALS[PHASES[pi].id] || []; }
  function goalTier() {
    for (let pi = 0; pi < PHASES.length; pi++) {
      if (goalsOf(pi).some(function (x) { return x.level === "mandatory" && !goalDone(x); })) return pi;
    }
    return PHASES.length - 1;
  }
  function goalTierVisible(pi) { return state.spoilers || pi <= Math.max(goalTier(), currentTier()); }
  function goalKeep(goal) {
    if (state.goalHideDone && goalDone(goal)) return false;
    if (state.goalTags.length && state.goalTags.indexOf(goal.tag) === -1) return false;
    return true;
  }

  function countersPanel() {
    let h = '<div class="counters">';
    window.GOAL_COUNTERS.forEach(function (c) {
      const v = counterValue(c.id);
      let next = null;
      PHASES.forEach(function (p) { goalsOf(PHASES.indexOf(p)).forEach(function (x) { if (x.counter === c.id && x.target > v && (!next || x.target < next.target)) next = { target: x.target, tier: PHASES.indexOf(p) }; }); });
      h += '<div class="counter"><div class="counter-label">' + c.icon + " " + esc(c.label) + "</div>";
      if (c.auto) h += '<div class="counter-row"><span class="counter-value">' + v + '</span><button class="btn small" data-view="alts">Tick on Alternates tab</button></div>';
      else h += '<div class="counter-row"><button class="icon-btn big" data-cstep="' + c.id + '" data-d="-1" aria-label="One less">−</button><input type="number" min="0" id="counter-' + c.id + '" data-counter="' + c.id + '" value="' + v + '"><button class="icon-btn big" data-cstep="' + c.id + '" data-d="1" aria-label="One more">+</button></div>';
      h += '<div class="muted small">' + (next ? "Next goal: " + next.target + " (Tier " + next.tier + ")" : "Every goal reached") + "</div></div>";
    });
    return h + "</div>";
  }

  function goalRow(goal) {
    const done = goalDone(goal);
    const lvl = window.GOAL_LEVELS.find(function (l) { return l.id === goal.level; });
    let h = '<div class="goal-item lvl-' + goal.level + (done ? " done" : "") + '">';
    if (goal.counter) {
      const v = counterValue(goal.counter);
      h += '<span class="goal-check auto" title="Ticks itself from the counter above">' + (done ? "✓" : "") + "</span>";
      h += '<span class="goal-text">' + esc(goal.text) + '<span class="goal-progress"><span class="meter"><span style="width:' + Math.min(100, pct(v, goal.target)) + '%"></span></span> ' + Math.min(v, goal.target) + "/" + goal.target + "</span></span>";
    } else {
      h += '<input type="checkbox" class="goal-check" id="goal-' + esc(goal.id) + '" data-goal="' + esc(goal.id) + '"' + (done ? " checked" : "") + ">";
      h += '<label class="goal-text" for="goal-' + esc(goal.id) + '">' + esc(goal.text) + "</label>";
    }
    h += '<span class="goal-tags"><span class="tag lvl-tag">' + lvl.icon + " " + lvl.label + '</span><span class="tag">' + KIND_ICON[goal.tag] + " " + esc(kindLabel(goal.tag)) + "</span></span>";
    return h + "</div>";
  }

  function renderGoals() {
    let h = '<h1>Goals</h1><p class="muted">What to achieve in each tier, not how. Do them in any order. 🔴 Mandatory is the core path, 🔵 Encouraged is good practice for how you play, ⚪ Optional is fun and extras. Counter goals tick themselves.</p>';
    h += countersPanel();
    h += '<div class="toolbar">';
    h += '<div class="tool-group"><span class="focus-label">Layout</span><span class="seg">' +
      '<button data-glayout="level" class="' + (state.goalLayout !== "columns" ? "active" : "") + '">By level</button>' +
      '<button data-glayout="columns" class="' + (state.goalLayout === "columns" ? "active" : "") + '">Columns</button></span></div>';
    h += '<div class="tool-group"><span class="focus-label">Show</span><span class="seg">' +
      '<button data-gscope="tier" class="' + (state.goalScope === "tier" ? "active" : "") + '">This tier</button>' +
      '<button data-gscope="all" class="' + (state.goalScope !== "tier" ? "active" : "") + '">All unlocked tiers</button></span>' +
      '<label class="check"><input type="checkbox" id="goal-hide-done"' + (state.goalHideDone ? " checked" : "") + "> Hide done</label></div>";
    h += '<div class="tool-group tags"><span class="focus-label">Tags</span>' + listTags().map(function (t) {
      const on = state.goalTags.indexOf(t.id) !== -1;
      return '<button class="chip-btn' + (on ? " active" : "") + '" data-gtag="' + t.id + '">' + t.icon + " " + esc(t.label) + "</button>";
    }).join("") + (state.goalTags.length ? '<button class="chip-btn ghost" data-gtag="">✕ Clear tags</button>' : "") + "</div></div>";

    const gt = goalTier();
    let shownLocked = false;
    PHASES.forEach(function (p, pi) {
      if (!goalTierVisible(pi)) {
        if (!shownLocked && state.goalScope !== "tier") {
          h += '<div class="locked-phase">🔒 <strong>' + esc(p.tier) + "</strong> opens when the 🔴 mandatory goals above are done.</div>";
          shownLocked = true;
        }
        return;
      }
      if (state.goalScope === "tier" && pi !== gt) return;
      const all = goalsOf(pi);
      const mand = all.filter(function (x) { return x.level === "mandatory"; });
      const shown = all.filter(goalKeep);
      const parts = window.GOAL_LEVELS.map(function (l) {
        const ls = shown.filter(function (x) { return x.level === l.id; });
        const body = ls.map(goalRow).join("") || '<div class="muted small empty">Nothing here with these filters.</div>';
        return section("goals:" + p.id + ":" + l.id, l.icon + " " + l.label + ' <span class="muted small">' + esc(l.hint) + "</span>", doneOf2(ls), body, "goal-sect");
      });
      const body = '<div class="progress"><div style="width:' + pct(mand.filter(goalDone).length, mand.length) + '%"></div></div>' +
        (state.goalLayout === "columns" ? '<div class="three-col">' + parts.map(function (x) { return '<div class="col">' + x + "</div>"; }).join("") + "</div>" : parts.join(""));
      const title = '<span class="eyebrow">' + esc(p.tier) + '</span><span class="tier-name">' + esc(p.title) + "</span>";
      const count = mand.filter(goalDone).length + "/" + mand.length + " mandatory · " + all.filter(goalDone).length + "/" + all.length + " all";
      h += section("goals:" + p.id, title, count, body, "phase", pi < gt && state.goalScope !== "tier");
    });
    return h;
  }
  function doneOf2(goals) { return goals.filter(goalDone).length + "/" + goals.length; }

  // ---------- render ----------
  let resetArmed = false;
  let backupMsg = "";
  const viewEl = document.getElementById("view");
  const VIEWS = { goals: renderGoals, now: renderNow, list: renderList, flow: renderFlow, mind: renderMind, logistics: renderLogistics, alts: renderAlts, rules: renderRules, stats: renderStats, settings: renderSettings };
  let lastView = null;

  function render() {
    Object.keys(solveCache).forEach(function (k) { delete solveCache[k]; });
    upgrades();
    altQuests();
    const view = VIEWS[state.view] ? state.view : "now";
    const wrap = viewEl.querySelector(".diagram-wrap");
    const keep = view === lastView && wrap ? { l: wrap.scrollLeft, t: wrap.scrollTop } : null;
    const sy = window.scrollY;
    const wideList = (view === "list" && state.listLayout !== "stacked") || (view === "goals" && state.goalLayout === "columns");
    viewEl.className = view === "mind" || view === "flow" || wideList ? "wide" : "";
    viewEl.innerHTML = VIEWS[view]();
    document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("active", b.dataset.view === view); });
    const o = overall();
    const pb = powerBudget();
    const power = pb.built > 0
      ? '<span class="' + (pb.used > pb.built ? "bad" : "") + '">⚡ ' + mw(pb.used) + " / " + mw(pb.built) + "</span>"
      : "⚡ " + mw(pb.used) + " on the HUB burner";
    document.getElementById("overall").innerHTML = o.done + " / " + o.all + " main quests · " + pct(o.done, o.all) + "% · " + power + ' · <span class="sync">' + syncLabel() + "</span>";
    const nwrap = viewEl.querySelector(".diagram-wrap");
    if (keep && nwrap) { nwrap.scrollLeft = keep.l; nwrap.scrollTop = keep.t; }
    else if (view === "mind" && nwrap) centerMind(nwrap);
    if (view === lastView) window.scrollTo(0, sy);
    lastView = view;
    if (drawerId) renderDrawer();
  }

  function centerMind(wrap) {
    const svg = wrap.querySelector("svg");
    wrap.style.height = Math.min(window.innerHeight - 170, svg.height.baseVal.value) + "px";
    wrap.scrollLeft = (svg.width.baseVal.value - wrap.clientWidth) / 2;
    wrap.scrollTop = (svg.height.baseVal.value - wrap.clientHeight) / 2;
  }

  // ---------- celebration ----------
  function goalCelebrate(goalId, tierBefore) {
    const after = goalTier();
    if (after > tierBefore) {
      celebrate({ id: "goal-tier", title: "All mandatory goals in " + PHASES[tierBefore].title + " done! " + PHASES[after].tier + " goals are open." });
    } else if (goalId) {
      let text = "Goal done";
      PHASES.forEach(function (p, pi) { goalsOf(pi).forEach(function (x) { if (x.id === goalId) text = x.text; }); });
      celebrate({ id: "goal", title: text });
    }
  }
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function celebrate(m) {
    const inf = info(m.id);
    const tierDone = inf && !m.optional && tierComplete(inf.pi);
    const next = inf && PHASES[inf.pi + 1];
    toastEl.innerHTML = tierDone
      ? "<strong>🎉 " + esc(inf.phase.title) + " complete!</strong>" + (next ? "<br>" + esc(next.tier) + " unlocked." : "")
      : "<strong>✓ " + esc(m.title) + "</strong><br>Nice work.";
    toastEl.className = "toast show" + (tierDone ? " big" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = "toast"; }, tierDone ? 5000 : 2600);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const colors = ["#fa9549", "#5fbf77", "#6fa8dc", "#f2d16b"];
    const count = tierDone ? 80 : 24;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");
      p.className = "confetti";
      p.style.left = (tierDone ? Math.random() * 100 : 40 + Math.random() * 20) + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.3 + "s";
      p.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
      document.body.appendChild(p);
      setTimeout(function () { p.remove(); }, 2200);
    }
  }

  // ---------- drawer ----------
  let drawerId = null;
  const drawer = document.getElementById("drawer");
  function openDrawer(id) { drawerId = id; drawer.hidden = false; renderDrawer(); }
  function closeDrawer() { drawerId = null; drawer.hidden = true; }
  function renderDrawer() {
    const body = document.getElementById("drawer-body");
    const panel = drawer.querySelector(".drawer-panel");
    const st = panel.scrollTop;
    body.innerHTML = missionBody(drawerId);
    panel.scrollTop = st;
  }

  // ---------- ordering ----------
  function orderOf(tierId) {
    if (tierId === "queue") return liveQueue().map(function (m) { return m.id; });
    const pi = PHASES.findIndex(function (p) { return p.id === tierId; });
    return tierList(pi).map(function (m) { return m.id; });
  }
  function setOrder(tierId, ids) {
    if (tierId === "queue") state.queue = ids; else state.order[tierId] = ids;
    save(); render();
  }
  function moveMission(id, tierId, toIndex) {
    const ids = orderOf(tierId);
    const from = ids.indexOf(id);
    if (from === -1) return;
    ids.splice(from, 1);
    ids.splice(Math.max(0, Math.min(ids.length, toIndex)), 0, id);
    setOrder(tierId, ids);
  }

  // ---------- events ----------
  document.addEventListener("change", function (e) {
    const t = e.target;
    if (t.dataset.step) { setStep(t.dataset.step, +t.dataset.i, t.checked); render(); }
    else if (t.dataset.mission) { setMission(t.dataset.mission, t.checked); render(); }
    else if (t.dataset.alt) {
      const name = t.dataset.alt;
      state.alts = state.alts.filter(function (a) { return a !== name; });
      if (t.checked) state.alts.push(name);
      save(); render();
    } else if (t.id === "spoilers") { state.spoilers = t.checked; save(); render(); }
    else if (t.id === "hide-done") { state.hideDone = t.checked; save(); render(); }
    else if (t.id === "goal-hide-done") { state.goalHideDone = t.checked; save(); render(); }
    else if (t.dataset.goal) {
      const before = goalTier();
      state.goals[t.dataset.goal] = t.checked;
      if (!t.checked) delete state.goals[t.dataset.goal];
      save();
      if (t.checked) goalCelebrate(t.dataset.goal, before);
      render();
    } else if (t.dataset.counter) {
      const before = goalTier();
      state.counters[t.dataset.counter] = Math.max(0, parseInt(t.value, 10) || 0);
      save(); goalCelebrate(null, before); render();
    }
    else if (t.dataset.rate) {
      const v = parseFloat(t.value);
      if (v > 0) state.rates[t.dataset.rate] = v; else delete state.rates[t.dataset.rate];
      save(); render();
    } else if (t.dataset.tierpower) {
      const v = parseFloat(t.value);
      if (v >= 0) state.tierPower[t.dataset.tierpower] = v;
      save(); render();
    } else if (t.dataset.calc) {
      state.calcIn = Object.assign({}, state.calcIn);
      state.calcIn[t.dataset.calc] = t.value;
      if (t.dataset.calc === "vehicle") state.calcIn.slots = "";
      save(); render();
    }
  });

  document.addEventListener("input", function (e) {
    const t = e.target;
    if (t.dataset.note) {
      if (t.value) state.notes[t.dataset.note] = t.value; else delete state.notes[t.dataset.note];
      save();
    }
  });

  document.addEventListener("submit", function (e) {
    if (e.target.id !== "route-form") return;
    e.preventDefault();
    const f = e.target;
    state.routes = state.routes.concat([{ from: f.from.value, to: f.to.value, item: f.item.value, rate: f.rate.value, by: f.by.value }]);
    save(); render();
  });

  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-glayout],[data-gscope],[data-gtag],[data-cstep],[data-qtoggle],[data-unqueue],[data-layout],[data-scope],[data-tag],[data-view],[data-open],[data-done],[data-undo],[data-skip],[data-unskip],[data-dismiss],[data-calcmode],[data-close],[data-focus],[data-resetorder],[data-move],[data-delroute],#copy,#load,#reset,#reset-yes,#reset-no");
    if (!t) return;
    if (t.tagName === "A") e.preventDefault();
    if (t.dataset.layout) { state.listLayout = t.dataset.layout; save(); render(); return; }
    if (t.dataset.glayout) { state.goalLayout = t.dataset.glayout; save(); render(); return; }
    if (t.dataset.gscope) { state.goalScope = t.dataset.gscope; save(); render(); return; }
    if (t.dataset.gtag !== undefined) {
      const tg = t.dataset.gtag;
      if (!tg) state.goalTags = [];
      else if (state.goalTags.indexOf(tg) === -1) state.goalTags = state.goalTags.concat([tg]);
      else state.goalTags = state.goalTags.filter(function (x) { return x !== tg; });
      save(); render(); return;
    }
    if (t.dataset.cstep) {
      const before = goalTier();
      const c = t.dataset.cstep;
      state.counters[c] = Math.max(0, (+state.counters[c] || 0) + (+t.dataset.d));
      save(); goalCelebrate(null, before); render(); return;
    }
    if (t.dataset.scope) { state.listScope = t.dataset.scope; save(); render(); return; }
    if (t.dataset.tag !== undefined) {
      const tg = t.dataset.tag;
      if (!tg) state.tagFilter = [];
      else if (state.tagFilter.indexOf(tg) === -1) state.tagFilter = state.tagFilter.concat([tg]);
      else state.tagFilter = state.tagFilter.filter(function (x) { return x !== tg; });
      save(); render(); return;
    }
    if (t.dataset.view) { state.view = t.dataset.view; save(); render(); window.scrollTo(0, 0); }
    else if (t.dataset.open) openDrawer(t.dataset.open);
    else if (t.dataset.done) { setMission(t.dataset.done, true); render(); }
    else if (t.dataset.undo) { setMission(t.dataset.undo, false); render(); }
    else if (t.dataset.skip) { state.skipped[t.dataset.skip] = true; save(); render(); }
    else if (t.dataset.unskip) { delete state.skipped[t.dataset.unskip]; save(); render(); }
    else if (t.dataset.dismiss) { state.dismissed[t.dataset.dismiss] = true; save(); closeDrawer(); render(); }
    else if (t.dataset.calcmode) { calcMode[t.dataset.calcmode] = t.dataset.mode; render(); }
    else if (t.dataset.focus) { state.focus = t.dataset.focus; state.order = {}; save(); render(); }
    else if (t.hasAttribute("data-resetorder")) { state.order = {}; save(); render(); }
    else if (t.dataset.move) {
      const row = t.closest("[data-row]");
      const i = orderOf(row.dataset.tier).indexOf(t.dataset.id);
      moveMission(t.dataset.id, row.dataset.tier, i + (t.dataset.move === "up" ? -1 : 1));
    } else if (t.dataset.qtoggle) {
      const id = t.dataset.qtoggle;
      state.queue = state.queue.indexOf(id) === -1 ? state.queue.concat([id]) : state.queue.filter(function (q) { return q !== id; });
      save(); render();
    } else if (t.dataset.unqueue) {
      state.queue = state.queue.filter(function (q) { return q !== t.dataset.unqueue; });
      save(); render();
    } else if (t.dataset.delroute) { state.routes = state.routes.filter(function (_, i) { return i !== +t.dataset.delroute; }); save(); render(); }
    else if (t.hasAttribute("data-close")) closeDrawer();
    else if (t.id === "copy") {
      const box = document.getElementById("backup");
      box.value = JSON.stringify(state);
      const done = function () { backupMsg = "Copied. Paste it somewhere safe."; render(); };
      const fallback = function () { box.select(); backupMsg = "Code selected. Press Ctrl+C to copy it."; document.getElementById("backup-msg").textContent = backupMsg; };
      try { navigator.clipboard.writeText(box.value).then(done, fallback); } catch (err) { fallback(); }
    } else if (t.id === "load") {
      try {
        const data = JSON.parse(document.getElementById("backup").value);
        if (!data || typeof data.steps !== "object") throw new Error("not a progress code");
        state = fresh(Object.assign({}, data, { view: "settings" }));
        save();
        backupMsg = "Progress loaded.";
      } catch (err) {
        backupMsg = "That isn't a progress code. Paste the whole code you copied, starting with {.";
      }
      render();
    } else if (t.id === "reset") { resetArmed = true; render(); }
    else if (t.id === "reset-no") { resetArmed = false; render(); }
    else if (t.id === "reset-yes") {
      state = fresh({ view: "settings" });
      resetArmed = false;
      backupMsg = "Everything unticked.";
      save(); render();
    }
  });

  // Drag to reorder within a tier.
  let dragId = null, dragTier = null;
  function clearDropMarks() {
    document.querySelectorAll(".dragging,.drop-before,.drop-after").forEach(function (el) { el.classList.remove("dragging", "drop-before", "drop-after"); });
  }
  document.addEventListener("dragstart", function (e) {
    const row = e.target.closest && e.target.closest("[data-row]");
    if (!row || row.getAttribute("draggable") !== "true") return;
    dragId = row.dataset.row;
    dragTier = row.dataset.tier;
    row.classList.add("dragging");
    try { e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.effectAllowed = "move"; } catch (err) { /* ignore */ }
  });
  document.addEventListener("dragover", function (e) {
    const row = e.target.closest && e.target.closest("[data-row]");
    if (!dragId || !row) return;
    e.preventDefault();
    document.querySelectorAll(".drop-before,.drop-after").forEach(function (el) { el.classList.remove("drop-before", "drop-after"); });
    const r = row.getBoundingClientRect();
    row.classList.add(e.clientY < r.top + r.height / 2 ? "drop-before" : "drop-after");
  });
  document.addEventListener("drop", function (e) {
    const row = e.target.closest && e.target.closest("[data-row]");
    if (!dragId || !row) return;
    e.preventDefault();
    const id = dragId;
    dragId = null;
    if (dragTier !== row.dataset.tier || row.dataset.row === id) { clearDropMarks(); return; }
    const ids = orderOf(row.dataset.tier).filter(function (x) { return x !== id; });
    const r = row.getBoundingClientRect();
    const at = ids.indexOf(row.dataset.row) + (e.clientY < r.top + r.height / 2 ? 0 : 1);
    ids.splice(at, 0, id);
    setOrder(row.dataset.tier, ids);
  });
  document.addEventListener("dragend", function () { dragId = null; clearDropMarks(); });

  document.addEventListener("toggle", function (e) {
    const d = e.target;
    if (!d.matches || !d.matches("details[data-key]")) return;
    // Browsers also fire this when a re-render draws the section, so only
    // save a real change from what's stored (or from the default).
    const closed = !d.open;
    const was = state.collapsed[d.dataset.key];
    const current = was !== undefined ? was : d.dataset.default === "closed";
    if (current === closed) return;
    state.collapsed[d.dataset.key] = closed;
    save();
  }, true);

  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawerId) closeDrawer(); });

  render();
  initCloud();
})();
