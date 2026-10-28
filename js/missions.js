// The guide itself.
//
// Each tier is fully visible once unlocked. Missions in a tier can be reordered
// (focus picker or drag), but never ahead of what they `requires`.
// `optional` missions don't block the next tier.
//
// kind: milestone | production | power | elevator | logistics | alts | explore | mam | gear
// time: rough minutes of play
// calc: { targets, supplied, useAlts, forceAlts }
//   targets  - default rates per minute; editable on the goal board
//   supplied - parts brought in from elsewhere instead of built here
//   useAlts  - owned alternates this module may switch to
//   forceAlts- recipes this module always uses (e.g. Turbofuel, unlocked in the MAM)
// suggestAlts: alternates worth hunting before building this
// produces: MW this mission adds to the grid (replaces: missions whose power it retires)
// steps: plain strings, or { alt: "...", text } shown only when that alternate is owned,
//        or { notAlt: "...", text } shown only when it isn't.
// Milestone and MAM costs are copied from 1.x game data.

window.FOCUS = [
  { id: "balanced", label: "Balanced", icon: "⚖" },
  { id: "production", label: "Production", icon: "🏭" },
  { id: "power", label: "Power", icon: "⚡" },
  { id: "elevator", label: "Space Elevator", icon: "🚀" },
  { id: "logistics", label: "Logistics & Depot", icon: "🚚" },
  { id: "alts", label: "Alternate recipes", icon: "💾" },
  { id: "explore", label: "Exploration", icon: "🧭" },
  { id: "mam", label: "MAM research", icon: "🔬" },
  { id: "gear", label: "Vehicles & gear", icon: "🛻" },
];

