// The Goals tab: a tier-by-tier checklist of WHAT to achieve, without saying how.
//
// level: mandatory (the core path) | encouraged (good practice for this playstyle) | optional (fun and extras)
// tag:   same tags as quests (milestone, production, power, elevator, logistics, alts, explore, mam, gear, architecture)
// counter + target: ticks itself once that counter reaches the target. Counters are cumulative.

window.GOAL_COUNTERS = [
  { id: "mercer", label: "Mercer Spheres collected", icon: "🟣" },
  { id: "sloops", label: "Somersloops collected", icon: "🌀" },
  { id: "harddrives", label: "Hard drives researched", icon: "💽" },
  { id: "shards", label: "Power Shards made", icon: "🔷" },
  { id: "alts", label: "Alternate recipes owned", icon: "💾", auto: true },
];

// Production targets per tier: [item, minimum, ideal, stretch, how many the Space Elevator needs (optional)].
// Minimum matches the module sizes on the Quests tab.
window.GOAL_RATES = {
  p0: [["Iron Plate", 20, 40, 60], ["Iron Rod", 15, 30, 45], ["Screws", 60, 120, 180], ["Wire", 60, 90, 120], ["Cable", 30, 60, 90], ["Concrete", 20, 40, 60]],
  p1: [["Iron Plate", 40, 60, 90], ["Screws", 120, 180, 240], ["Wire", 90, 120, 180], ["Concrete", 30, 45, 60]],
  p2: [["Smart Plating", 2, 5, 10, 50], ["Reinforced Iron Plate", 5, 10, 15], ["Rotor", 4, 8, 12], ["Modular Frame", 2, 4, 6], ["Copper Sheet", 10, 20, 30]],
  p3: [["Steel Beam", 15, 30, 60], ["Steel Pipe", 20, 40, 60], ["Versatile Framework", 2.5, 5, 10, 1000], ["Reanimated SAM", 15, 30, 60]],
  p4: [["Smart Plating", 5, 10, 15, 1000], ["Automated Wiring", 1, 2.5, 5, 100], ["Motor", 2.5, 5, 10], ["Encased Industrial Beam", 6, 12, 18]],
  p5: [["Plastic", 60, 120, 180], ["Rubber", 60, 120, 180], ["Fuel", 80, 160, 240], ["Circuit Board", 5, 10, 15], ["Quickwire", 60, 120, 240]],
  p6: [["Modular Engine", 1, 2, 4, 500], ["Computer", 2.5, 5, 10], ["Heavy Modular Frame", 1, 2, 4], ["Adaptive Control Unit", 0.5, 1, 2, 100], ["Versatile Framework", 10, 15, 20, 2500]],
  p7: [["Aluminum Ingot", 120, 240, 360], ["Alclad Aluminum Sheet", 30, 60, 90], ["Aluminum Casing", 40, 80, 120], ["Supercomputer", 0.5, 1, 2], ["Battery", 10, 20, 40]],
  p8: [["Assembly Director System", 0.5, 1, 2, 500], ["Magnetic Field Generator", 1, 2, 4, 500], ["Thermal Propulsion Rocket", 0.5, 1, 2, 250], ["Nuclear Pasta", 0.5, 1, 2, 100], ["Radio Control Unit", 1, 2.5, 5]],
  p9: [["Biochemical Sculptor", 2, 4, 8, 1000], ["AI Expansion Server", 0.5, 1, 2, 256], ["Ballistic Warp Drive", 0.5, 1, 2, 200], ["Nuclear Pasta", 1, 2, 4, 1000], ["Time Crystal", 3, 6, 12]],
};

window.GOAL_LEVELS = [
  { id: "mandatory", label: "Mandatory", icon: "🔴", hint: "The core path to Project Assembly" },
  { id: "encouraged", label: "Encouraged", icon: "🔵", hint: "Good habits for how you like to play" },
  { id: "optional", label: "Optional", icon: "⚪", hint: "Fun, exploring and extras" },
];

