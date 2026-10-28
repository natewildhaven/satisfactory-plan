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

window.GOAL_LEVELS = [
  { id: "mandatory", label: "Mandatory", icon: "🔴", hint: "The core path to Project Assembly" },
  { id: "encouraged", label: "Encouraged", icon: "🔵", hint: "Good habits for how you like to play" },
  { id: "optional", label: "Optional", icon: "⚪", hint: "Fun, exploring and extras" },
];

(function () {
  function g(level, tag, text, extra) {
    return Object.assign({ level: level, tag: tag, text: text }, extra || {});
  }
  function count(level, tag, counter, target, text) {
    return g(level, tag, text, { counter: counter, target: target });
  }
  const M = "mandatory", E = "encouraged", O = "optional";

  const tiers = {
    p0: [
      g(M, "milestone", "Place the HUB within belt distance of iron, copper and limestone"),
      g(M, "power", "3 Biomass Burners running (90 MW)"),
      g(M, "production", "Iron Plate, Iron Rod and Screws automated"),
      g(M, "production", "Wire and Cable automated"),
      g(M, "production", "Concrete automated"),
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
      g(M, "elevator", "Smart Plating automated"),
      g(M, "elevator", "Space Elevator Phase 1 shipped (50 Smart Plating)"),
      g(E, "milestone", "Milestone: Resource Sink Bonus Program, all overflow reaches the sink"),
      g(E, "mam", "Smart Splitters researched and on every module"),
      g(E, "milestone", "Milestones: Logistics Mk.2 and Obstacle Clearing"),
      g(E, "production", "Reinforced Iron Plate, Rotor and Modular Frame automated (Tier 3 needs lots)"),
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
      g(M, "production", "Steel Beam and Steel Pipe automated"),
      g(M, "elevator", "Versatile Framework automated"),
      g(E, "logistics", "Dimensional Depot unlocked, first uploader running"),
      g(E, "logistics", "Reanimated SAM automated"),
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
      g(M, "elevator", "Automated Wiring automated"),
      g(M, "elevator", "Space Elevator Phase 2 shipped (1000 Smart Plating, 1000 Versatile Framework, 100 Automated Wiring)"),
      g(E, "architecture", "Milestone: FICSIT Blueprints, 2 blueprints saved"),
      g(E, "milestone", "Milestone: Logistics Mk.3"),
      g(E, "elevator", "Smart Plating at 5/min or more"),
      g(E, "production", "Motors automated (Tier 5 needs about 250)"),
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
      g(M, "production", "Plastic and Rubber automated at the oil field"),
      g(M, "power", "Milestone: Petroleum Power, 1000 MW fuel plant running"),
      g(M, "production", "Circuit Boards automated"),
      g(E, "logistics", "Milestone: Logistics Mk.4, one Truck route with the Buffer Rule"),
      g(E, "power", "Grid at 1600 MW or more"),
      count(E, "alts", "alts", 6, "Alternate recipes owned: 6 (try for the oil loop)"),
      count(E, "alts", "harddrives", 12, "Hard drives researched: 12"),
      count(E, "explore", "sloops", 5, "Somersloops: 5"),
      count(O, "explore", "mercer", 20, "Mercer Spheres: 20"),
      g(O, "gear", "Jetpack"),
      g(O, "milestone", "Milestone: Fluid Packaging"),
      g(O, "production", "Quickwire automated"),
      g(O, "power", "Geothermal Generator on a geyser"),
      g(O, "gear", "Explorer trip to bauxite and uranium"),
      g(O, "architecture", "Oil outpost raised on pillars"),
      g(O, "mam", "Smokeless Powder and the Rifle"),
    ],
    p6: [
      g(M, "milestone", "Milestone: Industrial Manufacturing"),
      g(M, "elevator", "Modular Engines automated"),
      g(M, "production", "Computers and Heavy Modular Frames automated"),
      g(M, "elevator", "Adaptive Control Units automated"),
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
      g(M, "production", "Aluminum Ingots automated, with the water loop"),
      g(M, "production", "Alclad Aluminum Sheet and Aluminum Casing automated"),
      g(M, "milestone", "Milestone: Control System Development"),
      g(E, "production", "Supercomputers automated"),
      g(E, "milestone", "Milestone: Logistics Mk.5"),
      g(E, "power", "Turbofuel researched and burning"),
      count(E, "alts", "alts", 14, "Alternate recipes owned: 14"),
      count(E, "alts", "harddrives", 20, "Hard drives researched: 20"),
      g(O, "gear", "Hoverpack"),
      g(O, "gear", "Gas Mask and Hazmat Suit"),
      g(O, "production", "Batteries automated"),
      g(O, "gear", "Cyber Wagon"),
      count(O, "explore", "mercer", 40, "Mercer Spheres: 40"),
      count(O, "explore", "sloops", 12, "Somersloops: 12"),
      g(O, "architecture", "Windows on the aluminum plant"),
      g(O, "logistics", "Upload 120/min"),
    ],
    p8: [
      g(M, "milestone", "Milestones: Advanced Aluminum Production, Nuclear Power, Leading-Edge Production, Particle Enrichment"),
      g(M, "elevator", "Assembly Director Systems automated"),
      g(M, "elevator", "Magnetic Field Generators automated"),
      g(M, "elevator", "Thermal Propulsion Rockets automated"),
      g(M, "elevator", "Nuclear Pasta automated"),
      g(M, "elevator", "Space Elevator Phase 4 shipped (500 ADS, 500 MFG, 250 TPR, 100 Nuclear Pasta)"),
      g(E, "power", "Grid at 3700 MW or more"),
      g(E, "explore", "A Resource Well tapped for nitrogen"),
      g(E, "production", "Radio Control Units automated (Matter Conversion needs 250)"),
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
      g(M, "elevator", "Biochemical Sculptors automated"),
      g(M, "elevator", "AI Expansion Servers automated"),
      g(M, "elevator", "Ballistic Warp Drives automated"),
      g(M, "elevator", "Space Elevator Phase 5 shipped (1000 Nuclear Pasta, 1000 Biochemical Sculptor, 256 AI Expansion Server, 200 Ballistic Warp Drive)"),
      g(E, "power", "Grid at 6000 MW or more"),
      g(E, "production", "Time Crystals automated"),
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