window.PHASES = [
  {
    id: "p0",
    title: "Landing",
    tier: "Tier 0 · HUB Upgrades",
    blurb: "Get the HUB running and build your first real production lines. Every machine you place here gets reused for a long time.",
    power: 90,
    missions: [
      {
        id: "p0-land", kind: "milestone", time: 15,
        title: "Land and claim your patch",
        goal: "HUB built next to iron, copper and limestone",
        steps: [
          "Land in the Rocky Desert. Before you unpack, walk the start area and find **one iron, one copper and one limestone node** close together.",
          "Build the HUB on flat ground that's within belt distance of all three, but **not on top of them**.",
          "Hand-mine about 50 Iron Ore and craft Iron Ingots → Iron Rods at the Craft Bench.",
          "Turn in **HUB Upgrade 1**: 10 Iron Rod.",
        ],
      },
      {
        id: "p0-hub2-4", kind: "milestone", time: 30, requires: ["p0-land"],
        title: "HUB Upgrades 2–4 (hand-crafted)",
        goal: "Smelter, Constructor and Conveyor Belts unlocked",
        steps: [
          "Place the Portable Miners from Upgrade 1 on iron and copper, so ore piles up while you craft.",
          "**HUB Upgrade 2**: 20 Iron Rod, 10 Iron Plate (unlocks Smelter, Wire, Cable).",
          "**HUB Upgrade 3**: 20 Iron Plate, 20 Iron Rod, 20 Wire (unlocks Constructor, Concrete, Screws).",
          "**HUB Upgrade 4**: 75 Iron Plate, 20 Cable, 10 Concrete (unlocks Conveyor Belts).",
          "Feed the HUB's built-in Biomass Burner leaves and wood from the area.",
        ],
      },
      {
        id: "p0-hub5", kind: "milestone", time: 15, requires: ["p0-hub2-4"],
        title: "HUB Upgrade 5: Miners",
        goal: "Miner Mk.1 and Storage Container unlocked",
        steps: [
          "**HUB Upgrade 5**: 75 Iron Rod, 50 Cable, 20 Concrete.",
          "From now on, ore comes from Miners. A **Mk.1 Miner** gives 30 / 60 / 120 ore/min on an impure / normal / pure node.",
        ],
      },
      {
        id: "p0-iron", kind: "production", time: 30, requires: ["p0-hub5"],
        title: "Build Module: Starter Iron",
        goal: "Iron Plate, Iron Rod and Screws from one normal iron node",
        steps: [
          "Put a Mk.1 Miner on a **normal iron node** (60 ore/min).",
          "Build it floor by floor using the plan below. Set every clock exactly as shown.",
          "Belt every output into its own Storage Container next to the HUB.",
          "If the power trips, finish this module before starting the next one. Real power comes in Tier 3.",
        ],
        calc: { targets: { "Iron Plate": 20, "Iron Rod": 15, Screws: 60 }, useAlts: ["Alternate: Cast Screws"] },
      },
      {
        id: "p0-copper", kind: "production", time: 25, requires: ["p0-hub5"],
        title: "Build Module: Starter Copper",
        goal: "Wire and Cable from one normal copper node",
        steps: [
          "Put a Mk.1 Miner on a **normal copper node** (60 ore/min).",
          "Build the machines from the plan below. Half the wire goes to storage and half feeds the Cable constructor.",
          "Belt Wire and Cable into storage.",
        ],
        calc: { targets: { Wire: 60, Cable: 30 } },
      },
      {
        id: "p0-concrete", kind: "production", time: 15, requires: ["p0-hub5"],
        title: "Build Module: Concrete",
        goal: "Concrete from one normal limestone node",
        steps: [
          "Put a Mk.1 Miner on a **normal limestone node** (60/min).",
          "Build the Constructors below at the exact clock shown, then belt them to storage.",
        ],
        calc: { targets: { Concrete: 20 } },
      },
      {
        id: "p0-hub6", kind: "milestone", time: 20, requires: ["p0-iron", "p0-copper", "p0-concrete"], produces: 90,
        title: "HUB Upgrade 6: Space Elevator",
        goal: "Space Elevator placed, 3 Biomass Burners running, Tier 1 open",
        steps: [
          "**HUB Upgrade 6**: 100 Iron Rod, 100 Iron Plate, 100 Wire, 50 Concrete.",
          "Build the **Space Elevator** somewhere central with room around it. It's a permanent landmark, so take your time choosing the spot.",
          "Build **3 Biomass Burners** (30 MW each, 90 MW total). Each burns 10 Biomass/min. Keep them fed by hand until Coal Power in Tier 3.",
        ],
      },
      {
        id: "p0-scout", kind: "explore", time: 20, optional: true,
        title: "Scout the desert",
        goal: "Map stamps on every node and crash site nearby",
        steps: [
          "Climb the tallest rock near the HUB and put map stamps on every node type you can see.",
          "Stamp any **crash sites** (hard drives) and **Mercer Spheres** (purple pulsing orbs) for later.",
          "Note any **Power Slugs** (glowing blue, yellow or purple blobs). You'll want them in Tier 1.",
        ],
      },
    ],
  },
  {
    id: "p1",
    title: "Groundwork",
    tier: "Tier 1",
    blurb: "Three small milestones, then the MAM opens. Your starter modules already make everything they need. You just collect it and walk to the HUB.",
    power: 90,
    missions: [
      {
        id: "p1-base", kind: "milestone", time: 10,
        title: "Milestone: Base Building",
        goal: "Foundations unlocked",
        steps: [
          "Turn in **Base Building**: 200 Concrete, 100 Iron Plate, 100 Iron Rod.",
          "Put foundations under your starter modules if you like. Grid-snapped foundations make every later blueprint line up.",
        ],
      },
      {
        id: "p1-logistics", kind: "milestone", time: 10,
        title: "Milestone: Logistics",
        goal: "Splitters, Mergers and Conveyor Lifts unlocked",
        steps: [
          "Turn in **Logistics**: 150 Iron Plate, 150 Iron Rod, 300 Wire.",
          "Add the **storage-with-overflow** splitter to each module (Rules tab, *Overflow before Smart Splitters*).",
        ],
      },
      {
        id: "p1-field", kind: "milestone", time: 15,
        title: "Milestone: Field Research (the MAM)",
        goal: "MAM built next to the HUB",
        steps: [
          "Turn in **Field Research**: 300 Wire, 300 Screws, 100 Iron Plate.",
          "Build the **MAM** next to the HUB.",
        ],
      },
      {
        id: "p1-mam-roots", kind: "mam", time: 15, requires: ["p1-field"],
        title: "MAM: open the research trees",
        goal: "Every tree you can reach in Peaceful mode has its first node done",
        steps: [
          "Research the first node of each tree as you find the samples: **Mercer Sphere Analysis** (1 Mercer Sphere), **SAM Analysis** (10 SAM), **Caterium** (10 Caterium Ore), **Quartz** (10 Raw Quartz), **Sulfur** (10 Sulfur), **Mycelia** (5 Mycelia), **Paleberry** (2 Paleberry).",
          "Each one adds that resource to your Object Scanner, which makes the rest of the game's hunting easier.",
          "Peaceful mode has no hostile creatures, so the **Alien Organisms** tree (and anything needing Alien Protein) can't be finished. Skip it without guilt.",
        ],
      },
      {
        id: "p1-hd", kind: "alts", time: 30, optional: true, requires: ["p1-field"],
        title: "Hard drive hunt #1",
        goal: "First 2 hard drives researched",
        steps: [
          "Visit 2 crash sites you stamped. Some need power or a few parts to open. Note what each asks for and come back with it.",
          "In the MAM, research each **Hard Drive**. It offers a choice of alternates.",
          "Hoping for: **Cast Screws** (screws straight from ingots) or **Stitched Iron Plate**. If neither shows up, take the highest one on the Alternates tab pick-list.",
          "Tick what you got on the **Alternates** tab. Built modules will offer an upgrade where it helps.",
        ],
      },
      {
        id: "p1-slugs", kind: "explore", time: 30, optional: true, requires: ["p1-field"],
        title: "Power Slugs: first shard",
        goal: "Overclocking unlocked",
        steps: [
          "Grab a **Blue Power Slug** and research **Blue Power Slugs** in the MAM. You can now turn slugs into Power Shards.",
          "Research **Slug Scanning** (50 Iron Rod, 100 Wire, 200 Screws) so the scanner finds slugs, and **Overclock Production** (1 Power Shard, 50 Iron Plate, 50 Wire).",
          "Keep the shards. One good use later: overclock a miner to 250% instead of building a second one.",
        ],
      },
      {
        id: "p1-spheres", kind: "explore", time: 30, optional: true,
        title: "Mercer Sphere hunt #1",
        goal: "5+ Mercer Spheres in storage",
        steps: [
          "Set the Object Scanner to **Mercer Sphere** and sweep the area around your base.",
          "Collect 5+. One is for analysis, the rest go toward the Depot in Tier 3.",
        ],
      },
      {
        id: "p1-nutrients", kind: "mam", time: 20, optional: true, requires: ["p1-field"],
        title: "MAM: Nutrients tree",
        goal: "Nutrients tree complete",
        steps: [
          "Research **Paleberry** (2), **Beryl Nut** (5) and **Bacon Agaric** (1) as you find them.",
          "Then **Nutritional Processor** (25 Modular Frame, 50 Steel Pipe, 500 Wire) and **Nutritional Inhaler** once you have steel later.",
        ],
      },
    ],
  },
  {
    id: "p2",
    title: "Assembly Line",
    tier: "Tier 2 · Space Elevator Phase 1",
    blurb: "Assemblers arrive. One small Smart Plating line pays off Phase 1 of the Space Elevator, the AWESOME Sink starts turning overflow into coupons, and a Caterium trip gets you Smart Splitters.",
    power: 90,
    missions: [
      {
        id: "p2-parts", kind: "milestone", time: 10,
        title: "Milestone: Part Assembly",
        goal: "Assembler unlocked",
        steps: ["Turn in **Part Assembly**: 200 Cable, 200 Iron Rod, 500 Screws, 300 Iron Plate."],
      },
      {
        id: "p2-sink", kind: "milestone", time: 20,
        title: "Milestone: Resource Sink Bonus Program",
        goal: "AWESOME Sink built, overflow earns coupons",
        steps: [
          "Turn in **Resource Sink Bonus Program**: 400 Concrete, 500 Wire, 200 Iron Rod, 200 Iron Plate.",
          "Build the AWESOME Sink near your storage. From now on, **every module's overflow ends at the sink**.",
          "First coupons: buy the **Conveyor Throughput Monitor** (5 coupons). It shows the exact items/min on a belt, so you can check your modules hit their numbers.",
        ],
      },
      {
        id: "p2-smart", kind: "elevator", time: 45, requires: ["p2-parts"], suggestAlts: ["Alternate: Cast Screws"],
        title: "Build Module: Smart Plating",
        goal: "Smart Plating from a dedicated iron node",
        steps: [
          "Use a **second normal iron node** and clock its miner to the iron ore rate in the box (46.5/min at the default 2/min is **77.5%** of 60).",
          "Build it floor by floor: smelters → rods/plates → screws → RIP and Rotor assemblers → Smart Plating.",
          "Smart Plating goes to a storage container. Overflow goes to the sink.",
        ],
        calc: { targets: { "Smart Plating": 2 }, useAlts: ["Alternate: Cast Screws"] },
      },
      {
        id: "p2-elev1", kind: "elevator", time: 30, requires: ["p2-smart"],
        title: "Ship Space Elevator Phase 1",
        goal: "Tiers 3 and 4 unlocked",
        steps: [
          "Collect **50 Smart Plating**. Work on the next milestone while it fills.",
          "Load them into the Space Elevator and send it.",
          "All Space Elevator amounts in this guide assume the default cost setting. If you changed *Space Elevator cost* in Advanced Game Settings, go by the numbers on the elevator screen.",
        ],
      },
      {
        id: "p2-logmk2", kind: "milestone", time: 10, requires: ["p2-parts"],
        title: "Milestone: Logistics Mk.2",
        goal: "Mk.2 belts (120/min) unlocked",
        steps: ["Turn in **Logistics Mk.2**: 50 Reinforced Iron Plate, 200 Concrete, 300 Iron Rod, 300 Iron Plate."],
      },
      {
        id: "p2-clear", kind: "milestone", time: 15,
        title: "Milestone: Obstacle Clearing",
        goal: "Chainsaw and Solid Biofuel unlocked",
        steps: [
          "Turn in **Obstacle Clearing**: 500 Screws, 100 Cable, 100 Concrete.",
          "Chainsaw the trees and bushes around your build area. That gives you free biomass for the burners.",
        ],
      },
      {
        id: "p2-caterium", kind: "mam", time: 60, requires: ["p2-parts"],
        title: "Caterium trip → Smart Splitter",
        goal: "Smart Splitters on every module",
        steps: [
          "Find a Caterium node with the scanner and carry back about 400 Caterium Ore.",
          "MAM: **Caterium Ingots** (50 Caterium Ore) → **Quickwire** (50 Caterium Ingot) → **AI Limiter** (200 Quickwire, 50 Copper Sheet) → **Smart Splitter** (10 AI Limiter, 50 Reinforced Iron Plate).",
          "Hand-craft the Caterium parts at the Craft Bench. You don't need a factory for this yet.",
          "Swap each module's overflow splitter for a Smart Splitter (Rules tab, *Overflow*).",
        ],
      },
      {
        id: "p2-hd", kind: "alts", time: 40, optional: true,
        title: "Hard drive hunt #2",
        goal: "2 more hard drives researched",
        steps: [
          "Hoping for: **Cast Screws**, **Stitched Iron Plate**. Otherwise take the highest-ranked option on the Alternates tab.",
          "Tick what you got. The Smart Plating module will offer an upgrade if it helps.",
        ],
      },
      {
        id: "p2-jump", kind: "gear", time: 20, optional: true, requires: ["p2-parts"],
        title: "Try it: Jump Pads",
        goal: "A jump pad route up a cliff near base",
        steps: [
          "Turn in **Jump Pads**: 50 Rotor, 300 Iron Plate, 150 Cable.",
          "Build a Jump Pad and a U-Jelly Landing Pad somewhere useful, like up the cliff to a node.",
        ],
      },
      {
        id: "p2-cart", kind: "gear", time: 10, optional: true, requires: ["p2-sink"],
        title: "Try it: Factory Cart",
        goal: "Factory Cart bought and driven",
        steps: [
          "Buy the **FICSIT Factory Cart** in the AWESOME Shop (10 coupons). It's the quickest way around a big factory floor.",
        ],
      },
    ],
  },
  {
    id: "p3",
    title: "Coal & Steel",
    tier: "Tier 3",
    blurb: "Real power, your first steel outpost, the Dimensional Depot and your first vehicle route.",
    power: 690,
    missions: [
      {
        id: "p3-coalms", kind: "milestone", time: 10,
        title: "Milestone: Coal Power",
        goal: "Coal Generators and Water Extractors unlocked",
        steps: ["Turn in **Coal Power**: 150 Reinforced Iron Plate, 50 Rotor, 500 Cable."],
      },
      {
        id: "p3-coalplant", kind: "power", time: 60, requires: ["p3-coalms"], produces: 600, replaces: ["p0-hub6"],
        title: "Build Outpost: 600 MW Coal Plant",
        goal: "8 Coal Generators at 100% = 600 MW",
        steps: [
          "Find a coal node near water. Coal needed: **8 × 15 = 120 coal/min** (normal node with Mk.2, or a pure node with Mk.1, or two normal nodes with Mk.1).",
          "Water needed: **8 × 45 = 360 m³/min**, exactly **3 Water Extractors at 100%** (120 each).",
          "Run one Mk.1 pipe (300 m³/min max) from two extractors to gens 1–5, and a second pipe from extractor 3 to gens 6–8.",
          "Two floors work well: extractors and pumps below, generators above.",
          "Fill the coal belt before connecting power. Your Biomass Burners can retire now.",
        ],
      },
      {
        id: "p3-steelms", kind: "milestone", time: 15,
        title: "Milestone: Basic Steel Production",
        goal: "Foundry, Steel Beam, Steel Pipe, Versatile Framework",
        steps: ["Turn in **Basic Steel Production**: 50 Modular Frame, 150 Rotor, 500 Concrete, 1000 Wire. (Hand-craft the Modular Frames.)"],
      },
      {
        id: "p3-hd-steel", kind: "alts", time: 45, optional: true, requires: ["p3-steelms"],
        title: "Hard drive hunt: Solid Steel Ingot",
        goal: "Try for Solid Steel Ingot before building the steel outpost",
        steps: [
          "**Strongly suggested before the steel outpost.** Solid Steel Ingot makes 60 steel ingots from 40 iron ingots + 40 coal, compared with 45 from 45 ore + 45 coal.",
          "Research 2–3 hard drives. Also good if offered: **Steeled Frame**, **Steel Screws**, **Iron Alloy Ingot**.",
          "No luck? Build with standard steel anyway. If you get it later, an upgrade mission will appear.",
        ],
      },
      {
        id: "p3-steel", kind: "production", time: 60, requires: ["p3-steelms"], suggestAlts: ["Alternate: Solid Steel Ingot"],
        title: "Build Outpost: Steel at the node",
        goal: "Steel Beam + Steel Pipe made where iron and coal meet",
        steps: [
          "Find an iron node and a coal node close together, so ore never travels.",
          { notAlt: "Alternate: Solid Steel Ingot", text: "Run both miners at the rates in the box. A normal node with Mk.1 gives 60, so use 2 nodes or wait for Mk.2." },
          { alt: "Alternate: Solid Steel Ingot", text: "With **Solid Steel Ingot**: smelt iron first (ground floor), then foundries take ingots + coal on the floor above." },
          "Send output to storage, with overflow to the sink.",
        ],
        calc: { targets: { "Steel Beam": 15, "Steel Pipe": 20 }, useAlts: ["Alternate: Solid Steel Ingot"] },
      },
      {
        id: "p3-sam", kind: "logistics", time: 45, requires: ["p3-steel"],
        title: "Build Outpost: Reanimated SAM",
        goal: "Reanimated SAM for SAM Fluctuators",
        steps: [
          "MAM: **SAM Reanimation** (20 SAM), then **SAM Fluctuator** (10 Reanimated SAM, 100 Steel Pipe, 200 Wire).",
          "Find a SAM node with the scanner. A Mk.1 Miner on a **normal** node gives exactly the 60 SAM/min this needs.",
          "Build the constructor below and belt it into a storage container.",
        ],
        calc: { targets: { "Reanimated SAM": 15 } },
      },
      {
        id: "p3-depot", kind: "logistics", time: 30, requires: ["p3-sam"],
        title: "Unlock the Dimensional Depot",
        goal: "Building materials upload to the cloud. No more trips to base.",
        steps: [
          "Hand-craft **11 SAM Fluctuators** (each: 6 Reanimated SAM, 5 Wire, 3 Steel Pipe).",
          "MAM: **Dimensional Depot** (1 Mercer Sphere, 11 SAM Fluctuator).",
          "Each **Depot Uploader** costs 1 Mercer Sphere, 10 SAM Fluctuator, 10 Modular Frame, 100 Wire. Put the first on the Iron Plate/Rod/Screw storage.",
          "Next uploaders, in priority order: Concrete → Wire/Cable → Steel Beam/Pipe → Reinforced Iron Plate.",
        ],
      },
      {
        id: "p3-vf", kind: "elevator", time: 45, requires: ["p3-steel"], suggestAlts: ["Alternate: Steeled Frame"],
        title: "Build Module: Versatile Framework",
        goal: "Versatile Framework next to the steel outpost (Phase 2 needs 1000)",
        steps: [
          "Build this right next to the steel outpost so its **Steel Beams arrive by belt**.",
          "Give it its own iron node for the Modular Frames (rate in the box).",
          "Build it floor by floor as listed. VF goes to storage and an uploader.",
        ],
        calc: { targets: { "Versatile Framework": 2.5 }, supplied: ["Steel Beam"], useAlts: ["Alternate: Steeled Frame", "Alternate: Cast Screws"] },
      },
      {
        id: "p3-vehicles", kind: "milestone", time: 10,
        title: "Milestone: Vehicular Transport",
        goal: "Tractor and Truck Station unlocked",
        steps: ["Turn in **Vehicular Transport**: 25 Modular Frame, 100 Rotor, 200 Cable, 400 Iron Plate."],
      },
      {
        id: "p3-firstroute", kind: "logistics", time: 60, requires: ["p3-vehicles", "p3-steel"],
        title: "Guided: your first vehicle route (Tractor)",
        goal: "Steel Pipe delivered to base by Tractor at a steady, exact rate",
        steps: [
          "Pick a short route: steel outpost → main base, carrying **Steel Pipe at 20/min**.",
          "Build a **Truck Station** at each end. Loading end: outpost belt → **Storage Container** → station (in Load mode). Unloading end: station (Unload mode) → Storage Container → belt to your base. This is a small version of the Buffer Rule.",
          "Build a Tractor, drive it into the loading station and press the record button. Drive the route to the unloading station, then back, and stop recording when you're back where you started.",
          "Time one full loop with a stopwatch, docking included. Enter it in the **Logistics → Route calculator** with 20 Steel Pipe/min. It tells you whether one Tractor keeps up and how much buffer you need.",
          "Watch the unloading container for 10 minutes. The belt out of it should run at a steady 20/min (check with the Throughput Monitor). That's your proof vehicles can be exact.",
        ],
      },
      {
        id: "p3-spheres", kind: "explore", time: 45, optional: true,
        title: "Mercer Sphere hunt #2",
        goal: "10+ Mercer Spheres for Depot uploaders and upgrades",
        steps: ["Collect 10+ Mercer Spheres. Each uploader costs one, and Depot upgrades need 3 → 7 → 13 → 23."],
      },
      {
        id: "p3-sloops", kind: "explore", time: 45, optional: true,
        title: "Somersloop hunt #1",
        goal: "Somersloop Analysis done, 3+ in storage",
        steps: [
          "Somersloops are rare alien artifacts. Collect them whenever the scanner shows one.",
          "MAM: **Somersloop Analysis** (1 Somersloop).",
          "Store the rest. In Tier 6 they'll **double a machine's output** (Production Amplifier).",
        ],
      },
      {
        id: "p3-slugs", kind: "explore", time: 40, optional: true,
        title: "Power Slugs: yellow and purple",
        goal: "Bigger shard recipes unlocked",
        steps: [
          "MAM: **Yellow Power Slugs** (1 Yellow Slug, 25 Rotor, 100 Cable) and **Purple Power Slugs** (1 Purple Slug, 25 Modular Frame, 100 Copper Sheet).",
          "Yellow gives 2 shards, purple gives 5. Save them for miners and generators later.",
        ],
      },
      {
        id: "p3-mam-quartz", kind: "mam", time: 45, optional: true,
        title: "MAM: Quartz tree → Priority Merger and Explorer",
        goal: "Priority Merger and the Explorer unlocked",
        steps: [
          "**Quartz Crystals** (20 Raw Quartz), **Silica** (20 Raw Quartz), **Crystal Oscillator** (100 Quartz Crystal, 50 RIP).",
          "**Material Resonance Screening** (15 Crystal Oscillator, 100 RIP) gives the **Priority Merger**: one input always goes first. Perfect for feeding byproducts before fresh supply.",
          "**The Explorer** (10 Crystal Oscillator, 100 Modular Frame). Fast off-road scout car, used in Tier 5.",
        ],
      },
      {
        id: "p3-mam-sulfur", kind: "mam", time: 30, optional: true,
        title: "MAM: Sulfur tree, first steps",
        goal: "Black Powder and the Nobelisk Detonator",
        steps: [
          "**Black Powder** (50 Sulfur, 25 Coal), **Volatile Applications** (50 Black Powder), **The Nobelisk Detonator** (50 Black Powder, 100 Steel Pipe, 200 Cable).",
          "Nobelisks clear the big boulders blocking some nodes and crash sites.",
          "**Experimental Power Generation** (25 Sulfur, 50 Modular Frame, 100 Rotor) is on this branch too.",
        ],
      },
    ],
  },
  {
    id: "p4",
    title: "Phase 2 Push",
    tier: "Tier 4 · Space Elevator Phase 2",
    blurb: "Mk.2 miners, Mk.3 belts and Blueprints. Then three calm modules that fill Phase 2 while you explore.",
    power: 690,
    missions: [
      {
        id: "p4-advsteel", kind: "milestone", time: 10,
        title: "Milestone: Advanced Steel Production",
        goal: "Miner Mk.2, Encased Industrial Beam, Stator, Motor, Automated Wiring",
        steps: [
          "Turn in **Advanced Steel Production**: 100 Steel Pipe, 100 Modular Frame, 200 Rotor, 500 Concrete.",
          "Swap Mk.1 miners for Mk.2 (double rate) only where a module needs more ore.",
        ],
      },
      {
        id: "p4-blueprints", kind: "milestone", time: 45,
        title: "Milestone: FICSIT Blueprints",
        goal: "Blueprint Designer unlocked, first blueprint saved",
        steps: [
          "Turn in **FICSIT Blueprints**: 100 Modular Frame, 200 Steel Beam, 500 Cable, 1000 Concrete.",
          "Some ideas to start with (make whichever you'll reuse): a **Smelter pair**, a **Constructor row**, an **Assembler pair** with two inputs and one output, a **lift pillar** (conveyor lift + splitter + power) for going between floors.",
          "Save one now and stamp it in your next module.",
        ],
      },
      {
        id: "p4-logmk3", kind: "milestone", time: 10,
        title: "Milestone: Logistics Mk.3",
        goal: "Mk.3 belts (270/min) + Industrial Storage Container",
        steps: ["Turn in **Logistics Mk.3**: 200 Steel Beam, 200 Steel Pipe, 400 Reinforced Iron Plate."],
      },
      {
        id: "p4-hd", kind: "alts", time: 45, optional: true,
        title: "Hard drive hunt #4",
        goal: "Look for frame and screw upgrades",
        steps: [
          "Hoping for: **Steeled Frame**, **Steel Screws**, **Encased Industrial Pipe**, **Iron Alloy Ingot**, **Copper Alloy Ingot**, **Steel Rotor**.",
          "Take the highest-ranked one offered (Alternates tab).",
        ],
      },
      {
        id: "p4-sp", kind: "elevator", time: 60, requires: ["p4-advsteel"],
        title: "Upgrade Module: Smart Plating to 5/min",
        goal: "5 Smart Plating/min. 1000 takes 200 minutes.",
        steps: [
          "Rebuild (or copy with blueprints) the Smart Plating module at the size below, floor by floor.",
          "Iron ore goes up to the rate in the box. A Mk.2 miner on a normal node gives 120.",
        ],
        calc: { targets: { "Smart Plating": 5 }, useAlts: ["Alternate: Cast Screws"] },
      },
      {
        id: "p4-aw", kind: "elevator", time: 40, requires: ["p4-advsteel"],
        title: "Build Module: Automated Wiring",
        goal: "Automated Wiring (Phase 2 needs 100)",
        steps: ["Needs steel pipe (from the steel outpost or the Depot) plus copper. Place it at a copper node."],
        calc: { targets: { "Automated Wiring": 1 }, supplied: ["Steel Pipe"], useAlts: ["Alternate: Fused Wire"] },
      },
      {
        id: "p4-elev2", kind: "elevator", time: 30, requires: ["p4-sp", "p4-aw", "p3-vf"],
        title: "Ship Space Elevator Phase 2",
        goal: "Tiers 5 and 6 unlocked",
        steps: ["Collect **1000 Smart Plating, 1000 Versatile Framework, 100 Automated Wiring**, then send it."],
      },
      {
        id: "p4-eib", kind: "production", time: 30, optional: true, requires: ["p4-advsteel"],
        title: "Build Module: Encased Industrial Beam",
        goal: "EIB for the many Tier 4–6 costs",
        steps: ["Small module next to the steel outpost (beams by belt) with concrete brought in."],
        calc: { targets: { "Encased Industrial Beam": 6 }, supplied: ["Steel Beam", "Concrete"], useAlts: ["Alternate: Encased Industrial Pipe"] },
      },
      {
        id: "p4-hyper", kind: "gear", time: 40, optional: true,
        title: "Try it: Hypertubes",
        goal: "A hypertube from base to the steel outpost",
        steps: [
          "Turn in **Hypertubes**: 50 Encased Industrial Beam, 300 Steel Pipe, 500 Copper Sheet.",
          "Build one line from the HUB to your steel outpost. Hypertubes need power at the entrance.",
        ],
      },
      {
        id: "p4-powerstore", kind: "power", time: 20, optional: true,
        title: "Milestone: Expanded Power Infrastructure",
        goal: "Power Storage as a blackout buffer",
        steps: [
          "Turn in **Expanded Power Infrastructure**: 50 Encased Industrial Beam, 100 Steel Beam, 200 Modular Frame, 2000 Wire.",
          "Put 2 Power Storage units on the grid. They charge from spare power and cover short shortages.",
        ],
      },
      {
        id: "p4-depot30", kind: "logistics", time: 20, optional: true, requires: ["p3-depot"],
        title: "Depot upgrade: Upload 30/min",
        goal: "Faster uploads",
        steps: ["MAM: **Upload Upgrade: 30/min** (3 Mercer Sphere, 47 SAM Fluctuator)."],
      },
      {
        id: "p4-mam-caterium", kind: "mam", time: 40, optional: true,
        title: "MAM: Caterium tree, part 2",
        goal: "Zipline, Blade Runners, Power Poles Mk.2, High-Speed Connector",
        steps: [
          "**Zipline** (100 Quickwire, 50 Cable): ride along power lines.",
          "**Blade Runners** (50 Silica, 10 Modular Frame): run faster and jump higher.",
          "**Power Poles Mk.2** (300 Quickwire), **Caterium Electronics** (100 Quickwire), **High-Speed Connector** (500 Quickwire, 50 Plastic, after oil).",
        ],
      },
    ],
  },
  {
    id: "p5",
    title: "Oil",
    tier: "Tier 5",
    blurb: "Oil, refined where it comes out of the ground, plus your first truck route. The same oil gives you 1000 MW of fuel power.",
    power: 1690,
    missions: [
      {
        id: "p5-oilms", kind: "milestone", time: 10,
        title: "Milestone: Oil Processing",
        goal: "Oil Extractor, Refinery, Plastic, Rubber, Fuel, Circuit Board",
        steps: ["Turn in **Oil Processing**: 50 Motor, 100 Encased Industrial Beam, 500 Steel Pipe, 500 Copper Sheet. (Craft the Motors by hand.)"],
      },
      {
        id: "p5-explorer", kind: "gear", time: 45, optional: true,
        title: "Try it: Explorer scouting run",
        goal: "Oil, bauxite and uranium sites stamped on your map",
        steps: [
          "Build an **Explorer** (needs *The Explorer* from the Quartz MAM tree).",
          "Drive out and stamp oil fields, bauxite, and a quiet spot far from base you could use for nuclear waste later.",
        ],
      },
      {
        id: "p5-hd", kind: "alts", time: 45, optional: true,
        title: "Hard drive hunt: the oil loop",
        goal: "Try for the oil alternates before building the oil outpost",
        steps: [
          "**Strongly suggested before the plastic outpost.** The best oil setup uses **Heavy Oil Residue** + **Recycled Plastic** + **Recycled Rubber** (and **Diluted Fuel** later, which needs a Blender from Tier 7).",
          "Also good now: **Silicon Circuit Board**, **Insulated Cable**, **Steel Screws**.",
        ],
      },
      {
        id: "p5-plastic", kind: "production", time: 75, requires: ["p5-oilms"], suggestAlts: ["Alternate: Heavy Oil Residue", "Alternate: Recycled Plastic", "Alternate: Recycled Rubber"],
        title: "Build Outpost: Plastic + Rubber at the oil field",
        goal: "Plastic and Rubber. Solids only leave the site.",
        steps: [
          "Pick an oil field with enough crude for the box (a pure node gives 240; clock the extractor down to the exact rate).",
          { notAlt: "Alternate: Recycled Plastic", text: "Heavy Oil Residue is a byproduct, so it gets its own **overflow**: a Fluid Buffer, or package it and sink it, so refineries never back up." },
          { alt: "Alternate: Recycled Plastic", text: "With **Recycled Plastic/Rubber**, the plastic and rubber refineries feed each other. Build both, then add fuel. Expect a slow start until the loop fills." },
          "Two floors work well: extractors and fuel/residue refineries below, plastic and rubber refineries above.",
          "Put a Depot Uploader on the Plastic and Rubber.",
        ],
        calc: { targets: { Plastic: 60, Rubber: 60 }, useAlts: ["Alternate: Heavy Oil Residue", "Alternate: Recycled Plastic", "Alternate: Recycled Rubber", "Alternate: Diluted Fuel"] },
      },
      {
        id: "p5-petrolms", kind: "milestone", time: 10, requires: ["p5-oilms"],
        title: "Milestone: Petroleum Power",
        goal: "Fuel Generator + Industrial Fluid Buffer",
        steps: ["Turn in **Petroleum Power**: 100 Motor, 100 Encased Industrial Beam, 200 Rubber, 200 Plastic."],
      },
      {
        id: "p5-fuelpower", kind: "power", time: 60, requires: ["p5-petrolms"], produces: 1000,
        title: "Build Outpost: 1000 MW Fuel Power",
        goal: "4 Fuel Generators at 100% = 1000 MW",
        steps: [
          "Fuel Generator: **250 MW** burning **20 Fuel/min**, so 4 gens need 80 Fuel/min.",
          "Build the refineries below **next to the oil**, with the generators right beside them.",
          "Byproducts get packaged and sunk, or stored for later Residual recipes.",
        ],
        calc: { targets: { Fuel: 80 }, useAlts: ["Alternate: Heavy Oil Residue", "Alternate: Diluted Fuel"] },
      },
      {
        id: "p5-logmk4", kind: "milestone", time: 10,
        title: "Milestone: Logistics Mk.4",
        goal: "Mk.4 belts (480/min) + Truck",
        steps: ["Turn in **Logistics Mk.4**: 200 Rubber, 300 Encased Industrial Beam, 400 Modular Frame."],
      },
      {
        id: "p5-truck", kind: "logistics", time: 60, requires: ["p5-logmk4", "p5-plastic"],
        title: "Guided: Truck route with the full Buffer Rule",
        goal: "Plastic and Rubber trucked to base at an exact steady rate",
        steps: [
          "Route: oil outpost → main base, carrying Plastic and Rubber.",
          "Loading end: outpost belts → **Industrial Storage Container** → **two Mk.3+ belts** → Truck Station (Load).",
          "Unloading end: Truck Station (Unload) → **two Mk.3+ belts** → Industrial Storage Container → one belt to the factory.",
          "Record the route with the Truck, time a full loop, and run the **Route calculator**. Add trucks until it says the rate is covered.",
          "Add the route to the **Logistics** tab so you always know what feeds what.",
        ],
      },
      {
        id: "p5-circuit", kind: "production", time: 40, requires: ["p5-plastic"], suggestAlts: ["Alternate: Silicon Circuit Board"],
        title: "Build Module: Circuit Boards",
        goal: "Circuit Boards (feeds Computers in Tier 6)",
        steps: ["Next to the plastic outpost, with copper sheets coming in by truck or Depot."],
        calc: { targets: { "Circuit Board": 5 }, supplied: ["Plastic"], useAlts: ["Alternate: Silicon Circuit Board", "Alternate: Caterium Circuit Board"] },
      },
      {
        id: "p5-quickwire", kind: "production", time: 30, optional: true,
        title: "Build Outpost: Caterium → Quickwire",
        goal: "Quickwire for AI Limiters and High-Speed Connectors",
        steps: ["Caterium ore → Quickwire at the node. You'll need lots of Quickwire later."],
        calc: { targets: { Quickwire: 60 }, useAlts: ["Alternate: Pure Caterium Ingot"] },
      },
      {
        id: "p5-jetpack", kind: "gear", time: 15, optional: true,
        title: "Try it: Jetpack",
        goal: "Flying around your vertical factories",
        steps: ["Turn in **Jetpack**: 50 Motor, 1000 Cable, 1000 Iron Plate. Fuel it with Packaged Fuel or Solid Biofuel."],
      },
      {
        id: "p5-pack", kind: "milestone", time: 15, optional: true,
        title: "Milestone: Fluid Packaging",
        goal: "Packager unlocked",
        steps: ["Turn in **Fluid Packaging**: 200 Plastic, 400 Steel Beam, 1000 Copper Sheet. Useful for packaging byproducts into the sink."],
      },
      {
        id: "p5-geo", kind: "power", time: 60, optional: true,
        title: "MAM: Geothermal power",
        goal: "Geothermal Generators on geysers (no fuel needed)",
        steps: [
          "MAM Caterium tree: **High-Speed Connector** (500 Quickwire, 50 Plastic) → **Geothermal Generator** (100 High-Speed Connector, 1000 Quickwire, 50 Motor).",
          "Find geysers with the scanner and build on them. Output varies by geyser purity and swings up and down, so pair them with Power Storage.",
        ],
      },
    ],
  },
  {
    id: "p6",
    title: "Manufacturing & Trains",
    tier: "Tier 6 · Space Elevator Phase 3",
    blurb: "The Manufacturer arrives, along with Computers, Heavy Frames and trains. Phase 3 is the biggest build so far, so it's split into small modules.",
    power: 2690,
    missions: [
      {
        id: "p6-manu", kind: "milestone", time: 10,
        title: "Milestone: Industrial Manufacturing",
        goal: "Manufacturer, Computer, Heavy Modular Frame, Modular Engine, ACU",
        steps: ["Turn in **Industrial Manufacturing**: 200 Motor, 200 Modular Frame, 400 Plastic, 1000 Cable."],
      },
      {
        id: "p6-trainms", kind: "milestone", time: 10,
        title: "Milestone: Monorail Train Technology",
        goal: "Trains unlocked",
        steps: ["Turn in **Monorail Train Technology**: 250 Motor, 500 Encased Industrial Beam, 1000 Steel Beam, 1000 Steel Pipe."],
      },
      {
        id: "p6-train", kind: "logistics", time: 90, requires: ["p6-trainms"],
        title: "Guided: your first train line",
        goal: "One locomotive, two stations, exact steady delivery",
        steps: [
          "Keep it simple: **one track, one train, two stations**. You don't need signals with a single train.",
          "Each end: a Train Station + a Freight Platform. Build the Buffer Rule at both ends (Industrial Container + two Mk.3+ belts).",
          "Put the station at each end on a loop, or a straight track with the train able to reverse (a locomotive at each end of the cars).",
          "Set the timetable: Station A → Station B. Time a full round trip.",
          "Run the **Route calculator** with Freight Car selected. It tells you how many cars you need and how big the buffers must be for a steady exact rate.",
          "Signals only matter when you add a second train on the same track. The Railway Signalling milestone covers that later.",
        ],
      },
      {
        id: "p6-hd", kind: "alts", time: 45, optional: true,
        title: "Hard drive hunt: Phase 3 parts",
        goal: "Try for Manufacturer-era alternates",
        steps: ["Hoping for: **Heavy Encased Frame**, **Plastic Smart Plating**, **Flexible Framework**, **Crystal Computer** / **Caterium Computer**, **Rigor Motor**."],
      },
      {
        id: "p6-me", kind: "elevator", time: 60, requires: ["p6-manu"],
        title: "Build Module: Modular Engine",
        goal: "Modular Engine (Phase 3 needs 500)",
        steps: ["Rubber comes from the oil outpost and Smart Plating from your 5/min module. Build the rest floor by floor."],
        calc: { targets: { "Modular Engine": 1 }, supplied: ["Smart Plating", "Rubber", "Steel Pipe"], useAlts: ["Alternate: Rigor Motor", "Alternate: Steel Rotor", "Alternate: Cast Screws"] },
      },
      {
        id: "p6-computer", kind: "production", time: 45, requires: ["p6-manu", "p5-circuit"], suggestAlts: ["Alternate: Crystal Computer"],
        title: "Build Module: Computers",
        goal: "Computers, next to the Circuit Board module",
        steps: ["One Manufacturer at the clock below, fed by the circuit board module."],
        calc: { targets: { Computer: 2.5 }, supplied: ["Circuit Board", "Plastic"], useAlts: ["Alternate: Crystal Computer", "Alternate: Caterium Computer"] },
      },
      {
        id: "p6-hmf", kind: "production", time: 60, requires: ["p6-manu"], suggestAlts: ["Alternate: Heavy Encased Frame"],
        title: "Build Module: Heavy Modular Frame",
        goal: "Heavy Modular Frames",
        steps: ["The steel outpost supplies pipe and beam. Expand it or give this module its own iron + coal."],
        calc: { targets: { "Heavy Modular Frame": 1 }, supplied: ["Steel Pipe", "Steel Beam", "Concrete"], useAlts: ["Alternate: Heavy Encased Frame", "Alternate: Steeled Frame", "Alternate: Cast Screws"] },
      },
      {
        id: "p6-acu", kind: "elevator", time: 30, requires: ["p6-computer", "p6-hmf"],
        title: "Build Module: Adaptive Control Unit",
        goal: "ACU (Phase 3 needs 100)",
        steps: ["Pulls Computers, Heavy Frames and Automated Wiring from the Depot or by belt."],
        calc: { targets: { "Adaptive Control Unit": 0.5 }, supplied: ["Computer", "Heavy Modular Frame", "Automated Wiring", "Circuit Board"] },
      },
      {
        id: "p6-vf2", kind: "elevator", time: 45, requires: ["p6-manu"],
        title: "Scale Versatile Framework",
        goal: "2500 VF in ~4 hours",
        steps: ["Copy your VF module with blueprints, or build this bigger one."],
        calc: { targets: { "Versatile Framework": 10 }, useAlts: ["Alternate: Steeled Frame", "Alternate: Flexible Framework", "Alternate: Solid Steel Ingot", "Alternate: Cast Screws"] },
      },
      {
        id: "p6-fuel2", kind: "power", time: 60, requires: ["p5-fuelpower"], produces: 1000,
        title: "Build Outpost: second 1000 MW fuel plant",
        goal: "Grid ready for the Phase 3 build",
        steps: ["Copy your fuel plant at another oil field. Check the power budget in the header first. If you already have headroom, push this later."],
        calc: { targets: { Fuel: 80 }, useAlts: ["Alternate: Heavy Oil Residue", "Alternate: Diluted Fuel"] },
      },
      {
        id: "p6-elev3", kind: "elevator", time: 30, requires: ["p6-me", "p6-acu", "p6-vf2"],
        title: "Ship Space Elevator Phase 3",
        goal: "Tiers 7 and 8 unlocked",
        steps: ["Collect **2500 Versatile Framework, 500 Modular Engine, 100 Adaptive Control Unit**, then send it."],
      },
      {
        id: "p6-amplifier", kind: "explore", time: 30, optional: true, requires: ["p6-me"],
        title: "Somersloops: double a machine",
        goal: "Production Amplifier on the Modular Engine Manufacturer",
        steps: [
          "MAM: **Production Amplifier** (1 Somersloop, 100 SAM Fluctuator, 50 Circuit Board).",
          "Put Somersloops into the Modular Engine Manufacturer. It then makes **double output from the same inputs** but uses more power.",
          "Exact math: with doubled output, halve this module's target on the goal board so nothing backs up.",
        ],
      },
      {
        id: "p6-signal", kind: "milestone", time: 15, optional: true,
        title: "Milestone: Railway Signalling",
        goal: "Block and Path signals",
        steps: ["Turn in **Railway Signalling**: 50 Computer, 400 Steel Pipe, 1000 Copper Sheet. Needed once you have two trains on one track."],
      },
      {
        id: "p6-pipe2", kind: "milestone", time: 15, optional: true,
        title: "Milestone: Pipeline Engineering Mk.2",
        goal: "Mk.2 pipes (600 m³/min)",
        steps: ["Turn in **Pipeline Engineering Mk.2**: 50 Heavy Modular Frame, 1000 Plastic, 1000 Rubber."],
      },
      {
        id: "p6-bp2", kind: "milestone", time: 15, optional: true,
        title: "Milestone: FICSIT Blueprints Mk.2",
        goal: "Bigger blueprints, whole factory floors",
        steps: ["Turn in **FICSIT Blueprints Mk.2**: 100 Heavy Modular Frame, 100 Computer, 400 Rubber, 1500 Concrete. Big enough to blueprint a whole floor of a vertical factory."],
      },
      {
        id: "p6-depot60", kind: "logistics", time: 45, optional: true, requires: ["p3-depot"],
        title: "Depot upgrade: Upload 60/min",
        goal: "Faster uploads + a SAM Fluctuator line",
        steps: ["MAM: **Upload Upgrade: 60/min** (7 Mercer Sphere, 103 SAM Fluctuator). Build this small Fluctuator line if hand-crafting gets old."],
        calc: { targets: { "SAM Fluctuator": 2 }, supplied: ["Steel Pipe"] },
      },
      {
        id: "p6-elevator", kind: "gear", time: 20, optional: true,
        title: "Try it: Personnel Elevator",
        goal: "An elevator in your tallest factory",
        steps: ["Buy the **Personnel Elevator** in the AWESOME Shop (10 coupons) and put one in your tallest vertical build."],
      },
      {
        id: "p6-mam-radar", kind: "mam", time: 30, optional: true,
        title: "MAM: Radar and Programmable Splitter",
        goal: "Radar Towers and Programmable Splitters",
        steps: [
          "Quartz tree: **Radar Technology** (50 Crystal Oscillator, 50 Heavy Modular Frame, 50 Computer) reveals the map around each tower.",
          "Caterium tree: **Programmable Splitter** (100 AI Limiter, 50 Computer, 50 Heavy Modular Frame).",
        ],
      },
      {
        id: "p6-spheres", kind: "explore", time: 45, optional: true,
        title: "Mercer Sphere hunt #3",
        goal: "20+ Mercer Spheres total",
        steps: ["Upload upgrades keep getting more expensive (13 then 23 spheres). Put a radar tower near unexplored areas first."],
      },
    ],
  },
  {
    id: "p7",
    title: "The Aluminum Wall",
    tier: "Tier 7",
    blurb: "This is where it got overwhelming last time. Do it in three steps: the water loop first, then the refineries, then the foundries. The math is all here.",
    power: 2690,
    missions: [
      {
        id: "p7-bauxms", kind: "milestone", time: 10,
        title: "Milestone: Bauxite Refinement",
        goal: "Alumina Solution, Aluminum Scrap, Aluminum Ingot unlocked",
        steps: ["Turn in **Bauxite Refinement**: 100 Computer, 100 Heavy Modular Frame, 250 Motor, 500 Rubber."],
      },
      {
        id: "p7-hd", kind: "alts", time: 45, optional: true, requires: ["p7-bauxms"],
        title: "Hard drive hunt: aluminum",
        goal: "Try for the aluminum alternates first",
        steps: [
          "Hoping for: **Pure Aluminum Ingot** (no silica needed), **Sloppy Alumina** + **Electrode Aluminum Scrap** (needs Petroleum Coke, so oil nearby), **Alclad Casing**.",
          "Standard recipes work fine. These just make the outpost smaller.",
        ],
      },
      {
        id: "p7-water", kind: "production", time: 45, requires: ["p7-bauxms"],
        title: "Aluminum step 1: the water loop (build this first)",
        goal: "VIP water loop built and tested before any refinery runs",
        steps: [
          "Read the Rules tab card **Aluminum VIP water loop** once.",
          "Pick a bauxite node with quartz and coal reachable (or bring those in by train). Build on-site.",
          "Place **1 Water Extractor** (fresh water = 180 needed − 60 byproduct = **120 m³/min**, exactly one extractor).",
          "Run the **byproduct water** from the Scrap refinery into the Alumina refinery's water line **after** the fresh water valve, so it always gets used first.",
          "Cap the fresh line with a **Valve set to 120**.",
          "Emergency overflow: a branch to a Fluid Buffer, or a refinery making Wet Concrete if you own it, that only fills if the loop backs up.",
        ],
      },
      {
        id: "p7-refine", kind: "production", time: 60, requires: ["p7-water"],
        title: "Aluminum step 2: refineries + silica",
        goal: "Alumina Solution and Aluminum Scrap running",
        steps: [
          "Ground floor: Alumina refinery and Scrap refinery at the clocks below, hooked into the water loop.",
          { notAlt: "Alternate: Pure Aluminum Ingot", text: "Silica constructors from Raw Quartz. The Alumina refinery also makes 50 Silica/min as a byproduct, so merge it in with a Priority Merger (byproduct first)." },
          "Run for 5 minutes and check every pipe is flowing and no refinery says *output full*.",
        ],
        calc: { targets: { "Aluminum Ingot": 120 }, useAlts: ["Alternate: Pure Aluminum Ingot", "Alternate: Sloppy Alumina", "Alternate: Electrode Aluminum Scrap"] },
      },
      {
        id: "p7-ingot", kind: "production", time: 30, requires: ["p7-refine"],
        title: "Aluminum step 3: foundries → ingots → upload",
        goal: "Aluminum Ingots leaving the site as solids",
        steps: [
          "Top floor: the foundries (or smelters with Pure Aluminum Ingot). Ingots go to storage + uploader, overflow to the sink.",
          "Tick this once ingots have been flowing for 10 minutes without a stall.",
        ],
      },
      {
        id: "p7-alclad", kind: "production", time: 30, requires: ["p7-ingot"],
        title: "Build Module: Alclad Sheet + Casing",
        goal: "Alclad Sheet and Aluminum Casing",
        steps: ["Fed by the aluminum outpost (belt or Depot) plus Copper Ingots. Uses 90 of the 120 ingots; the other 30 overflow to storage."],
        calc: { targets: { "Alclad Aluminum Sheet": 30, "Aluminum Casing": 40 }, supplied: ["Aluminum Ingot", "Copper Ingot"], useAlts: ["Alternate: Alclad Casing"] },
      },
      {
        id: "p7-control", kind: "milestone", time: 10, requires: ["p7-alclad"],
        title: "Milestone: Control System Development",
        goal: "Battery, Radio Control Unit, Supercomputer, Assembly Director System, Blender",
        steps: ["Turn in **Control System Development**: 200 Alclad Aluminum Sheet, 400 Aluminum Casing, 200 Computer, 1000 Plastic."],
      },
      {
        id: "p7-logmk5", kind: "milestone", time: 10, requires: ["p7-alclad"],
        title: "Milestone: Logistics Mk.5",
        goal: "Mk.5 belts (780/min)",
        steps: ["Turn in **Logistics Mk.5**: 200 Alclad Aluminum Sheet, 400 Encased Industrial Beam, 600 Reinforced Iron Plate."],
      },
      {
        id: "p7-super", kind: "production", time: 60, requires: ["p7-control"], suggestAlts: ["Alternate: Super-State Computer"],
        title: "Build Module: Supercomputer",
        goal: "Supercomputers (feeds ADS and Nuclear Power)",
        steps: ["Build it floor by floor, one machine type at a time."],
        calc: { targets: { Supercomputer: 0.5 }, supplied: ["Computer", "Plastic", "Quickwire"] },
      },
      {
        id: "p7-mam-mycelia", kind: "mam", time: 40, optional: true,
        title: "MAM: Mycelia tree → Gas Mask",
        goal: "Fabric, Parachute, Gas Mask (Gas Filters)",
        steps: [
          "**Mycelia** (5), **Fabric** (25 Mycelia, 100 Biomass), **Parachute** (10 Fabric, 50 Cable), **Medical Properties** (25 Mycelia, 10 Stator).",
          "**Gas Mask** (10 Coal, 50 Fabric, 50 Steel Pipe) unlocks **Gas Filters**, which the Hazmat Suit milestone needs.",
          "**Expanded Toolbelt** (50 Fabric, 100 Rotor) is a nice bonus.",
        ],
      },
      {
        id: "p7-hazmat", kind: "gear", time: 20, optional: true, requires: ["p7-mam-mycelia"],
        title: "Milestone: Hazmat Suit",
        goal: "Hazmat Suit (needed for uranium)",
        steps: ["Turn in **Hazmat Suit**: 50 Gas Filter, 100 Aluminum Casing, 500 Quickwire."],
      },
      {
        id: "p7-hover", kind: "gear", time: 20, optional: true,
        title: "Try it: Hoverpack",
        goal: "Hover around your vertical factories on grid power",
        steps: ["Turn in **Hoverpack**: 100 Alclad Aluminum Sheet, 100 Heavy Modular Frame, 100 Computer, 250 Motor."],
      },
      {
        id: "p7-turbo", kind: "power", time: 60, optional: true,
        title: "Power upgrade: Turbofuel",
        goal: "MAM Turbofuel research and a turbofuel line",
        steps: [
          "Sulfur tree: **Compacted Coal** (1 Hard Drive, 25 Sulfur, 25 Coal), then **Turbofuel** (1 Hard Drive, 15 Compacted Coal, 50 Packaged Fuel).",
          "A Fuel Generator burns **7.5 Turbofuel/min** for the same 250 MW, so turbofuel goes much further than fuel.",
          "The box shows a turbofuel line for 4 generators (30/min). Swap one fuel plant over to it.",
        ],
        calc: { targets: { Turbofuel: 30 }, forceAlts: ["Turbofuel", "Alternate: Compacted Coal"] },
      },
      {
        id: "p7-depot120", kind: "logistics", time: 30, optional: true, requires: ["p3-depot"],
        title: "Depot upgrade: Upload 120/min",
        goal: "Faster uploads",
        steps: ["MAM: **Upload Upgrade: 120/min** (13 Mercer Sphere, 151 SAM Fluctuator)."],
      },
    ],
  },
  {
    id: "p8",
    title: "Advanced Parts",
    tier: "Tier 8 · Space Elevator Phase 4",
    blurb: "The Phase 4 parts, drones, and nuclear power as an optional challenge once you have a waste plan.",
    power: 3690,
    missions: [
      {
        id: "p8-advalu", kind: "milestone", time: 10,
        title: "Milestone: Advanced Aluminum Production",
        goal: "Heat Sink, Cooling System, Fused Modular Frame, Resource Wells",
        steps: ["Turn in **Advanced Aluminum Production**: 50 Radio Control Unit, 200 Aluminum Casing, 400 Alclad Aluminum Sheet, 3000 Wire."],
      },
      {
        id: "p8-nucms", kind: "milestone", time: 10,
        title: "Milestone: Nuclear Power",
        goal: "Magnetic Field Generator (plus the nuclear buildings)",
        steps: [
          "Turn in **Nuclear Power**: 50 Supercomputer, 200 Heavy Modular Frame, 1000 Cable, 2000 Concrete.",
          "You need this milestone for the **Magnetic Field Generator** even if you never build a reactor.",
        ],
      },
      {
        id: "p8-edge", kind: "milestone", time: 10, requires: ["p8-advalu"],
        title: "Milestone: Leading-Edge Production",
        goal: "Turbo Motor, Miner Mk.3, Thermal Propulsion Rocket",
        steps: ["Turn in **Leading-Edge Production**: 50 Fused Modular Frame, 100 Supercomputer, 1000 Steel Pipe."],
      },
      {
        id: "p8-particle", kind: "milestone", time: 10, requires: ["p8-edge"],
        title: "Milestone: Particle Enrichment",
        goal: "Particle Accelerator, Nuclear Pasta",
        steps: ["Turn in **Particle Enrichment**: 50 Turbo Motor, 100 Fused Modular Frame, 200 Cooling System, 2500 Quickwire."],
      },
      {
        id: "p8-power", kind: "power", time: 60, requires: ["p5-fuelpower"], produces: 1000,
        title: "Power for Phase 4 (no nuclear needed)",
        goal: "Another 1000 MW before the Particle Accelerators",
        steps: [
          "Particle Accelerators draw a lot of power that varies as they run. Check the power budget first.",
          "Easiest: copy your fuel plant again, or switch one to Turbofuel if you've researched it.",
        ],
        calc: { targets: { Fuel: 80 }, useAlts: ["Alternate: Heavy Oil Residue", "Alternate: Diluted Fuel"] },
      },
      {
        id: "p8-ads", kind: "elevator", time: 60, requires: ["p7-super"],
        title: "Build Module: Assembly Director System",
        goal: "ADS (Phase 4 needs 500, ~17 h of runtime)",
        steps: [
          "Needs **1 ACU/min + 0.5 Supercomputer/min**: copy your ACU module once and your Supercomputer module once, so the originals keep feeding everything else.",
          "This is the slowest Phase 4 part, so build it first and let it run while you build the rest.",
        ],
        calc: { targets: { "Assembly Director System": 0.5 }, supplied: ["Adaptive Control Unit", "Supercomputer"] },
      },
      {
        id: "p8-mfg", kind: "elevator", time: 45, requires: ["p8-nucms"],
        title: "Build Module: Magnetic Field Generator",
        goal: "MFG (Phase 4 needs 500, ~8 h)",
        steps: ["Uses Versatile Framework from your VF modules and Electromagnetic Control Rods built here."],
        calc: { targets: { "Magnetic Field Generator": 1 }, supplied: ["Versatile Framework", "Stator", "AI Limiter"] },
      },
      {
        id: "p8-tpr", kind: "elevator", time: 90, requires: ["p8-edge"], suggestAlts: ["Alternate: Heat Exchanger", "Alternate: Turbo Electric Motor"],
        title: "Build Module: Thermal Propulsion Rocket",
        goal: "TPR (Phase 4 needs 250, ~8 h)",
        steps: [
          "Nitrogen Gas comes from a **Resource Well** (one Pressurizer + Extractors on its satellite nodes). Build this module at the well.",
          "Build one floor at a time: Heat Sink → Cooling System → Fused Frame → Turbo Motor → Rocket.",
        ],
        calc: { targets: { "Thermal Propulsion Rocket": 0.5 }, supplied: ["Modular Engine", "Heavy Modular Frame", "Radio Control Unit", "Motor", "Rubber", "Alclad Aluminum Sheet", "Aluminum Casing", "Copper Sheet"], useAlts: ["Alternate: Heat Exchanger", "Alternate: Cooling Device"] },
      },
      {
        id: "p8-pasta", kind: "elevator", time: 60, requires: ["p8-particle"],
        title: "Build Module: Nuclear Pasta",
        goal: "Nuclear Pasta (Phase 4 needs 100, ~3.5 h)",
        steps: [
          "Build this **at a copper field**. It needs a lot of copper ore, so copper never leaves the site. **Pure Copper Ingot** cuts the ore by more than half.",
          "Make sure the power budget has room for the Particle Accelerator first.",
        ],
        calc: { targets: { "Nuclear Pasta": 0.5 }, supplied: ["Fused Modular Frame", "Radio Control Unit"], useAlts: ["Alternate: Pure Copper Ingot", "Alternate: Copper Alloy Ingot"] },
      },
      {
        id: "p8-elev4", kind: "elevator", time: 30, requires: ["p8-ads", "p8-mfg", "p8-tpr", "p8-pasta"],
        title: "Ship Space Elevator Phase 4",
        goal: "Tier 9 unlocked",
        steps: ["Collect **500 Assembly Director System, 500 Magnetic Field Generator, 250 Thermal Propulsion Rocket, 100 Nuclear Pasta**, then send it."],
      },
      {
        id: "p8-drones", kind: "gear", time: 45, optional: true,
        title: "Try it: Drones",
        goal: "A drone route replacing a short truck route",
        steps: [
          "Turn in **Aeronautical Engineering**: 50 Radio Control Unit, 100 Alclad Aluminum Sheet, 200 Aluminum Casing, 300 Motor.",
          "Build a Drone Port at each end and give the drone batteries. Use the Route calculator (Drone) to check it keeps up.",
        ],
      },
      {
        id: "p8-waste", kind: "power", time: 30, optional: true, requires: ["p8-nucms"],
        title: "Nuclear, step 1: the waste plan",
        goal: "Decide where waste goes before building a reactor",
        steps: [
          "Each Nuclear Power Plant makes **2500 MW**, burns **0.2 Uranium Fuel Rods/min** and produces **10 Uranium Waste/min**. Waste can't be sunk or destroyed.",
          "Option A, store it: belt waste into Industrial Storage Containers somewhere far from where you walk. One container holds 48 stacks of 500 = 24,000 waste, about 40 hours per plant.",
          "Option B, recycle it: Tier 8 *Particle Enrichment* turns waste into Plutonium Fuel Rods, and Tier 9 *Peak Efficiency* turns plutonium waste into **Ficsonium Fuel Rods, which leave no waste at all**.",
          "Pick A to start; the Tier 9 mission closes the loop. Then tick this.",
        ],
      },
      {
        id: "p8-nuke", kind: "power", time: 120, optional: true, requires: ["p8-waste", "p7-hazmat"], produces: 5000,
        title: "Nuclear, step 2: two reactors (5000 MW)",
        goal: "2 Nuclear Power Plants at 100%",
        steps: [
          "Each plant needs **240 m³ water/min** (2 extractors). Wear the Hazmat Suit near uranium and waste.",
          "Build the fuel rod chain below at the uranium node. Waste belts straight to your storage plan.",
        ],
        calc: { targets: { "Uranium Fuel Rod": 0.4 }, supplied: ["Encased Industrial Beam", "Stator", "AI Limiter", "Concrete"], useAlts: ["Alternate: Uranium Fuel Unit"] },
      },
      {
        id: "p8-depot240", kind: "logistics", time: 30, optional: true, requires: ["p3-depot"],
        title: "Depot upgrade: Upload 240/min",
        goal: "Fastest uploads",
        steps: ["MAM: **Upload Upgrade: 240/min** (23 Mercer Sphere, 199 SAM Fluctuator)."],
      },
      {
        id: "p8-hd", kind: "alts", time: 45, optional: true,
        title: "Hard drive hunt: late-game parts",
        goal: "Try for big late-game savers",
        steps: ["Hoping for: **Super-State Computer**, **Radio Connection Unit**, **Heat Exchanger**, **Turbo Electric Motor**, **Uranium Fuel Unit**, **Cooling Device**."],
      },
    ],
  },
  {
    id: "p9",
    title: "Project Assembly",
    tier: "Tier 9 · Space Elevator Phase 5",
    blurb: "The finale: matter conversion, quantum parts and the last shipment.",
    power: 6000,
    missions: [
      {
        id: "p9-matter", kind: "milestone", time: 10,
        title: "Milestone: Matter Conversion",
        goal: "Converter, Ficsite, Time Crystal, Biochemical Sculptor",
        steps: ["Turn in **Matter Conversion**: 100 Fused Modular Frame, 250 Radio Control Unit, 500 Cooling System."],
      },
      {
        id: "p9-quantum", kind: "milestone", time: 10, requires: ["p9-matter"],
        title: "Milestone: Quantum Encoding",
        goal: "Quantum Encoder, Dark Matter, Superposition Oscillator, AI Expansion Server",
        steps: ["Turn in **Quantum Encoding**: 50 Time Crystal, 100 Ficsite Trigon, 200 Turbo Motor, 400 Supercomputer."],
      },
      {
        id: "p9-spatial", kind: "milestone", time: 10, requires: ["p9-quantum"],
        title: "Milestone: Spatial Energy Regulation",
        goal: "Singularity Cell, Ballistic Warp Drive",
        steps: ["Turn in **Spatial Energy Regulation**: 100 Superposition Oscillator, 250 Turbo Motor, 500 Radio Control Unit, 1000 SAM Fluctuator."],
      },
      {
        id: "p9-power", kind: "power", time: 90, requires: ["p9-matter"], produces: 2000,
        title: "Power for Phase 5",
        goal: "+2000 MW for Converters and Quantum Encoders",
        steps: ["Converters, Particle Accelerators and Quantum Encoders draw a lot. Add 2000 MW: two more fuel/turbofuel plants, or two more reactors if you went nuclear."],
      },
      {
        id: "p9-sculptor", kind: "elevator", time: 60, requires: ["p9-matter"],
        title: "Build Module: Biochemical Sculptor",
        goal: "Biochemical Sculptor (Phase 5 needs 1000)",
        steps: ["Converters and Ficsite first, then the sculptor line."],
        calc: { targets: { "Biochemical Sculptor": 2 }, supplied: ["Assembly Director System", "Aluminum Ingot", "Reanimated SAM"] },
      },
      {
        id: "p9-ai", kind: "elevator", time: 90, requires: ["p9-quantum"],
        title: "Build Module: AI Expansion Server",
        goal: "AI Expansion Server (Phase 5 needs 256)",
        steps: ["Quantum Encoders make Dark Matter Residue as a byproduct, so give it its own overflow."],
        calc: { targets: { "AI Expansion Server": 0.5 }, supplied: ["Magnetic Field Generator", "Supercomputer", "Crystal Oscillator", "Alclad Aluminum Sheet", "Aluminum Ingot", "Reanimated SAM"] },
      },
      {
        id: "p9-bwd", kind: "elevator", time: 90, requires: ["p9-spatial"],
        title: "Build Module: Ballistic Warp Drive",
        goal: "Ballistic Warp Drive (Phase 5 needs 200)",
        steps: ["Reuses your Thermal Propulsion Rocket module. Expand it, or upload its output and pull from the Depot."],
        calc: { targets: { "Ballistic Warp Drive": 0.5 }, supplied: ["Thermal Propulsion Rocket", "Nuclear Pasta", "Alclad Aluminum Sheet", "Crystal Oscillator", "Heavy Modular Frame", "Reanimated SAM"] },
      },
      {
        id: "p9-pasta2", kind: "elevator", time: 45, requires: ["p8-pasta"],
        title: "Scale Nuclear Pasta to 1/min",
        goal: "1000 Nuclear Pasta in ~17 hours of runtime",
        steps: ["Copy your pasta module once with blueprints. Let it run while you build the other Phase 5 modules."],
        calc: { targets: { "Nuclear Pasta": 1 }, supplied: ["Fused Modular Frame", "Radio Control Unit"], useAlts: ["Alternate: Pure Copper Ingot", "Alternate: Copper Alloy Ingot"] },
      },
      {
        id: "p9-elev5", kind: "elevator", time: 30, requires: ["p9-sculptor", "p9-ai", "p9-bwd", "p9-pasta2"],
        title: "Ship Space Elevator Phase 5 🚀",
        goal: "Project Assembly complete",
        steps: ["Collect **1000 Nuclear Pasta, 1000 Biochemical Sculptor, 256 AI Expansion Server, 200 Ballistic Warp Drive**, then send it and watch the ending."],
      },
      {
        id: "p9-peak", kind: "milestone", time: 15, optional: true,
        title: "Milestone: Peak Efficiency",
        goal: "Mk.6 belts and Ficsonium",
        steps: ["Turn in **Peak Efficiency**: 250 Time Crystal, 250 Ficsite Trigon, 5000 Alclad Aluminum Sheet, 10000 Iron Plate. Mk.6 belts carry 1200/min."],
      },
      {
        id: "p9-ficsonium", kind: "power", time: 120, optional: true, requires: ["p9-peak", "p8-nuke"],
        title: "Nuclear, step 3: close the waste loop",
        goal: "Waste → Plutonium → Ficsonium, nothing left over",
        steps: [
          "Turn uranium waste into **Plutonium Fuel Rods** (Particle Enrichment chain) and burn them in a reactor.",
          "Turn the plutonium waste into **Ficsonium Fuel Rods** (Peak Efficiency). Burning those leaves no waste.",
          "Then start emptying your waste containers through the same chain.",
        ],
      },
      {
        id: "p9-alienpower", kind: "power", time: 45, optional: true,
        title: "MAM: Alien Power Augmenter",
        goal: "A grid-wide power boost from Somersloops",
        steps: [
          "MAM: **Alien Energy Harnessing** (10 SAM Fluctuator), **Power Augmenter** (1 Somersloop, 100 SAM Fluctuator, 50 Computer).",
          "Build an Alien Power Augmenter. It adds power and boosts your whole grid. Feed it Alien Power Matrix for an extra boost (MAM: Alien Power Matrix).",
        ],
      },
      {
        id: "p9-wagon", kind: "gear", time: 15, optional: true,
        title: "Try it: Cyber Wagon and Golden Cart",
        goal: "Every vehicle driven at least once",
        steps: ["AWESOME Shop: **Cyber Wagon** (20 coupons) and **Golden Factory Cart** (50 coupons). Take them for a lap around your factories."],
      },
      {
        id: "p9-mam-all", kind: "mam", time: 60, optional: true,
        title: "MAM: finish every tree you can",
        goal: "Every reachable MAM node researched",
        steps: [
          "Open the MAM and finish anything left in Caterium, Quartz, Sulfur, Mycelia, Nutrients, Power Slugs and Alien Technology.",
          "Synthetic Power Shards (10 Power Shard, 100 Time Crystal, 200 Quartz Crystal) let you make shards without slugs.",
          "Alien Organisms needs creature remains, which Peaceful mode doesn't have. That one stays unfinished.",
        ],
      },
    ],
  },
];

