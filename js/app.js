(function () {
  const PHASES = window.PHASES;
  const STORE_KEY = "sfguide.v1";

  // ---------- state ----------
  // A new object every time, so saved ticks never leak into the starting state.
  function fresh(over) {
    return Object.assign({ steps: {}, alts: [], spoilers: false, view: "now" }, over || {});
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
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- model ----------
  const index = {}; // mission id -> { m, phase, pi, side, n }
  PHASES.forEach(function (p, pi) {
    p.missions.forEach(function (m, n) { index[m.id] = { m: m, phase: p, pi: pi, side: false, n: n }; });
    (p.side || []).forEach(function (m, n) { index[m.id] = { m: m, phase: p, pi: pi, side: true, n: n }; });
  });

  function stepsOf(m) {
    const s = state.steps[m.id] || [];
    return m.steps.map(function (_, i) { return !!s[i]; });
  }
  function isDone(m) { return stepsOf(m).every(Boolean); }
  function doneCount(m) { return stepsOf(m).filter(Boolean).length; }
  function setStep(id, i, v) {
    const m = index[id].m;
    const s = stepsOf(m);
    s[i] = v;
    state.steps[id] = s;
    save();
  }
  function setMission(id, v) {
    const m = index[id].m;
    state.steps[id] = m.steps.map(function () { return v; });
    save();
  }
  function phaseComplete(pi) { return PHASES[pi].missions.every(isDone); }
  function phaseStarted(pi) {
    return PHASES[pi].missions.concat(PHASES[pi].side || []).some(function (m) { return doneCount(m) > 0; });
  }
  function phaseVisible(pi) {
    return state.spoilers || pi === 0 || phaseComplete(pi - 1) || phaseStarted(pi);
  }
  // Missions reveal one at a time: everything done so far plus the first unfinished one.
  function visibleMissions(pi) {
    const ms = PHASES[pi].missions;
    if (state.spoilers) return ms.slice();
    const first = ms.findIndex(function (m) { return !isDone(m); });
    if (first === -1) return ms.slice();
    return ms.filter(function (m, i) { return i <= first || doneCount(m) > 0; });
  }
  function hiddenCount(pi) { return PHASES[pi].missions.length - visibleMissions(pi).length; }
  function currentMission() {
    for (let pi = 0; pi < PHASES.length; pi++) {
      const m = PHASES[pi].missions.find(function (x) { return !isDone(x); });
      if (m) return m;
    }
    return null;
  }
  function firstLockedPhase() {
    for (let pi = 0; pi < PHASES.length; pi++) if (!phaseVisible(pi)) return pi;
    return -1;
  }
  function overall() {
    let all = 0, done = 0;
    PHASES.forEach(function (p) { p.missions.forEach(function (m) { all++; if (isDone(m)) done++; }); });
    return { all: all, done: done };
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

  // ---------- mission body (used by Now view and the drawer) ----------
  const calcMode = {}; // mission id -> "table" | "flow"

  function missionBody(id, opts) {
    const info = index[id];
    const m = info.m;
    const steps = stepsOf(m);
    const done = isDone(m);
    const where = info.side
      ? "Side quest · " + info.phase.tier
      : info.phase.tier + " · Mission " + (info.n + 1) + " of " + info.phase.missions.length;
    let h = '<div class="card ' + (opts && opts.current ? "current" : "") + '">';
    h += '<div class="eyebrow">' + esc(where) + "</div>";
    h += "<h1>" + (done ? "✅ " : "") + esc(m.title) + "</h1>";
    if (m.goal) h += '<div class="goal">🎯 ' + esc(m.goal) + "</div>";
    h += '<ul class="steps">';
    m.steps.forEach(function (s, i) {
      h += '<li><label class="' + (steps[i] ? "checked" : "") + '"><input type="checkbox" data-step="' + id + '" data-i="' + i + '"' + (steps[i] ? " checked" : "") + "><span>" + md(s) + "</span></label></li>";
    });
    h += "</ul>";
    if (m.calc) h += calcBox(id, m.calc);
    h += '<div class="row" style="margin-top:14px">';
    if (!done) h += '<button class="btn primary" data-done="' + id + '">✓ Mark mission done</button>';
    else h += '<button class="btn" data-undo="' + id + '">↺ Untick mission</button>';
    h += "</div></div>";
    return h;
  }

  function calcBox(id, calc) {
    const r = window.Solver.solve(calc.targets, state.alts, calc.supplied);
    const mode = calcMode[id] || "table";
    let h = '<div class="calc"><div class="calc-head"><span class="title">🏭 Machines for this module</span>';
    h += '<span class="seg"><button data-calcmode="' + id + '" data-mode="table" class="' + (mode === "table" ? "active" : "") + '">Table</button>';
    h += '<button data-calcmode="' + id + '" data-mode="flow" class="' + (mode === "flow" ? "active" : "") + '">Flow diagram</button></span></div>';
    h += '<div class="calc-body">';
    h += '<div class="calc-section">Output</div><div class="chips">' + r.targets.map(function (t) {
      return '<span class="chip">' + esc(t[0]) + " " + rate(t[0], t[1]) + "</span>";
    }).join("") + "</div>";
    if (mode === "flow") {
      h += '<div class="diagram-wrap">' + productionSvg(r) + "</div>";
    } else {
      h += "<table><thead><tr><th>Build</th><th>Clock</th><th>Recipe</th><th>In → Out (whole group)</th></tr></thead><tbody>";
      r.steps.forEach(function (s) {
        h += "<tr><td class='num'><strong>" + s.machines + "×</strong> " + esc(s.machine) + "</td>";
        h += "<td class='num clock'>" + fmt(s.clock) + "%</td>";
        h += "<td>" + esc(s.recipe.replace("Alternate: ", "")) + (s.alt ? '<span class="tag alt">alt</span>' : "") + "</td>";
        h += "<td class='io'>" + s.inputs.map(function (p) { return esc(p[0]) + " " + rate(p[0], p[1]); }).join(", ") +
          " → " + s.outputs.map(function (p) { return esc(p[0]) + " " + rate(p[0], p[1]); }).join(", ") + "</td></tr>";
      });
      h += "</tbody></table>";
    }
    if (r.raw.length) {
      h += '<div class="calc-section">Raw resources (mined on site)</div><div class="chips">' + r.raw.map(function (x) {
        return '<span class="chip raw">⛏ ' + esc(x[0]) + " " + rate(x[0], x[1]) + "</span>";
      }).join("") + '</div><div class="muted" style="font-size:13px">Miner on a normal node: Mk.1 60 · Mk.2 120 · Mk.3 240 /min (impure ½, pure ×2). Water Extractor: 120 m³/min.</div>';
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
    h += '<div class="calc-section">Power</div><div>⚡ ~' + fmt(Math.round(r.power * 10) / 10) + " MW for the whole module</div>";
    h += "</div></div>";
    return h;
  }

  // ---------- production flow diagram (top = raw, bottom = output) ----------
  function productionSvg(r) {
    const W = 196, H = 56, GX = 22, GY = 70, PAD = 16;
    const maxD = r.steps.reduce(function (a, s) { return Math.max(a, s.depth); }, 0);
    const nodes = [];
    r.steps.forEach(function (s) {
      nodes.push({
        kind: "step", row: maxD - s.depth + 1, label: s.machines + "× " + s.machine + " @ " + fmt(s.clock) + "%",
        sub: s.recipe.replace("Alternate: ", ""), out: s.outputs, in: s.inputs,
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
    function bary(n, others) {
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
          const b = bary(n, srcs.length ? srcs : dsts);
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

  // ---------- views ----------
  function renderNow() {
    const m = currentMission();
    if (!m) {
      return '<div class="card celebrate"><div class="big">🚀</div><h1>Project Assembly complete!</h1><p class="muted">Every mission is ticked. Go enjoy the factory, or chase side quests and coupons.</p></div>';
    }
    const info = index[m.id];
    const p = info.phase, pi = info.pi;
    const done = p.missions.filter(isDone).length;
    let h = '<div class="card"><div class="eyebrow">' + esc(p.tier) + "</div><h2>" + esc(p.title) + '</h2><div class="muted">' + md(p.blurb) + "</div>";
    h += '<div class="progress"><div style="width:' + pct(done, p.missions.length) + '%"></div></div>';
    h += '<div class="muted" style="font-size:13px">' + done + " of " + p.missions.length + " missions in this phase</div></div>";
    h += missionBody(m.id, { current: true });
    const hidden = hiddenCount(pi);
    if (hidden > 0) h += '<div class="next-locked">🔒 The next mission shows up when you finish this one. (' + hidden + " more in this phase.)</div>";
    else if (pi + 1 < PHASES.length) h += '<div class="next-locked">🔒 Finish this and <strong>' + esc(PHASES[pi + 1].title) + "</strong> (" + esc(PHASES[pi + 1].tier) + ") unlocks.</div>";
    const sides = [];
    PHASES.forEach(function (ph, i) {
      if (phaseVisible(i)) (ph.side || []).forEach(function (s) { if (!isDone(s)) sides.push(s); });
    });
    if (sides.length) {
      h += '<details class="side-wrap"><summary>Optional side quests (' + sides.length + ")</summary>";
      sides.forEach(function (s) { h += missionRow(s.id); });
      h += "</details>";
    }
    return h;
  }

  function missionRow(id) {
    const info = index[id];
    const m = info.m;
    const done = isDone(m);
    const cur = currentMission();
    const cls = "mission-row" + (done ? " done" : "") + (cur && cur.id === id ? " current" : "") + (info.side ? " side" : "");
    const partial = !done && doneCount(m) > 0 ? " · " + doneCount(m) + "/" + m.steps.length + " steps" : "";
    return '<div class="' + cls + '"><input type="checkbox" title="Tick the whole mission" data-mission="' + id + '"' + (done ? " checked" : "") + '>' +
      '<div class="name" data-open="' + id + '">' + (info.side ? "◇ " : "") + esc(m.title) +
      '<div class="meta">' + esc(m.goal || "") + partial + "</div></div>" +
      (m.calc ? '<span class="tag">math</span>' : "") + "</div>";
  }

  function renderList() {
    let h = "";
    let shownLocked = false;
    PHASES.forEach(function (p, pi) {
      if (!phaseVisible(pi)) {
        if (!shownLocked) {
          h += '<div class="locked-phase">🔒 <strong>' + esc(p.tier) + "</strong> unlocks when you finish " + esc(PHASES[pi - 1].title) + ".</div>";
          shownLocked = true;
        }
        return;
      }
      const done = p.missions.filter(isDone).length;
      h += '<section class="phase"><div class="phase-head"><div><div class="eyebrow">' + esc(p.tier) + "</div><h2>" + esc(p.title) + "</h2></div>";
      h += '<div class="muted">' + done + " / " + p.missions.length + "</div></div>";
      h += '<div class="progress"><div style="width:' + pct(done, p.missions.length) + '%"></div></div>';
      visibleMissions(pi).forEach(function (m) { h += missionRow(m.id); });
      const hidden = hiddenCount(pi);
      if (hidden) h += '<div class="mission-row" style="opacity:.5">🔒 ' + hidden + " more mission" + (hidden > 1 ? "s" : "") + " reveal as you go</div>";
      if ((p.side || []).length) {
        h += '<details class="side-wrap"' + (p.side.some(function (s) { return doneCount(s) > 0; }) ? " open" : "") + "><summary>Side quests (" + p.side.filter(isDone).length + "/" + p.side.length + ")</summary>";
        p.side.forEach(function (s) { h += missionRow(s.id); });
        h += "</details>";
      }
      h += "</section>";
    });
    return h;
  }

  function nodeState(m) {
    if (isDone(m)) return "done";
    const cur = currentMission();
    if (cur && cur.id === m.id) return "current";
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

  // Roadmap flowchart: phases top to bottom, missions chained, side quests branching right.
  function renderFlow() {
    const MW = 340, MH = 54, SW = 270, SH = 44, GY = 22, X = 30, SX = 430;
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
    const lockedPi = firstLockedPhase();
    PHASES.forEach(function (p, pi) {
      if (!phaseVisible(pi) && pi !== lockedPi) return;
      const locked = !phaseVisible(pi);
      if (prevBottom !== null) svg += arrow(X + MW / 2, prevBottom, y);
      const done = p.missions.filter(isDone).length;
      svg += box(X, y, MW, MH + 4, locked ? "locked" : "phase", (locked ? "🔒 " : "") + p.tier + " · " + p.title,
        locked ? "Unlocks after the phase above" : done + " / " + p.missions.length + " missions", null, locked);
      const phaseMid = y + (MH + 4) / 2;
      prevBottom = y + MH + 4;
      y = prevBottom + GY;
      if (locked) return;
      // side quests column
      let sy = y;
      (p.side || []).forEach(function (s) {
        svg += '<path d="M' + (X + MW) + "," + phaseMid + " C" + (SX - 40) + "," + phaseMid + " " + (SX - 40) + "," + (sy + SH / 2) + " " + SX + "," + (sy + SH / 2) + '" fill="none" stroke="#6fa8dc" stroke-width="1.4" stroke-dasharray="4 4"/>';
        svg += box(SX, sy, SW, SH, isDone(s) ? "done" : "side", (isDone(s) ? "✓ " : "◇ ") + s.title, null, s.id);
        sy += SH + 12;
      });
      visibleMissions(pi).forEach(function (m) {
        svg += arrow(X + MW / 2, prevBottom, y);
        const st = nodeState(m);
        svg += box(X, y, MW, MH, st, (st === "done" ? "✓ " : st === "current" ? "▶ " : "") + m.title, m.goal, m.id);
        prevBottom = y + MH;
        y = prevBottom + GY;
      });
      const hidden = hiddenCount(pi);
      if (hidden) {
        svg += arrow(X + MW / 2, prevBottom, y);
        svg += box(X, y, MW, 40, "locked", "🔒 " + hidden + " more — revealed one at a time", null, null, true);
        prevBottom = y + 40;
        y = prevBottom + GY;
      }
      y = Math.max(y, sy + 10);
      maxY = y;
    });
    maxY = Math.max(maxY, y);
    const width = SX + SW + 30;
    let h = '<div class="legend"><span><i style="background:#fa9549"></i>Current</span><span><i style="background:#5fbf77"></i>Done</span><span><i style="background:#5b6170"></i>To do</span><span><i style="background:#6fa8dc"></i>Side quest</span><span>Click any box to open it</span></div>';
    h += '<div class="diagram-wrap"><svg width="' + width + '" height="' + maxY + '" viewBox="0 0 ' + width + " " + maxY + '">' +
      '<defs><marker id="farr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5b6170"/></marker></defs>' +
      svg + "</svg></div>";
    return h;
  }

  // Mind map: Project Assembly in the middle, phases around it, missions on the outside.
  function renderMind() {
    const leaves = []; // {m, pi, side}
    const groups = [];
    const lockedPi = firstLockedPhase();
    PHASES.forEach(function (p, pi) {
      const visible = phaseVisible(pi);
      if (!visible && pi !== lockedPi) return;
      const g = { p: p, pi: pi, locked: !visible, start: leaves.length };
      if (visible) {
        visibleMissions(pi).forEach(function (m) { leaves.push({ m: m, pi: pi, side: false }); });
        if (hiddenCount(pi)) leaves.push({ hidden: hiddenCount(pi), pi: pi });
        (p.side || []).forEach(function (m) { leaves.push({ m: m, pi: pi, side: true }); });
      } else {
        leaves.push({ lockedPhase: true, pi: pi });
      }
      // Pad small groups with empty slots so every phase gets a fair slice of the circle.
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
        const la = ang(i), lx = cx + R2 * Math.cos(la), ly = cy + R2 * Math.sin(la);
        const L = leaves[i];
        if (L.gap) continue;
        let st = "locked", label = "", id = null;
        if (L.m) { st = L.side ? (isDone(L.m) ? "done" : "side") : nodeState(L.m); label = (L.side ? "◇ " : "") + L.m.title; id = L.m.id; }
        else if (L.hidden) label = "🔒 " + L.hidden + " more";
        else label = "🔒 ???";
        const c2 = NODE[st];
        lines += '<path d="M' + px + "," + py + " Q" + (cx + (pr + R2) / 2 * Math.cos(la)) + "," + (cy + (pr + R2) / 2 * Math.sin(la)) + " " + lx + "," + ly + '" stroke="' + c2.stroke + '" stroke-opacity=".55" stroke-width="1.5" fill="none"' + (L.side || !L.m ? ' stroke-dasharray="4 4"' : "") + "/>";
        const right = Math.cos(la) >= 0;
        nodes += "<g" + (id ? ' class="node" data-open="' + id + '"' : "") + '><circle cx="' + lx + '" cy="' + ly + '" r="' + (st === "current" ? 9 : 6) + '" fill="' + (st === "done" ? "#5fbf77" : c2.fill) + '" stroke="' + c2.stroke + '" stroke-width="2"/>';
        nodes += '<text x="' + (lx + (right ? 14 : -14)) + '" y="' + (ly + 4) + '" text-anchor="' + (right ? "start" : "end") + '" font-size="13" fill="' + c2.text + '"' + (st === "current" ? ' font-weight="700"' : "") + ">" + esc(trunc(label, 30)) + "</text></g>";
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

  function renderRules() {
    let h = '<h1>Rules</h1><p class="muted">Decided once, so you don\'t have to decide again. Every mission follows these.</p><div class="rules">';
    window.RULES.forEach(function (r) {
      h += '<div class="card"><h3>' + esc(r.title) + "</h3><ul>" + r.body.map(function (b) { return "<li>" + md(b) + "</li>"; }).join("") + "</ul></div>";
    });
    return h + "</div>";
  }

  function renderSettings() {
    let h = '<h1>Settings</h1><div class="card"><h2>Alternate recipes I own</h2><p class="muted">Tick an approved alternate once you\'ve unlocked it from a hard drive. Every mission\'s math switches to it straight away.</p>';
    window.APPROVED_ALTS.forEach(function (a) {
      const on = state.alts.indexOf(a.name) !== -1;
      h += '<label class="toggle"><input type="checkbox" data-alt="' + esc(a.name) + '"' + (on ? " checked" : "") + "><span><strong>" + esc(a.name.replace("Alternate: ", "")) + '</strong><br><span class="muted">' + esc(a.note) + "</span></span></label>";
    });
    h += "</div>";
    h += '<div class="card"><h2>Reveal</h2><label class="toggle"><input type="checkbox" id="spoilers"' + (state.spoilers ? " checked" : "") + '><span><strong>Show everything</strong><br><span class="muted">Turns off one-at-a-time reveal. Useful to catch up if you\'re already further in the game. Tick what you\'ve done, then switch it back off.</span></span></label></div>';
    h += '<div class="card"><h2>Save & backup</h2><p class="muted">Progress saves automatically in this browser. To back it up or move it to another browser, copy your progress code and paste it in there.</p>';
    h += '<label class="calc-section" for="backup">Progress code</label><textarea id="backup" class="backup" rows="3" spellcheck="false">' + esc(JSON.stringify(state)) + "</textarea>";
    h += '<div class="row"><button class="btn" id="copy">Copy code</button><button class="btn" id="load">Load pasted code</button>';
    h += resetArmed
      ? '<button class="btn danger" id="reset-yes">Yes, untick everything</button><button class="btn" id="reset-no">Keep my progress</button>'
      : '<button class="btn" id="reset">Reset everything</button>';
    h += '</div><div class="muted" id="backup-msg" role="status">' + esc(backupMsg) + "</div></div>";
    h += '<div class="card"><h2>About the numbers</h2><p class="muted">Recipes come from Satisfactory 1.x game data (via SatisfactoryTools). Clock speeds assume 100% = the recipe\'s base rate with no power shards. If something in-game disagrees, the game wins.</p></div>';
    return h;
  }

  let resetArmed = false;
  let backupMsg = "";

  // ---------- render ----------
  const viewEl = document.getElementById("view");
  const VIEWS = { now: renderNow, list: renderList, flow: renderFlow, mind: renderMind, rules: renderRules, settings: renderSettings };
  let lastView = null;

  function render() {
    const view = VIEWS[state.view] ? state.view : "now";
    const wrap = viewEl.querySelector(".diagram-wrap");
    const keep = view === lastView && wrap ? { l: wrap.scrollLeft, t: wrap.scrollTop } : null;
    const sy = window.scrollY;
    viewEl.className = view === "mind" || view === "flow" ? "wide" : "";
    viewEl.innerHTML = VIEWS[view]();
    document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("active", b.dataset.view === view); });
    const o = overall();
    document.getElementById("overall").textContent = o.done + " / " + o.all + " missions · " + pct(o.done, o.all) + "%";
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
  });

  document.addEventListener("click", function (e) {
    const t = e.target.closest("[data-view],[data-open],[data-done],[data-undo],[data-calcmode],[data-close],#copy,#load,#reset,#reset-yes,#reset-no");
    if (!t) return;
    if (t.dataset.view) { state.view = t.dataset.view; save(); render(); window.scrollTo(0, 0); }
    else if (t.dataset.open) openDrawer(t.dataset.open);
    else if (t.dataset.done) { setMission(t.dataset.done, true); render(); }
    else if (t.dataset.undo) { setMission(t.dataset.undo, false); render(); }
    else if (t.dataset.calcmode) { calcMode[t.dataset.calcmode] = t.dataset.mode; render(); }
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

  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawerId) closeDrawer(); });

  render();
})();
