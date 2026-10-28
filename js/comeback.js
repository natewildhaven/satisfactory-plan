// The Comeback plan: picking an old save back up at Tier 7–8 and building a new
// Tier 8–9 hub that the old base feeds by train.
//
// Same shape as the fresh-start guide (missions.js + goals.js), plus a few plan fields:
//   useAlts   - alternates the plan's math may use (owned ones apply; order matters,
//               a later one wins when two make the same part)
//   ownedAlts - the alternates already in the save (Settings has a one-click tick)
//   cumulative: false - each stage's power row covers that stage's lines only
// and per stage:
//   short     - label used where the fresh guide says "Tier N"
//   gameTier  - the game tier this stage sits in
//   supplied  - parts the old base sends, so the targets table shows only what the hub mines
//   delivery  - the targets are deliveries, not new lines (no power or raw rows)
//   needLabel - what the last column of the targets table counts
//   hunt      - alternates worth looking for in this stage
//
// Old base spare output when the plan was written (per minute): Plastic 200, Circuit Board 10,
// Computer 15, Crystal Oscillator 16, Rubber 240, Packaged Fuel 40, Aluminum Casing 348.75,
// Alclad 240, Heavy Modular Frame 18, Modular Frame 36, Reinforced Iron Plate 81,
// Steel Beam 226.73, Steel Pipe 140, Motor 20, Rotor 40, Stator 20, Encased Beam 40, Concrete 40.
// Power: 91,000 MW built (fuel), 15,000 MW used, 19,500 MW peak.
(function () {
  const K = window.GoalKit;
  const g = K.g, make = K.make, count = K.count, M = K.M, E = K.E, O = K.O;

  // The 18 alternates in the save. Bolted before Stitched, so Stitched Iron Plate wins for new builds.
  const MINE = [
    "Alternate: Bolted Iron Plate", "Alternate: Stitched Iron Plate", "Alternate: Caterium Circuit Board",
    "Alternate: Iron Wire", "Alternate: Steel Rotor", "Alternate: Encased Industrial Pipe",
    "Alternate: Steel Screws", "Alternate: Iron Pipe", "Alternate: Pure Iron Ingot", "Alternate: Wet Concrete",
    "Alternate: Heavy Encased Frame", "Alternate: Electrode Aluminum Scrap", "Alternate: Alclad Casing",
    "Alternate: Pure Aluminum Ingot", "Alternate: Sloppy Alumina", "Alternate: Heavy Oil Residue",
    "Alternate: Diluted Fuel", "Alternate: Nitro Rocket Fuel",
  ];
  // Worth hunting now, best first. Copper Alloy before Pure Copper so Pure Copper wins if you own both.
  const HUNT = [
    "Alternate: Pure Copper Ingot", "Alternate: Turbo Electric Motor", "Alternate: Super-State Computer",
    "Alternate: Pure Caterium Ingot", "Alternate: Cooling Device", "Alternate: Heat Exchanger",
    "Alternate: Copper Alloy Ingot", "Alternate: Insulated Cable",
  ];
  const ALL = MINE.concat(["Alternate: Copper Alloy Ingot"], HUNT.filter(function (a) { return a !== "Alternate: Copper Alloy Ingot"; }));

  // What the old base puts on the train.
  const OLD = [
    "Plastic", "Circuit Board", "Computer", "Crystal Oscillator", "Rubber", "Aluminum Casing",
    "Alclad Aluminum Sheet", "Heavy Modular Frame", "Modular Frame", "Reinforced Iron Plate", "Steel Beam",
    "Steel Pipe", "Motor", "Rotor", "Stator", "Encased Industrial Beam", "Concrete",
  ];
  function plus(extra) { return OLD.concat(extra); }

  const phases = [
    {
      id: "c0",
      short: "Stage 0",
      gameTier: 8,
      title: "Back in the Save",
      tier: "Stage 0 · Take stock (Tier 7–8)",
      blurb: "You already have 91 GW of power and a lot of factories. Before building anything new, find out what you have, unjam it and write it down. The new hub will run on your old base's spare parts.",
      power: 25000,
      hunt: HUNT.slice(0, 6),
      missions: [
        {
          id: "c0-power", kind: "power", time: 15, produces: 91000, uses: 19500,
          title: "Check your power",
          goal: "Capacity, use and peak written down",
          steps: [
            "Open the power graph on any Power Pole or generator and note **capacity**, **consumption** and **max consumption**. Yours: 91,000 MW built, 15,000 MW used, 19,500 MW peak.",
            "That's more than four times your peak, so **power is not a goal in this plan**. Fuel Generators only burn what the grid draws, so the spare costs nothing.",
            "Walk the fuel plant and check every generator has fuel in its slot and the fuel line isn't backing up into the refineries.",
            "Particle Accelerators (Stage 3) swing up to about 1500 MW each while they run. You have room for dozens.",
          ],
        },
        {
          id: "c0-audit", kind: "logistics", time: 45, requires: ["c0-power"],
          title: "Walk every factory and name it",
          goal: "Every factory named, with what it makes written down",
          steps: [
            "Fly round with the Hoverpack. At each factory put up a **sign** with its name and a **map stamp**.",
            "Write each factory's exports on **Logistics → My routes** (From: the factory, To: storage or sink, By: Belt), with the rate you see on the output belt.",
            "Check against the list you started with: Plastic 200, Rubber 240, Aluminum Casing 348.75, Alclad 240, Steel Beam 226.73, Steel Pipe 140, Reinforced Plate 81, Modular Frame 36, Heavy Frame 18, Computer 15, Crystal Oscillator 16, Circuit Board 10, Motor 20, Stator 20, Rotor 40, Encased Beam 40, Concrete 40, Packaged Fuel 40.",
            "Find the **Space Elevator** and note what's already been delivered for Phase 4. Phase 4 parts end there, so the train will bring them back to it.",
          ],
        },
        {
          id: "c0-unjam", kind: "production", time: 40, requires: ["c0-audit"],
          title: "Unjam the lines that back up",
          goal: "No end product backing up; everything ends in storage, then the sink",
          steps: [
            "Iron plates and sheets pile up because the product at the end of the line is full and everything behind it stops.",
            "On every export: **Smart Splitter** → *center* to an Industrial Storage Container, *overflow* to the AWESOME Sink (Rules: Overflow on every module).",
            "Check each factory's last machines say *producing*, not *output full*.",
            "Pick the spot for the **old base train station**: close to the containers for Aluminum Casing, Alclad and Rubber, the biggest exports.",
          ],
        },
        {
          id: "c0-alts", kind: "alts", time: 5,
          title: "Tick the alternates you own",
          goal: "The plan's math uses your 18 alternates",
          steps: [
            "**Settings → Plan → Tick the alternates in my save** ticks all 18 at once. Or tick them one by one on the **Alternates** tab.",
            "Every machine plan in this plan then uses them: Pure Iron Ingot, Iron Wire, Stitched Iron Plate, Caterium Circuit Board, Heavy Encased Frame and the rest.",
          ],
        },
        {
          id: "c0-scout", kind: "explore", time: 60, requires: ["c0-audit"],
          title: "Scout the new hub site",
          goal: "Hub site, nitrogen well and route home stamped on the map",
          steps: [
            "The hub's job is Phase 4 and 5. With your old parts coming by train it only has to mine **copper, caterium and nitrogen** (plus a little iron and water). At the Ideal level that's about **1,320 copper ore, 150 caterium ore, 140 iron ore, 225 m³ nitrogen and 115 m³ water per minute**.",
            "Copper is almost all for Nuclear Pasta (1,200 ingots/min for 1 pasta/min). So look for **a big copper field with pure nodes** first. With Pure Copper Ingot it drops to about 530 ore/min.",
            "Then **caterium within belt range** and a **Nitrogen Gas Resource Well** within one train hop. The Cooling Systems and Fused Frames get built at the well; only finished parts ride the train.",
            "Use the interactive map at satisfactory-calculator.com (filter to pure nodes and resource wells) to make a shortlist. The Spire Coast and the Dangle Spires come up often for nitrogen and pure nodes, but check the map yourself.",
            "Fly the route home from the hub to the old base. For your first line, avoid big canyons and the sea. A long gentle line is much easier than a short steep one.",
            "Stamp the hub, the well and the route on the map.",
          ],
        },
        {
          id: "c0-hd", kind: "alts", time: 45, optional: true, requires: ["c0-alts"],
          title: "Hard drive hunt: Pure Copper Ingot first",
          goal: "The alternates that shrink the hub most",
          steps: [
            "**Pure Copper Ingot** is the big one: Phase 4 at Ideal goes from about 1,320 to 530 copper ore/min.",
            "Then **Turbo Electric Motor** (about 100 m³ less nitrogen), **Super-State Computer** (far less caterium, needs Batteries), **Pure Caterium Ingot**, **Cooling Device**, **Heat Exchanger**.",
            "Tick each one on the Alternates tab when you get it. Unbuilt modules switch their math straight away.",
          ],
        },
        {
          id: "c0-hazmat", kind: "gear", time: 40, optional: true,
          title: "Milestone: Hazmat Suit (only for uranium)",
          goal: "The last Tier 7 milestone",
          steps: [
            "You're on fuel power with 91 GW, so you only need this if you want to try nuclear later.",
            "MAM Mycelia tree: **Fabric**, then **Gas Mask** (unlocks Gas Filters).",
            "Turn in **Hazmat Suit**: 50 Gas Filter, 100 Aluminum Casing, 500 Quickwire.",
          ],
        },
        {
          id: "c0-shop", kind: "production", time: 15, optional: true,
          title: "Spend your coupons",
          goal: "Something you've been missing from the AWESOME Shop",
          steps: [
            "All that sinking has earned coupons. Check the shop for the **Conveyor Throughput Monitor**, **Personnel Elevator**, train station roofs and anything for the new hub.",
          ],
        },
        {
          id: "c0-signs", kind: "architecture", time: 30, optional: true, requires: ["c0-audit"],
          title: "Labels everywhere",
          goal: "Every storage container and factory labelled",
          steps: [
            "Signs on every storage container saying what's in it. You'll thank yourself next time you come back to this save.",
          ],
        },
        {
          id: "c0-sloops", kind: "explore", time: 30, optional: true,
          title: "Count your Somersloops",
          goal: "Somersloops counted on the Goals tab",
          steps: [
            "Somersloops double a Particle Accelerator's Nuclear Pasta without using more copper (just more power, which you have). Count the ones in storage and put the number on the Goals tab.",
          ],
        },
      ],
    },
    {
      id: "c1",
      short: "Stage 1",
      gameTier: 8,
      title: "First Railway",
      tier: "Stage 1 · Trains",
      blurb: "One line, two stations, one train. Learn trains on a simple shuttle from the old base to the hub site, then add more stops and signals once it runs on its own.",
      power: 25000,
      delivery: true,
      hunt: [],
      missions: [
        {
          id: "c1-learn", kind: "logistics", time: 15,
          title: "How trains work (a 2-minute read)",
          goal: "Know the parts before you build",
          steps: [
            "A **train** is a Locomotive plus Freight Cars. It drives a **timetable**: go to a station, load or unload, go to the next.",
            "A **Train Station** is where it stops. Each **Freight Platform** behind the station lines up with one freight car and is set to *Load* or *Unload*.",
            "Tracks carry power. Connect one station to your grid and the whole line, and the hub at the far end, is powered.",
            "A locomotive only drives forwards. Either build a **turnaround loop** at each end, or put a second locomotive at the back facing the other way.",
            "**One train on a line needs no signals.** Signals only matter once two trains share track (an optional quest below).",
          ],
        },
        {
          id: "c1-track", kind: "logistics", time: 90, requires: ["c1-learn"],
          title: "Lay the main line: old base ⇄ hub",
          goal: "Track from the old base station spot to the hub site",
          steps: [
            "Start at the station spot you picked at the old base. Lay track on foundations or pillars so it stays level.",
            "Keep slopes gentle and curves wide. Trains slow down a lot on steep hills.",
            "Leave a foundation's width beside the track for a second track later.",
            "Finish with a **turnaround loop** at each end (or plan for a two-locomotive train).",
          ],
        },
        {
          id: "c1-stations", kind: "logistics", time: 60, requires: ["c1-track"],
          title: "Stations with the Buffer Rule",
          goal: "Loading station at the old base, unloading station at the hub",
          steps: [
            "Old base: **Train Station + 3 Freight Platforms**, all set to *Load*. Hub: **Train Station + 3 Freight Platforms**, all set to *Unload*.",
            "Plan the cars by size: **car 1 = big bulk** (Aluminum Casing, Alclad, Rubber), **car 2 = small bulk** (Steel Beam, Plastic, Circuit Board, Stator), **car 3 = parts** (Computer, Motor, Heavy Frame, Modular Frame, Rotor, Reinforced Plate, Crystal Oscillator).",
            "Old base: **one container per part**, each with its own belt into its car's platform through Mergers. Never mix parts in one container, or it sends them one part at a time.",
            "A Merger takes from its inputs in turn, so each car fills with roughly equal amounts of each part. The hub gets more of the parts it needs least; that's fine.",
            "Hub: platform → two belts → **Smart Splitters** (or Programmable Splitters) sorting into **one container per part**, and each container's overflow to a sink. Then nothing ever backs up into the platform and every car unloads completely.",
          ],
        },
        {
          id: "c1-feed", kind: "logistics", time: 45, requires: ["c1-stations"],
          title: "Feed the loading station",
          goal: "Every export reaches the old base station",
          steps: [
            "Change each export's overflow so the **train buffer comes first**: factory → that part's station container, and only its overflow → sink.",
            "At Ideal the hub needs per minute: **Aluminum Casing 164, Alclad 70, Rubber 75.5, Steel Beam 30, Plastic 28, Circuit Board 13, Stator 13, Computer 12, Motor 9, Rotor 5, Reinforced Plate 5, Heavy Frame 4, Modular Frame 2.5, Crystal Oscillator 2**.",
            "You make all of that already except Circuit Boards (10, need 13). A Caterium Circuit Board assembler at the hub covers the gap in Stage 3.",
            "Stage 2 milestones also want **Concrete 2000, Steel Pipe 1000 and Heavy Frames 200** in one go. Let them pile up in the containers now.",
          ],
        },
        {
          id: "c1-train", kind: "logistics", time: 30, requires: ["c1-stations"],
          title: "First train running",
          goal: "A train shuttling on its own for an hour",
          steps: [
            "Build a **Locomotive + 3 Freight Cars** at the old base station. Timetable: Old base (load) → Hub (unload). Turn on self-driving.",
            "Time one full loop with a stopwatch. With equal shares per car, car 1 is the tight one: about 2,100 Aluminum Casing per trip against 164/min at Ideal, so **a loop under about 12 minutes keeps up**. At Stretch, keep it under 6 or add a fourth car for aluminum.",
            "Check a single-part car (like the return car later) in **Logistics → Route calculator** (Freight Car).",
            "Leave it for an hour. Tick this once both stations have been through several loads and nothing jammed.",
          ],
        },
        {
          id: "c1-hubpower", kind: "power", time: 15, requires: ["c1-track"],
          title: "Power the hub through the railway",
          goal: "Hub site on the main grid",
          steps: [
            "Connect the old base station to the grid. Tracks carry power to the hub station; run a power line from it to the build site.",
            "If the hub ends up much bigger later, add a second power line along the track.",
          ],
        },
        {
          id: "c1-signals", kind: "logistics", time: 60, optional: true, requires: ["c1-train"],
          title: "Signals and a second train",
          goal: "Two trains sharing track without crashing",
          steps: [
            "Rule of thumb: **path signal before a junction or station, block signal after it**, and block signals every so often on long straights.",
            "Best with **double track**: one track each way, so trains never meet head-on.",
            "Add a second train on the same timetable and watch both run a loop.",
          ],
        },
        {
          id: "c1-roof", kind: "architecture", time: 40, optional: true, requires: ["c1-stations"],
          title: "A proper station",
          goal: "Roof, lights and a walkway",
          steps: ["Give the hub station a roof, lights and a walkway from the platform to the factory floor."],
        },
        {
          id: "c1-ride", kind: "gear", time: 15, optional: true, requires: ["c1-train"],
          title: "Ride your train",
          goal: "One loop from the cab",
          steps: ["Hop in and ride a full loop. It's the best way to spot a bad slope or a tight curve."],
        },
        {
          id: "c1-drone", kind: "gear", time: 45, optional: true,
          title: "Try it: one drone route",
          goal: "A drone carrying something small",
          steps: [
            "You already have Aeronautical Engineering. Drones suit light, valuable parts: try Crystal Oscillators or Radio Control Units.",
            "Drones run on Batteries. Make them at the old aluminum plant (Battery = Sulfuric Acid + Alumina Solution + Aluminum Casing). The Drone Port shows what else it accepts.",
          ],
        },
      ],
    },
    {
      id: "c2",
      short: "Stage 2",
      gameTier: 8,
      title: "The Hub: Finish Tier 8",
      tier: "Stage 2 · Tier 8 milestones",
      blurb: "Build the hub's own lines (copper, caterium and the nitrogen parts) and turn in the last three Tier 8 milestones. Together they need 150 Supercomputers, 150 Fused Modular Frames, 200 Cooling Systems, 50 Turbo Motors and 2,500 Quickwire.",
      power: 27000,
      supplied: plus(["Battery"]),
      needLabel: "Milestones need",
      hunt: HUNT.slice(0, 6),
      missions: [
        {
          id: "c2-copper", kind: "production", time: 45,
          title: "Build Module: Copper works",
          goal: "Copper Sheet for AI Limiters and Heat Sinks",
          suggestAlts: ["Alternate: Pure Copper Ingot"],
          steps: [
            "Build on the copper field and **leave plenty of room**: the Nuclear Pasta line in Stage 3 needs 1,200 Copper Ingots/min on its own.",
            "62 Copper Sheet/min covers every Stage 2–3 line at Ideal: AI Limiters here, Heat Sinks at the nitrogen well.",
          ],
          calc: { targets: { "Copper Sheet": 62 }, useAlts: ALL },
        },
        {
          id: "c2-quickwire", kind: "production", time: 45,
          title: "Build Module: Quickwire",
          goal: "Quickwire at a caterium node",
          suggestAlts: ["Alternate: Pure Caterium Ingot"],
          steps: [
            "248/min feeds the Supercomputer and Magnetic Field Generator lines; the rest stockpiles for **Particle Enrichment (2,500)**.",
            "Belt it to the hub, or give it its own small station on the line.",
          ],
          calc: { targets: { Quickwire: 360 }, useAlts: ALL },
        },
        {
          id: "c2-super", kind: "production", time: 60, requires: ["c2-copper", "c2-quickwire"],
          title: "Build Module: Supercomputer",
          goal: "1 Supercomputer/min (milestones need 150, ADS needs it next)",
          suggestAlts: ["Alternate: Super-State Computer"],
          steps: [
            "Computers and Plastic come by train; Quickwire and Copper Sheet from your two new modules.",
            "Floors: AI Limiters and High-Speed Connectors first, Supercomputers on top.",
            { alt: "Alternate: Super-State Computer", text: "Super-State Computer needs **Batteries**: add a Battery line at the old aluminum plant and put them on the train." },
          ],
          calc: { targets: { Supercomputer: 1 }, supplied: plus(["Quickwire", "Copper Sheet", "Battery"]), useAlts: ALL },
        },
        {
          id: "c2-ms-nuclear", kind: "milestone", time: 10, requires: ["c2-super"],
          title: "Milestone: Nuclear Power",
          goal: "Unlocks the Magnetic Field Generator",
          steps: [
            "Turn in **Nuclear Power**: 50 Supercomputer, 200 Heavy Modular Frame, 1000 Cable, 2000 Concrete.",
            "You need it for the **Magnetic Field Generator** even though you're staying on fuel power.",
            "Concrete is the slow one at 40/min (50 minutes). A Wet Concrete refinery makes 80/min if you'd rather not wait.",
          ],
        },
        {
          id: "c2-nitrogen", kind: "production", time: 90, requires: ["c2-copper"],
          title: "Build Outpost: Nitrogen well (Cooling Systems + Fused Frames)",
          goal: "7 Cooling Systems and 2 Fused Modular Frames per minute",
          suggestAlts: ["Alternate: Cooling Device", "Alternate: Heat Exchanger"],
          steps: [
            "Place a **Resource Well Pressurizer** and **Extractors** on the satellite nodes until you have the nitrogen below (normal node 60 m³/min, pure 120, impure 30).",
            "Build the Blenders at the well. Nitrogen never travels; only finished parts ride the train.",
            "Add a **station here** on the line. The train now runs: Old base (load) → Nitrogen well (unload aluminum, frames, rubber; load Cooling Systems + Fused Frames) → Hub → back.",
            "Copper Sheet comes from the copper works, by train or belt.",
          ],
          calc: { targets: { "Cooling System": 7, "Fused Modular Frame": 2 }, supplied: plus(["Copper Sheet"]), useAlts: ALL },
        },
        {
          id: "c2-ms-edge", kind: "milestone", time: 10, requires: ["c2-super", "c2-nitrogen"],
          title: "Milestone: Leading-Edge Production",
          goal: "Turbo Motor, Miner Mk.3, Thermal Propulsion Rocket",
          steps: ["Turn in **Leading-Edge Production**: 50 Fused Modular Frame, 100 Supercomputer, 1000 Steel Pipe."],
        },
        {
          id: "c2-rcu", kind: "production", time: 45,
          title: "Build Module: Radio Control Unit",
          goal: "4 RCU/min for Turbo Motors and Pressure Cubes",
          steps: [
            "Everything comes by train: Aluminum Casing, Crystal Oscillators and Computers.",
            "Matter Conversion (Tier 9) needs 250 RCUs, so let spares pile up.",
          ],
          calc: { targets: { "Radio Control Unit": 4 }, supplied: OLD, useAlts: ALL },
        },
        {
          id: "c2-turbo", kind: "production", time: 45, requires: ["c2-ms-edge", "c2-rcu"],
          title: "Build Module: Turbo Motor",
          goal: "1 Turbo Motor/min (Particle Enrichment needs 50)",
          suggestAlts: ["Alternate: Turbo Electric Motor"],
          steps: [
            "Cooling Systems from the well, RCUs from the hub, Motors and Rubber from the old base.",
            "Turbo Electric Motor swaps the Cooling Systems for Electromagnetic Control Rods, which saves a lot of nitrogen.",
          ],
          calc: { targets: { "Turbo Motor": 1 }, supplied: plus(["Cooling System", "Radio Control Unit", "Copper Sheet", "Quickwire"]), useAlts: ALL },
        },
        {
          id: "c2-ms-particle", kind: "milestone", time: 10, requires: ["c2-turbo"],
          title: "Milestone: Particle Enrichment",
          goal: "Particle Accelerator and Nuclear Pasta",
          steps: ["Turn in **Particle Enrichment**: 50 Turbo Motor, 100 Fused Modular Frame, 200 Cooling System, 2500 Quickwire."],
        },
        {
          id: "c2-mk3", kind: "production", time: 30, optional: true, requires: ["c2-ms-edge"],
          title: "Miner Mk.3 on the copper field",
          goal: "Twice the ore from the same nodes",
          steps: [
            "Miner Mk.3 gives 240/min on a normal node and 480 on a pure one. Swap the copper miners first; the pasta line needs them.",
            "Mk.5 belts carry 780/min, so a pure Mk.3 at 100% still fits on one belt.",
          ],
        },
        {
          id: "c2-hd", kind: "alts", time: 45, optional: true,
          title: "Hard drive hunt: the hub's alternates",
          goal: "Pure Copper Ingot, Turbo Electric Motor, Super-State Computer",
          steps: [
            "See **Alternates to look for** below. Each one you tick switches the math of the modules you haven't built yet.",
          ],
        },
        {
          id: "c2-blueprint", kind: "architecture", time: 30, optional: true, requires: ["c2-super"],
          title: "Blueprint a hub floor",
          goal: "One floor saved, ready to stamp",
          steps: ["Save one floor of the Supercomputer module as a blueprint. Stage 3 copies a lot of floors."],
        },
        {
          id: "c2-sloops", kind: "explore", time: 45, optional: true,
          title: "Somersloops: collect 10",
          goal: "Enough to double the pasta line",
          steps: ["Sloops in the Particle Accelerators double Nuclear Pasta without more copper. Phase 5 needs 1,000 pasta, so this pays off."],
        },
        {
          id: "c2-nuke", kind: "power", time: 120, optional: true, requires: ["c2-ms-nuclear", "c0-hazmat"],
          title: "Nuclear power (just for the challenge)",
          goal: "One reactor and a waste plan",
          steps: [
            "You don't need it with 91 GW of fuel power. Do it only if you want the challenge.",
            "Decide where waste goes first. It can't be sunk; Plutonium and Ficsonium (Tier 9) eventually close the loop.",
            "Each Nuclear Power Plant makes 2500 MW from 0.2 Uranium Fuel Rods/min and 240 m³ water/min.",
          ],
        },
      ],
    },
    {
      id: "c3",
      short: "Stage 3",
      gameTier: 8,
      title: "Phase 4",
      tier: "Stage 3 · Space Elevator Phase 4",
      blurb: "The four Phase 4 parts, built at the hub and carried home to the Space Elevator by train. ADS is the slowest, so build it first and let it run while you build the rest.",
      power: 29000,
      supplied: plus(["Battery"]),
      needLabel: "Phase 4 needs",
      hunt: HUNT.slice(0, 6),
      missions: [
        {
          id: "c3-ads", kind: "elevator", time: 60, requires: ["c2-super"],
          title: "Build Module: Assembly Director System",
          goal: "1 ADS/min (500 in about 8 hours)",
          steps: [
            "The ACUs are built here from Automated Wiring, Circuit Boards, Heavy Frames and Computers. If your Phase 3 ACU line is still standing at the old base, restart it and put ACUs on the train instead.",
            "Supercomputers come from your Stage 2 module. Raise it to 2/min if the milestones still need some.",
            "Circuit Boards: this needs 10/min and the Supercomputers 3, while the old base sends 10. See the Circuit Board side quest.",
          ],
          calc: { targets: { "Assembly Director System": 1 }, supplied: plus(["Supercomputer"]), useAlts: ALL },
        },
        {
          id: "c3-mfg", kind: "elevator", time: 45, requires: ["c2-ms-nuclear"],
          title: "Build Module: Magnetic Field Generator",
          goal: "2 MFG/min (500 in about 4 hours)",
          steps: [
            "Versatile Framework from Modular Frames + Steel Beams (both by train); Electromagnetic Control Rods from Stators + AI Limiters.",
            "This uses 13 Stators/min and the old base makes 20, so keep an eye on the Stator container.",
          ],
          calc: { targets: { "Magnetic Field Generator": 2 }, supplied: plus(["Quickwire", "Copper Sheet"]), useAlts: ALL },
        },
        {
          id: "c3-tpr", kind: "elevator", time: 60, requires: ["c2-turbo"],
          title: "Build Module: Thermal Propulsion Rocket",
          goal: "1 TPR/min (250 in about 4 hours)",
          steps: [
            "Modular Engines are built here from Motors, Rubber and Smart Plating (Reinforced Plates + Rotors, all by train).",
            "Turbo Motors from the hub module, Cooling Systems and Fused Frames from the well.",
          ],
          calc: { targets: { "Thermal Propulsion Rocket": 1 }, supplied: plus(["Turbo Motor", "Cooling System", "Fused Modular Frame"]), useAlts: ALL },
        },
        {
          id: "c3-pasta", kind: "elevator", time: 90, requires: ["c2-ms-particle"],
          title: "Build Module: Nuclear Pasta",
          goal: "1 Nuclear Pasta/min (100 in under 2 hours, and Phase 5 needs 1,000)",
          suggestAlts: ["Alternate: Pure Copper Ingot"],
          steps: [
            "Build it **on the copper field**. 1 pasta/min eats 200 Copper Powder = **1,200 Copper Ingots/min**. Copper never leaves the site.",
            { notAlt: "Alternate: Pure Copper Ingot", text: "Standard ingots: 1,200 copper ore/min, about 3 pure nodes on Mk.3 miners. Pure Copper Ingot cuts it to 480 ore + 320 m³ water." },
            { alt: "Alternate: Pure Copper Ingot", text: "With Pure Copper Ingot: 480 copper ore + 320 m³ water/min for 1,200 ingots." },
            "Pressure Conversion Cubes are built here from Fused Frames (well) and RCUs (hub).",
            "Each Particle Accelerator swings up to about 1500 MW. Your grid won't notice.",
          ],
          calc: { targets: { "Nuclear Pasta": 1 }, supplied: ["Fused Modular Frame", "Radio Control Unit"], useAlts: ALL },
        },
        {
          id: "c3-home", kind: "logistics", time: 40, requires: ["c1-train"],
          title: "Phase 4 parts ride the train home",
          goal: "Finished parts arrive at the Space Elevator",
          steps: [
            "Add a **fourth Freight Car**, a *Load* platform at the hub and an *Unload* platform at the old base next to the Space Elevator.",
            "All four Phase 4 parts fit in that one car. Unload into containers beside the Space Elevator.",
          ],
        },
        {
          id: "c3-ship", kind: "elevator", time: 30, requires: ["c3-ads", "c3-mfg", "c3-tpr", "c3-pasta"],
          title: "Ship Space Elevator Phase 4",
          goal: "Tier 9 unlocked",
          steps: ["Collect **500 Assembly Director System, 500 Magnetic Field Generator, 250 Thermal Propulsion Rocket, 100 Nuclear Pasta**, then send it."],
        },
        {
          id: "c3-cb", kind: "production", time: 20, optional: true, requires: ["c2-quickwire"],
          title: "Top up Circuit Boards",
          goal: "3 extra Circuit Boards/min at the hub",
          steps: [
            "The old base sends 10/min; ADS and Supercomputers need 13 at Ideal. One Caterium Circuit Board assembler fixes it.",
            "At Stretch you'd need 26, so the old circuit board line would need doubling.",
          ],
          calc: { targets: { "Circuit Board": 3 }, supplied: ["Plastic", "Quickwire"], useAlts: ALL },
        },
        {
          id: "c3-rcustock", kind: "production", time: 10, optional: true, requires: ["c2-rcu"],
          title: "Stockpile for Tier 9",
          goal: "250 RCU, 100 Fused Frames, 500 Cooling Systems",
          steps: [
            "Matter Conversion (Tier 9's first milestone) needs 100 Fused Modular Frame, 250 Radio Control Unit, 500 Cooling System.",
            "Let the overflow of those three fill a container each while Phase 4 runs.",
          ],
        },
        {
          id: "c3-sloops", kind: "explore", time: 20, optional: true, requires: ["c3-pasta"],
          title: "Somersloops in the Particle Accelerators",
          goal: "Nuclear Pasta doubled from the same copper",
          steps: [
            "Fill the Particle Accelerators' Somersloop slots. Output doubles, input stays the same, and power use goes up a lot (fine with your grid).",
            "Halve the pasta target on the goal board, or keep it and enjoy 2/min.",
          ],
        },
        {
          id: "c3-second", kind: "logistics", time: 60, optional: true, requires: ["c1-signals"],
          title: "A second train for the return trip",
          goal: "Two trains, one each way round the loop",
          steps: ["Once signals and double track are in, split the job: one train brings parts out, one brings finished parts home."],
        },
        {
          id: "c3-lights", kind: "architecture", time: 40, optional: true,
          title: "Light up the hub",
          goal: "The hub looks good at night",
          steps: ["Ceiling lights inside, flood lights on the outside, and the station lit so you can see trains arrive from far away."],
        },
      ],
    },
    {
      id: "c4",
      short: "Stage 4",
      gameTier: 9,
      title: "Project Assembly",
      tier: "Stage 4 · Tier 9 · Space Elevator Phase 5",
      blurb: "The finale. Keep the Phase 4 modules running: Phase 5 is built from their parts. Pasta is the long one (1,000), so scale it first.",
      power: 35000,
      supplied: plus(["Assembly Director System", "Magnetic Field Generator", "Thermal Propulsion Rocket", "Fused Modular Frame", "Radio Control Unit", "Supercomputer", "Aluminum Ingot"]),
      needLabel: "Phase 5 needs",
      hunt: ["Alternate: Dark Matter Trap", "Alternate: Pure Copper Ingot"],
      missions: [
        {
          id: "c4-matter", kind: "milestone", time: 10, requires: ["c3-ship"],
          title: "Milestone: Matter Conversion",
          goal: "Converter, Ficsite, Time Crystal, Biochemical Sculptor",
          steps: ["Turn in **Matter Conversion**: 100 Fused Modular Frame, 250 Radio Control Unit, 500 Cooling System."],
        },
        {
          id: "c4-quantum", kind: "milestone", time: 10, requires: ["c4-matter"],
          title: "Milestone: Quantum Encoding",
          goal: "Quantum Encoder, Dark Matter, AI Expansion Server",
          steps: ["Turn in **Quantum Encoding**: 50 Time Crystal, 100 Ficsite Trigon, 200 Turbo Motor, 400 Supercomputer."],
        },
        {
          id: "c4-spatial", kind: "milestone", time: 10, requires: ["c4-quantum"],
          title: "Milestone: Spatial Energy Regulation",
          goal: "Singularity Cell, Ballistic Warp Drive",
          steps: ["Turn in **Spatial Energy Regulation**: 100 Superposition Oscillator, 250 Turbo Motor, 500 Radio Control Unit, 1000 SAM Fluctuator."],
        },
        {
          id: "c4-pasta", kind: "elevator", time: 60, requires: ["c3-pasta"],
          title: "Scale Nuclear Pasta to 2/min",
          goal: "1,000 Nuclear Pasta in about 8 hours",
          suggestAlts: ["Alternate: Pure Copper Ingot"],
          steps: [
            "Copy the pasta module with blueprints, or fill the Particle Accelerators with Somersloops instead.",
            "Start this first; it's the long one.",
          ],
          calc: { targets: { "Nuclear Pasta": 2 }, supplied: ["Fused Modular Frame", "Radio Control Unit"], useAlts: ALL },
        },
        {
          id: "c4-sculptor", kind: "elevator", time: 60, requires: ["c4-matter"],
          title: "Build Module: Biochemical Sculptor",
          goal: "4 Biochemical Sculptors/min (1,000 in about 4 hours)",
          steps: [
            "Uses 1 ADS/min from the Phase 4 module, so keep it running.",
            "Aluminum Ingots come from the old aluminum plant: add them to the train.",
          ],
          calc: { targets: { "Biochemical Sculptor": 4 }, supplied: ["Assembly Director System", "Aluminum Ingot", "Reanimated SAM"] },
        },
        {
          id: "c4-ai", kind: "elevator", time: 90, requires: ["c4-quantum"],
          title: "Build Module: AI Expansion Server",
          goal: "1 AI Expansion Server/min (256 in about 4 hours)",
          steps: ["Uses Magnetic Field Generators and Supercomputers from Phase 4. Quantum Encoders make Dark Matter Residue, so give it its own overflow."],
          calc: { targets: { "AI Expansion Server": 1 }, supplied: ["Magnetic Field Generator", "Supercomputer", "Crystal Oscillator", "Alclad Aluminum Sheet", "Aluminum Ingot", "Reanimated SAM"] },
        },
        {
          id: "c4-bwd", kind: "elevator", time: 90, requires: ["c4-spatial"],
          title: "Build Module: Ballistic Warp Drive",
          goal: "1 Ballistic Warp Drive/min (200 in about 3.5 hours)",
          steps: ["Uses Thermal Propulsion Rockets and Nuclear Pasta from Phase 4. Build it next to the pasta line."],
          calc: { targets: { "Ballistic Warp Drive": 1 }, supplied: ["Thermal Propulsion Rocket", "Nuclear Pasta", "Alclad Aluminum Sheet", "Crystal Oscillator", "Heavy Modular Frame", "Reanimated SAM"] },
        },
        {
          id: "c4-ship", kind: "elevator", time: 30, requires: ["c4-pasta", "c4-sculptor", "c4-ai", "c4-bwd"],
          title: "Ship Space Elevator Phase 5 🚀",
          goal: "Project Assembly complete",
          steps: ["Collect **1000 Nuclear Pasta, 1000 Biochemical Sculptor, 256 AI Expansion Server, 200 Ballistic Warp Drive**, then send it and watch the ending."],
        },
        {
          id: "c4-time", kind: "production", time: 40, optional: true, requires: ["c4-matter"],
          title: "Build Module: Time Crystal",
          goal: "Time Crystals for Quantum Encoding and Peak Efficiency",
          steps: ["Quantum Encoding needs 50 and Peak Efficiency 250."],
          calc: { targets: { "Time Crystal": 3 } },
        },
        {
          id: "c4-peak", kind: "milestone", time: 15, optional: true,
          title: "Milestone: Peak Efficiency",
          goal: "Mk.6 belts and Ficsonium",
          steps: ["Turn in **Peak Efficiency**: 250 Time Crystal, 250 Ficsite Trigon, 5000 Alclad Aluminum Sheet, 10000 Iron Plate. Your old base's Alclad surplus covers the 5,000 in about 20 minutes."],
        },
        {
          id: "c4-augment", kind: "power", time: 45, optional: true,
          title: "MAM: Alien Power Augmenter",
          goal: "A grid-wide power boost from Somersloops",
          steps: ["You don't need the power, but it's the last big building to try. MAM: **Alien Energy Harnessing**, then **Power Augmenter**."],
        },
        {
          id: "c4-deck", kind: "architecture", time: 60, optional: true,
          title: "A viewing deck at the Space Elevator",
          goal: "A spot to watch the final launch",
          steps: ["Build a platform with railings and lights near the Space Elevator, high enough to see the train arrive."],
        },
        {
          id: "c4-tour", kind: "gear", time: 30, optional: true,
          title: "Victory lap by train",
          goal: "Ride the whole line one last time",
          steps: ["Ride the train round every station you built, then fly the Hoverpack round the old base."],
        },
      ],
    },
  ];

  // Production targets per stage: [item, minimum, ideal, stretch, how many the stage needs (optional)].
  const rates = {
    c1: [
      ["Aluminum Casing", 82, 164, 328], ["Alclad Aluminum Sheet", 35, 70, 140], ["Rubber", 38, 75.5, 151],
      ["Steel Beam", 15, 30, 60], ["Plastic", 14, 28, 56], ["Circuit Board", 6.5, 13, 26], ["Stator", 6.5, 13, 26],
      ["Computer", 6, 12, 24], ["Motor", 4.5, 9, 18], ["Heavy Modular Frame", 2, 4, 8],
    ],
    c2: [
      ["Supercomputer", 0.5, 1, 2, 150], ["Cooling System", 3.5, 7, 14, 200], ["Fused Modular Frame", 1, 2, 4, 150],
      ["Turbo Motor", 0.5, 1, 2, 50], ["Radio Control Unit", 2, 4, 8], ["Quickwire", 60, 120, 240, 2500],
    ],
    c3: [
      ["Assembly Director System", 0.5, 1, 2, 500], ["Magnetic Field Generator", 1, 2, 4, 500],
      ["Thermal Propulsion Rocket", 0.5, 1, 2, 250], ["Nuclear Pasta", 0.5, 1, 2, 100],
    ],
    c4: [
      ["Nuclear Pasta", 1, 2, 4, 1000], ["Biochemical Sculptor", 2, 4, 8, 1000],
      ["AI Expansion Server", 0.5, 1, 2, 256], ["Ballistic Warp Drive", 0.5, 1, 2, 200],
    ],
  };

  const goals = K.build({
    c0: [
      g(M, "power", "Power checked: capacity, use and peak written down"),
      g(M, "logistics", "Every factory named, with its exports written down"),
      g(M, "production", "No end product backing up: every export ends in storage, then the sink"),
      count(M, "alts", "alts", 18, "Alternate recipes owned: 18 (tick the ones in your save)"),
      g(M, "explore", "Hub site picked: copper field, caterium, a nitrogen well and water within reach"),
      g(E, "elevator", "Space Elevator found and Phase 4 progress noted"),
      g(E, "explore", "Route home flown and stamped on the map"),
      g(E, "alts", "Pure Copper Ingot found (cuts the hub's copper by more than half)"),
      g(O, "gear", "Milestone: Hazmat Suit"),
      g(O, "architecture", "Signs on every factory and storage container"),
      g(O, "production", "Coupons spent on something you've been missing"),
      count(O, "explore", "sloops", 5, "Somersloops: 5"),
    ],
    c1: [
      g(M, "logistics", "Track laid from the old base to the hub site"),
      g(M, "logistics", "Loading station at the old base, unloading station at the hub, both with buffers"),
      g(M, "logistics", "First train running on its own for an hour"),
      make(M, "logistics", "Aluminum parts arriving at the hub by train", ["Aluminum Casing", "Alclad Aluminum Sheet"]),
      make(M, "logistics", "The rest of the parts list arriving by train", ["Rubber", "Steel Beam", "Plastic", "Circuit Board", "Stator", "Computer", "Motor", "Heavy Modular Frame"]),
      g(E, "logistics", "Loop timed and checked in the Route calculator"),
      g(E, "logistics", "Unloaded parts sorted into one container per part"),
      g(E, "power", "Hub powered through the railway"),
      g(O, "logistics", "Two trains sharing track with block and path signals"),
      g(O, "logistics", "Double track, one direction each"),
      g(O, "architecture", "Hub station with a roof and lights"),
      g(O, "gear", "A drone route for something small"),
    ],
    c2: [
      g(M, "milestone", "Milestone: Nuclear Power (for the Magnetic Field Generator)"),
      g(M, "milestone", "Milestone: Leading-Edge Production"),
      g(M, "milestone", "Milestone: Particle Enrichment"),
      make(M, "production", "Supercomputers automated at the hub", ["Supercomputer"]),
      make(M, "production", "Cooling Systems and Fused Modular Frames automated at the nitrogen well", ["Cooling System", "Fused Modular Frame"]),
      make(M, "production", "Radio Control Units and Turbo Motors automated", ["Radio Control Unit", "Turbo Motor"]),
      make(E, "production", "Spare Quickwire piling up for the milestones", ["Quickwire"]),
      g(E, "logistics", "Train stops at three stations: old base, nitrogen well, hub"),
      g(E, "production", "Miner Mk.3 on the copper field"),
      count(E, "alts", "alts", 20, "Alternate recipes owned: 20"),
      g(O, "architecture", "One hub floor saved as a blueprint"),
      count(O, "explore", "sloops", 10, "Somersloops: 10 (they double Nuclear Pasta)"),
      g(O, "power", "Nuclear power, just for the challenge"),
    ],
    c3: [
      make(M, "elevator", "Assembly Director Systems automated", ["Assembly Director System"]),
      make(M, "elevator", "Magnetic Field Generators automated", ["Magnetic Field Generator"]),
      make(M, "elevator", "Thermal Propulsion Rockets automated", ["Thermal Propulsion Rocket"]),
      make(M, "elevator", "Nuclear Pasta automated", ["Nuclear Pasta"]),
      g(M, "elevator", "Space Elevator Phase 4 shipped (500 ADS, 500 MFG, 250 TPR, 100 Nuclear Pasta)"),
      g(E, "logistics", "Phase 4 parts arrive at the Space Elevator by train"),
      g(E, "production", "Circuit Board gap closed (13/min at Ideal, the old base makes 10)"),
      g(E, "production", "Stockpiled for Matter Conversion: 250 RCU, 100 Fused Frames, 500 Cooling Systems"),
      g(E, "explore", "Somersloops in the Particle Accelerators"),
      g(O, "logistics", "A second train, one each way"),
      g(O, "architecture", "Hub lit up at night"),
      count(O, "alts", "alts", 22, "Alternate recipes owned: 22"),
    ],
    c4: [
      g(M, "milestone", "Milestones: Matter Conversion, Quantum Encoding, Spatial Energy Regulation"),
      make(M, "elevator", "Nuclear Pasta scaled up for Phase 5", ["Nuclear Pasta"]),
      make(M, "elevator", "Biochemical Sculptors automated", ["Biochemical Sculptor"]),
      make(M, "elevator", "AI Expansion Servers automated", ["AI Expansion Server"]),
      make(M, "elevator", "Ballistic Warp Drives automated", ["Ballistic Warp Drive"]),
      g(M, "elevator", "Space Elevator Phase 5 shipped (1000 Nuclear Pasta, 1000 Biochemical Sculptor, 256 AI Expansion Server, 200 Ballistic Warp Drive)"),
      g(E, "logistics", "Every Phase 5 part reaches the Space Elevator by train"),
      g(E, "production", "Time Crystals automated"),
      g(O, "milestone", "Milestone: Peak Efficiency, Mk.6 belts"),
      g(O, "power", "Alien Power Augmenter running"),
      g(O, "architecture", "A viewing deck at the Space Elevator"),
      count(O, "explore", "mercer", 100, "Mercer Spheres: 100"),
    ],
  });

  window.COMEBACK = {
    id: "comeback",
    label: "Comeback",
    icon: "🚂",
    hint: "Your old save at Tier 7–8: take stock, learn trains, build a Tier 8–9 hub fed by the old base.",
    phases: phases,
    goals: goals,
    rates: rates,
    useAlts: ALL,
    ownedAlts: MINE,
    cumulative: false,
    // Shown at the top of the Targets tab: which factory does what. Numbers are the Ideal level.
    overview: [
      {
        title: "🏭 Old base: the supplier",
        body: [
          "Keeps making what it makes now. Everything the hub needs leaves on the train: **Aluminum Casing 164, Alclad 70, Rubber 75.5, Steel Beam 30, Plastic 28, Circuit Board 13, Stator 13, Computer 12, Motor 9** per minute, plus a few Rotors, Reinforced Plates, Frames and Crystal Oscillators.",
          "It already covers all of that except **Circuit Boards (makes 10, needs 13)**. For Stretch, also double Circuit Boards (26), Computers (24) and Stators (26).",
          "Later: Aluminum Ingots and Batteries for Phase 5 and drones.",
        ],
      },
      {
        title: "🔶 New hub on a copper field",
        body: [
          "Mines **about 1,320 copper ore** (530 with Pure Copper Ingot), **150 caterium** and **140 iron ore** per minute. Nearly all the copper goes into Nuclear Pasta.",
          "Lines: Copper Sheet, Quickwire, Supercomputer, Radio Control Unit, Turbo Motor, then the Phase 4 parts (ADS, MFG, TPR, Nuclear Pasta) and later Phase 5.",
          "Adds about **3,300 MW** at Ideal. Your 91 GW grid has room for that many times over.",
        ],
      },
      {
        title: "❄ Nitrogen well outpost",
        body: [
          "**225 m³ nitrogen/min** → Heat Sinks → **7 Cooling Systems** and **2 Fused Modular Frames** per minute. Nitrogen never travels.",
          "Turbo Electric Motor and Cooling Device both cut the nitrogen a lot, if a hard drive offers them.",
        ],
      },
      {
        title: "🚂 The railway",
        body: [
          "Start with **old base ⇄ hub**: one train, 3 freight cars (big bulk, small bulk, parts), no signals needed.",
          "Then **old base → nitrogen well → hub → old base**, with a 4th car bringing Phase 4 parts home to the Space Elevator.",
          "At Ideal, any loop under about 12 minutes keeps up. One container per part at both ends, and sink overflow at the hub so cars always empty.",
        ],
      },
      {
        title: "⏱ How long it takes",
        body: [
          "At Ideal, Phase 4 (500 ADS, 500 MFG, 250 TPR, 100 Pasta) takes **about 8 hours of runtime**. ADS is the slow one, so build it first.",
          "Phase 5 at Ideal: about 8 hours for the 1,000 Nuclear Pasta, 4 for the rest. Somersloops in the Particle Accelerators halve the pasta time.",
        ],
      },
    ],
  };
})();