// Curated alternates. rank: 1 = take it whenever offered. tier = earliest tier it's useful.
window.ALTS = [
  { name: "Alternate: Solid Steel Ingot", rank: 1, tier: 3, why: "60 steel ingots from 40 iron ingots + 40 coal. Smaller steel outposts." },
  { name: "Alternate: Steel Screws", rank: 1, tier: 3, why: "5 Steel Beams make 260 Screws. Removes screw lines almost entirely." },
  { name: "Alternate: Steeled Frame", rank: 1, tier: 3, why: "Modular Frames from RIP + Steel Pipe, no rods. 50% more frames." },
  { name: "Alternate: Heavy Oil Residue", rank: 1, tier: 5, why: "Turns crude into mostly residue for the Diluted Fuel and Recycled loops." },
  { name: "Alternate: Recycled Plastic", rank: 1, tier: 5, why: "Plastic from rubber + fuel. With Recycled Rubber, oil goes much further." },
  { name: "Alternate: Recycled Rubber", rank: 1, tier: 5, why: "Rubber from plastic + fuel. Pairs with Recycled Plastic." },
  { name: "Alternate: Pure Iron Ingot", rank: 1, tier: 5, why: "Refinery: 65 ingots from 35 ore + water. Doubles every iron node." },
  { name: "Alternate: Pure Copper Ingot", rank: 1, tier: 5, why: "Refinery: 37.5 ingots from 15 ore + water. 2.5× every copper node." },
  { name: "Alternate: Heavy Encased Frame", rank: 1, tier: 6, why: "Heavy Modular Frames without screws, 40% faster." },
  { name: "Alternate: Plastic Smart Plating", rank: 1, tier: 6, why: "2.5× Smart Plating from the same parts plus a little plastic." },
  { name: "Alternate: Diluted Fuel", rank: 1, tier: 7, why: "Residue + water → 100 Fuel per refinery-equivalent. Huge power boost (needs a Blender)." },
  { name: "Alternate: Super-State Computer", rank: 1, tier: 7, why: "Supercomputers without High-Speed Connectors." },
  { name: "Alternate: Cast Screws", rank: 2, tier: 0, why: "Screws straight from ingots. Skips the rod step." },
  { name: "Alternate: Stitched Iron Plate", rank: 2, tier: 2, why: "RIP from plates + wire, no screws." },
  { name: "Alternate: Iron Alloy Ingot", rank: 2, tier: 3, why: "Foundry: 75 iron ingots from 40 iron ore + 10 copper ore." },
  { name: "Alternate: Copper Alloy Ingot", rank: 2, tier: 3, why: "Foundry: 100 copper ingots from 50 copper + 50 iron ore." },
  { name: "Alternate: Steel Rotor", rank: 2, tier: 3, why: "Rotors from steel pipe + wire, no screws." },
  { name: "Alternate: Encased Industrial Pipe", rank: 2, tier: 4, why: "EIB from steel pipe instead of beams." },
  { name: "Alternate: Fused Wire", rank: 2, tier: 4, why: "90 wire from copper + a little caterium." },
  { name: "Alternate: Silicon Circuit Board", rank: 2, tier: 5, why: "Circuit boards with no plastic." },
  { name: "Alternate: Insulated Cable", rank: 2, tier: 5, why: "100 cable from wire + rubber." },
  { name: "Alternate: Caterium Circuit Board", rank: 3, tier: 5, why: "Circuit boards from plastic + quickwire." },
  { name: "Alternate: Pure Caterium Ingot", rank: 2, tier: 5, why: "Refinery caterium ingots: far fewer ore per ingot." },
  { name: "Alternate: Flexible Framework", rank: 2, tier: 6, why: "50% more Versatile Framework with rubber." },
  { name: "Alternate: Crystal Computer", rank: 2, tier: 6, why: "Computers from circuit boards + crystal oscillators in an Assembler." },
  { name: "Alternate: Caterium Computer", rank: 2, tier: 6, why: "Computers from circuit boards, quickwire and rubber." },
  { name: "Alternate: Rigor Motor", rank: 2, tier: 6, why: "Motors with far fewer rotors and stators." },
  { name: "Alternate: Pure Aluminum Ingot", rank: 2, tier: 7, why: "Aluminum ingots in a smelter, no silica." },
  { name: "Alternate: Sloppy Alumina", rank: 2, tier: 7, why: "Twice the alumina per refinery. Take with Electrode Scrap." },
  { name: "Alternate: Electrode Aluminum Scrap", rank: 2, tier: 7, why: "Scrap from Petroleum Coke instead of coal. Needs oil nearby." },
  { name: "Alternate: Alclad Casing", rank: 2, tier: 7, why: "Almost double the casings per ingot." },
  { name: "Alternate: Heat Exchanger", rank: 2, tier: 8, why: "Heat sinks from casings + rubber." },
  { name: "Alternate: Cooling Device", rank: 3, tier: 8, why: "Cooling systems with less nitrogen." },
  { name: "Alternate: Turbo Electric Motor", rank: 2, tier: 8, why: "Turbo Motors without cooling systems." },
  { name: "Alternate: Uranium Fuel Unit", rank: 2, tier: 8, why: "50% more fuel rods from the same uranium cells." },
  { name: "Alternate: Wet Concrete", rank: 3, tier: 5, why: "80 concrete per refinery from limestone + water." },
  { name: "Alternate: Pure Quartz Crystal", rank: 3, tier: 5, why: "Many more crystals per raw quartz." },
  { name: "Alternate: Fused Quickwire", rank: 3, tier: 5, why: "Quickwire from mostly copper." },
];