(function () {
  function g(level, tag, text, extra) {
    return Object.assign({ level: level, tag: tag, text: text }, extra || {});
  }
  // A goal that ticks itself once every listed item reaches its minimum rate.
  function make(level, tag, text, items) {
    return g(level, tag, text, { items: items });
  }
  function count(level, tag, counter, target, text) {
    return g(level, tag, text, { counter: counter, target: target });
  }
  const M = "mandatory", E = "encouraged", O = "optional";

  const tiers = {
    p0: [
      g(M, "milestone", "Place the HUB within belt distance of iron, copper and limestone"),
      g(M, "power", "3 Biomass Burners running (90 MW)"),
      make(M, "production", "Iron Plate, Iron Rod and Screws automated", ["Iron Plate", "Iron Rod", "Screws"]),
      make(M, "production", "Wire and Cable automated", ["Wire", "Cable"]),
      make(M, "production", "Concrete automated", ["Concrete"]),
      g(M, "elevator", "Space Elevator placed"),
      g(E, "production", "Every module at exact clocks, no idle machines"),
      g(E, "gear", "All 4 starting Portable Miners placed"),
      g(E, "power", "200 Biomass stockpiled by the burners"),
      g(O, "architecture", "Main base spot picked and stamped"),
      g(O, "explore", "Every node type within sight of the HUB stamped"),
      g(O, "explore", "First crash site found"),
      g(O, "explore", "Tried a Paleberry, a Beryl Nut and a Bacon Agaric"),
    ],
    p1: [
      g(M, "milestone", "Milestone: Base Building"),
      g(M, "milestone", "Milestone: Logistics"),
      g(M, "milestone", "Milestone: Field Research, MAM built"),
      make(E, "production", "Starter lines scaled up for the Tier 1 and 2 milestones", ["Iron Plate", "Screws", "Wire", "Concrete"]),
      g(E, "logistics", "An overflow splitter on every module's output"),
      g(E, "mam", "First node of every MAM tree you can reach researched"),
      count(E, "alts", "harddrives", 2, "Hard drives researched: 2"),
      count(E, "explore", "mercer", 3, "Mercer Spheres: 3"),
      count(O, "explore", "shards", 1, "Power Shards: 1"),
      g(O, "architecture", "Foundation grid laid at the main base"),
      g(O, "architecture", "Lookout Tower on high ground"),
      g(O, "logistics", "A storage wall by the HUB, one container per part"),
      g(O, "explore", "3 crash sites found"),
      g(O, "mam", "Nutrients tree finished"),
    ],
    p2: [
      g(M, "milestone", "Milestone: Part Assembly"),
      make(M, "elevator", "Smart Plating automated", ["Smart Plating"]),
      g(M, "elevator", "Space Elevator Phase 1 shipped (50 Smart Plating)"),
      g(E, "milestone", "Milestone: Resource Sink Bonus Program, all overflow reaches the sink"),
      g(E, "mam", "Smart Splitters researched and on every module"),
      g(E, "milestone", "Milestones: Logistics Mk.2 and Obstacle Clearing"),
      make(E, "production", "Reinforced Iron Plate, Rotor and Modular Frame automated (Tier 3 needs lots)", ["Reinforced Iron Plate", "Rotor", "Modular Frame"]),
      count(E, "alts", "harddrives", 4, "Hard drives researched: 4"),
      count(O, "explore", "mercer", 6, "Mercer Spheres: 6"),
      count(O, "explore", "shards", 3, "Power Shards: 3"),
      g(O, "production", "Conveyor Throughput Monitor bought"),
      g(O, "gear", "Jump Pads milestone and one jump pad route"),
      g(O, "gear", "Factory Cart bought"),
      g(O, "architecture", "Walkways over your belts"),
      g(O, "mam", "Parachute researched"),
    ],
    p3: [
      g(M, "power", "Milestone: Coal Power, 600 MW coal plant running"),
      g(M, "milestone", "Milestone: Basic Steel Production"),
      make(M, "production", "Steel Beam and Steel Pipe automated", ["Steel Beam", "Steel Pipe"]),
      make(M, "elevator", "Versatile Framework automated", ["Versatile Framework"]),
      g(E, "logistics", "Dimensional Depot unlocked, first uploader running"),
      make(E, "logistics", "Reanimated SAM automated", ["Reanimated SAM"]),
      g(E, "logistics", "Milestone: Vehicular Transport, one Tractor route at a steady rate"),
      count(E, "alts", "alts", 2, "Alternate recipes owned: 2"),
      count(E, "alts", "harddrives", 6, "Hard drives researched: 6"),
      count(E, "explore", "mercer", 10, "Mercer Spheres: 10"),
      count(O, "explore", "sloops", 3, "Somersloops: 3"),
      count(O, "explore", "shards", 6, "Power Shards: 6"),
      g(O, "milestone", "Milestone: Enhanced Asset Security"),
      g(O, "power", "Second coal plant (1200 MW total)"),
      g(O, "architecture", "Coal plant with walls, a roof and lights"),
      g(O, "mam", "Quartz tree: Priority Merger and the Explorer"),
      g(O, "mam", "Sulfur tree: Nobelisk Detonator"),
      g(O, "gear", "Blade Runners"),
    ],
    p4: [
      g(M, "milestone", "Milestone: Advanced Steel Production"),
      make(M, "elevator", "Automated Wiring automated", ["Automated Wiring"]),
      g(M, "elevator", "Space Elevator Phase 2 shipped (1000 Smart Plating, 1000 Versatile Framework, 100 Automated Wiring)"),
      g(E, "architecture", "Milestone: FICSIT Blueprints, 2 blueprints saved"),
      g(E, "milestone", "Milestone: Logistics Mk.3"),
      make(E, "elevator", "Smart Plating scaled up for Phase 2", ["Smart Plating"]),
      make(E, "production", "Motors automated (Tier 5 needs about 250)", ["Motor"]),
      count(E, "alts", "alts", 4, "Alternate recipes owned: 4"),
      count(E, "explore", "mercer", 15, "Mercer Spheres: 15"),
      count(O, "alts", "harddrives", 8, "Hard drives researched: 8"),
      count(O, "explore", "shards", 10, "Power Shards: 10"),
      g(O, "gear", "A hypertube to one of your outposts"),
      g(O, "power", "Power Storage on the grid"),
      g(O, "logistics", "Depot Expansion (200%) and Upload 30/min"),
      g(O, "architecture", "Your first two-floor factory"),
      g(O, "mam", "Zipline researched"),
    ],
    p5: [
      g(M, "milestone", "Milestone: Oil Processing"),
      make(M, "production", "Plastic and Rubber automated at the oil field", ["Plastic", "Rubber"]),
      g(M, "power", "Milestone: Petroleum Power, 1000 MW fuel plant running"),
      make(M, "production", "Circuit Boards automated", ["Circuit Board"]),
      g(E, "logistics", "Milestone: Logistics Mk.4, one Truck route with the Buffer Rule"),
      g(E, "power", "Grid at 1600 MW or more"),
      make(E, "power", "Fuel production for the generators", ["Fuel"]),
      count(E, "alts", "alts", 6, "Alternate recipes owned: 6 (try for the oil loop)"),
      count(E, "alts", "harddrives", 12, "Hard drives researched: 12"),
      count(E, "explore", "sloops", 5, "Somersloops: 5"),
      count(O, "explore", "mercer", 20, "Mercer Spheres: 20"),
      g(O, "gear", "Jetpack"),
      g(O, "milestone", "Milestone: Fluid Packaging"),
      make(O, "production", "Quickwire automated", ["Quickwire"]),
      g(O, "power", "Geothermal Generator on a geyser"),
      g(O, "gear", "Explorer trip to bauxite and uranium"),
      g(O, "architecture", "Oil outpost raised on pillars"),
      g(O, "mam", "Smokeless Powder and the Rifle"),
    ],
    p6: [
      g(M, "milestone", "Milestone: Industrial Manufacturing"),
      make(M, "elevator", "Modular Engines automated", ["Modular Engine"]),
      make(M, "production", "Computers and Heavy Modular Frames automated", ["Computer", "Heavy Modular Frame"]),
      make(M, "elevator", "Adaptive Control Units automated", ["Adaptive Control Unit"]),
      g(M, "elevator", "Space Elevator Phase 3 shipped (2500 Versatile Framework, 500 Modular Engine, 100 ACU)"),
      g(E, "logistics", "Milestone: Monorail Train Technology, one train line with the Buffer Rule"),
      g(E, "power", "Grid at 2600 MW or more"),
      count(E, "alts", "alts", 10, "Alternate recipes owned: 10"),
      count(E, "explore", "mercer", 25, "Mercer Spheres: 25"),
      g(E, "explore", "A Somersloop doubling one machine's output"),
      count(O, "explore", "sloops", 8, "Somersloops: 8"),
      count(O, "explore", "shards", 15, "Power Shards: 15"),
      g(O, "logistics", "Railway Signalling and a second train"),
      g(O, "milestone", "Milestones: Pipeline Engineering Mk.2 and FICSIT Blueprints Mk.2"),
      g(O, "logistics", "Depot Expansion (300%) and Upload 60/min"),
      g(O, "gear", "Personnel Elevator in your tallest factory"),
      g(O, "mam", "Radar Tower built"),
      g(O, "mam", "Extra inventory slots researched"),
      g(O, "architecture", "Train stations with roofs and platforms"),
      g(O, "production", "50 coupons banked"),
    ],
    p7: [
      g(M, "milestone", "Milestone: Bauxite Refinement"),
      make(M, "production", "Aluminum Ingots automated, with the water loop", ["Aluminum Ingot"]),
      make(M, "production", "Alclad Aluminum Sheet and Aluminum Casing automated", ["Alclad Aluminum Sheet", "Aluminum Casing"]),
      g(M, "milestone", "Milestone: Control System Development"),
      make(E, "production", "Supercomputers automated", ["Supercomputer"]),
      g(E, "milestone", "Milestone: Logistics Mk.5"),
      g(E, "power", "Turbofuel researched and burning"),
      count(E, "alts", "alts", 14, "Alternate recipes owned: 14"),
      count(E, "alts", "harddrives", 20, "Hard drives researched: 20"),
      g(O, "gear", "Hoverpack"),
      g(O, "gear", "Gas Mask and Hazmat Suit"),
      make(O, "production", "Batteries automated", ["Battery"]),
      g(O, "gear", "Cyber Wagon"),
      count(O, "explore", "mercer", 40, "Mercer Spheres: 40"),
      count(O, "explore", "sloops", 12, "Somersloops: 12"),
      g(O, "architecture", "Windows on the aluminum plant"),
      g(O, "logistics", "Upload 120/min"),
    ],
    p8: [
      g(M, "milestone", "Milestones: Advanced Aluminum Production, Nuclear Power, Leading-Edge Production, Particle Enrichment"),
      make(M, "elevator", "Assembly Director Systems automated", ["Assembly Director System"]),
      make(M, "elevator", "Magnetic Field Generators automated", ["Magnetic Field Generator"]),
      make(M, "elevator", "Thermal Propulsion Rockets automated", ["Thermal Propulsion Rocket"]),
      make(M, "elevator", "Nuclear Pasta automated", ["Nuclear Pasta"]),
      g(M, "elevator", "Space Elevator Phase 4 shipped (500 ADS, 500 MFG, 250 TPR, 100 Nuclear Pasta)"),
      g(E, "power", "Grid at 3700 MW or more"),
      g(E, "explore", "A Resource Well tapped for nitrogen"),
      make(E, "production", "Radio Control Units automated (Matter Conversion needs 250)", ["Radio Control Unit"]),
      count(E, "alts", "alts", 18, "Alternate recipes owned: 18"),
      g(O, "power", "A nuclear waste plan, then reactors"),
      g(O, "gear", "A drone route"),
      count(O, "explore", "mercer", 60, "Mercer Spheres: 60"),
      count(O, "explore", "sloops", 20, "Somersloops: 20"),
      count(O, "explore", "shards", 25, "Power Shards: 25"),
      g(O, "logistics", "Depot Expansion (400%) and Upload 240/min"),
      g(O, "architecture", "A bridge between two factory buildings"),
    ],
    p9: [
      g(M, "milestone", "Milestones: Matter Conversion, Quantum Encoding, Spatial Energy Regulation"),
      make(M, "elevator", "Biochemical Sculptors automated", ["Biochemical Sculptor"]),
      make(M, "elevator", "AI Expansion Servers automated", ["AI Expansion Server"]),
      make(M, "elevator", "Ballistic Warp Drives automated", ["Ballistic Warp Drive"]),
      make(M, "elevator", "Nuclear Pasta scaled up for Phase 5", ["Nuclear Pasta"]),
      g(M, "elevator", "Space Elevator Phase 5 shipped (1000 Nuclear Pasta, 1000 Biochemical Sculptor, 256 AI Expansion Server, 200 Ballistic Warp Drive)"),
      g(E, "power", "Grid at 6000 MW or more"),
      make(E, "production", "Time Crystals automated", ["Time Crystal"]),
      g(O, "milestone", "Milestone: Peak Efficiency, Mk.6 belts"),
      g(O, "power", "Ficsonium closing the nuclear waste loop"),
      g(O, "power", "Alien Power Augmenter running"),
      g(O, "mam", "Synthetic Power Shards researched"),
      g(O, "mam", "Every reachable MAM node researched"),
      g(O, "gear", "Golden Factory Cart"),
      count(O, "explore", "mercer", 100, "Mercer Spheres: 100"),
      count(O, "explore", "sloops", 30, "Somersloops: 30"),
      g(O, "architecture", "A viewing deck at the Space Elevator"),
      g(O, "logistics", "Depot Expansion (500%)"),
    ],
  };

  // Stable ids: tier + position within its level and tag never shift when a goal is added elsewhere.
  window.GOALS = {};
  Object.keys(tiers).forEach(function (tid) {
    const seen = {};
    window.GOALS[tid] = tiers[tid].map(function (goal) {
      const base = tid + ":" + goal.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
      seen[base] = (seen[base] || 0) + 1;
      return Object.assign({ id: seen[base] > 1 ? base + "-" + seen[base] : base }, goal);
    });
  });
})();