// Vehicle defaults for the route calculator. Slots are editable in the app.
window.VEHICLES = [
  { id: "tractor", name: "Tractor", slots: 25, tier: 3 },
  { id: "truck", name: "Truck", slots: 48, tier: 5 },
  { id: "explorer", name: "Explorer", slots: 12, tier: 3 },
  { id: "freight", name: "Freight Car (per car)", slots: 32, tier: 6, perCar: true },
  { id: "fluid", name: "Fluid Freight Car (per car)", fluid: 1600, tier: 6, perCar: true },
  { id: "drone", name: "Drone (check in game)", slots: 9, tier: 8 },
];

// Your fixed playstyle rules, so you don't have to decide them again every session.
window.RULES = [
  {
    title: "100% uptime, exact clocks",
    body: [
      "Every module tells you **how many machines** and the **exact clock %**. All machines in a group run at the same clock, so the grid stays steady and nothing idles.",
      "Type clocks with 4 decimals (e.g. 66.6667). The game accepts them.",
      "Miners: clock the miner so it gives exactly the ore the module needs. Mk.1 / Mk.2 / Mk.3 on a normal node = 60 / 120 / 240 per min (impure ×0.5, pure ×2).",
      "Check with the **Conveyor Throughput Monitor** (AWESOME Shop, 5 coupons).",
    ],
  },
  {
    title: "Overflow on every module (Smart Splitter)",
    body: [
      "Module output → **Smart Splitter**: *Center* = main storage / Depot Uploader. *Overflow* = next production chain or AWESOME Sink.",
      "Storage fills first, then the sink takes the rest. Machines never stall and you keep earning coupons.",
    ],
  },
  {
    title: "Overflow before Smart Splitters",
    body: [
      "Until you research the Smart Splitter (Tier 2 Caterium trip): put a plain **Splitter** before the storage. Output 1 → storage, Output 2 → sink.",
      "It sends half to the sink until storage is full, then everything. Not perfect, but nothing ever stalls.",
    ],
  },
  {
    title: "Refine at the source (preferred)",
    body: [
      "Usually: process ore where it's mined and ship finished parts.",
      "It's fine to ship ore to a main factory when that's simpler, like a second ore that's far from the first.",
    ],
  },
  {
    title: "The Buffer Rule (trains & trucks)",
    body: [
      "Before every **loading** station: Industrial Storage Container → **two Mk.3+ belts** → station.",
      "After every **unloading** station: station → **two Mk.3+ belts** → Industrial Storage Container → factory.",
      "The container absorbs the gap between deliveries, so the factory side keeps an exact steady rate. The **Route calculator** (Logistics tab) sizes it for you.",
    ],
  },
  {
    title: "Alternate recipes",
    body: [
      "Standard recipes always work. Alternates make modules smaller, so the guide nudges you to hunt for specific ones before certain builds.",
      "When a hard drive offers a choice, take the highest-ranked one on the **Alternates** tab.",
      "Tick what you own and missions switch their math. Modules you've already built get an optional **upgrade** mission instead.",
    ],
  },
  {
    title: "Aluminum VIP water loop",
    body: [
      "Byproduct water from the Scrap refinery feeds **straight into** the Alumina refinery's water input. It joins **after** the fresh water valve, so it always gets used first.",
      "Fresh water has a **Valve capped at (water needed − byproduct)**. Standard recipes: 180 − 60 = **120 m³/min**.",
      "Emergency overflow: a branch to a Fluid Buffer (or a Wet Concrete refinery), so a backed-up loop never jams the Scrap refinery.",
    ],
  },
  {
    title: "Building vertically",
    body: [
      "Each module's **floor plan** puts raw processing on the ground floor and the final product at the top. Lifts carry each part up one floor.",
      "Blueprint one floor once you're happy with it, then stamp it for the next copy.",
      "The **Personnel Elevator** (AWESOME Shop) and Hoverpack make tall builds much nicer.",
    ],
  },
  {
    title: "Power cheat sheet",
    body: [
      "Biomass Burner **30 MW**: 10 Biomass/min or 4 Solid Biofuel/min.",
      "Coal Generator **75 MW**: 15 coal/min + 45 m³ water/min. 8 gens = 600 MW = 120 coal + 3 Water Extractors.",
      "Fuel Generator **250 MW**: 20 Fuel/min or 7.5 Turbofuel/min.",
      "Nuclear Plant **2500 MW**: 0.2 Uranium Fuel Rod/min + 240 m³ water/min, 10 waste/min.",
      "Underclocked machines use less power: power × (clock)^1.32. The header shows your budget.",
    ],
  },
];
