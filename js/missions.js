// The guide itself. Phases unlock one after another; inside a phase, missions
// reveal one at a time as you tick them off. Side quests are always optional.
//
// A mission with `calc` gets its machine counts, clock speeds and raw needs
// worked out live by js/solver.js, using whatever alternates are switched on.
// Milestone costs below are copied from 1.x game data.
window.PHASES = [
  {
    id: "p0",
    title: "Landing",
    tier: "Tier 0 · HUB Upgrades",
    blurb: "Get the HUB running and build your first real production lines. Every machine you place here gets reused for a long time.",
    missions: [
      {
        id: "p0-land",
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
        id: "p0-hub2-4",
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
        id: "p0-hub5",
        title: "HUB Upgrade 5: Miners",
        goal: "Miner Mk.1 and Storage Container unlocked",
        steps: [
          "**HUB Upgrade 5**: 75 Iron Rod, 50 Cable, 20 Concrete.",
          "From now on, ore comes from Miners. A **Mk.1 Miner** gives 30 / 60 / 120 ore/min on an impure / normal / pure node.",
        ],
      },
      {
        id: "p0-iron",
        title: "Build Module: Starter Iron",
        goal: "20 Iron Plate + 15 Iron Rod + 60 Screws per minute, all 60 ore used",
        steps: [
          "Put a Mk.1 Miner on a **normal iron node** (60 ore/min).",
          "Build the machines in the box below in order: smelters → rod and plate constructors → screw constructors.",
          "Set each clock speed exactly as shown. To edit a machine's clock, open it and type the number.",
          "Belt every output into its own Storage Container next to the HUB.",
        ],
        calc: { targets: { "Iron Plate": 20, "Iron Rod": 15, Screws: 60 } },
      },
      {
        id: "p0-copper",
        title: "Build Module: Starter Copper",
        goal: "60 Wire + 30 Cable per minute",
        steps: [
          "Put a Mk.1 Miner on a **normal copper node** (60 ore/min).",
          "Build the machines from the box below. Half the wire goes to storage and half feeds the Cable constructor.",
          "Belt Wire and Cable into storage.",
        ],
        calc: { targets: { Wire: 60, Cable: 30 } },
      },
      {
        id: "p0-concrete",
        title: "Build Module: Concrete",
        goal: "20 Concrete per minute",
        steps: [
          "Put a Mk.1 Miner on a **normal limestone node** (60/min).",
          "Build the Constructors below at the exact clock shown, then belt them to storage.",
        ],
        calc: { targets: { Concrete: 20 } },
      },
      {
        id: "p0-hub6",
        title: "HUB Upgrade 6: Space Elevator",
        goal: "Space Elevator placed, Tier 1 open",
        steps: [
          "**HUB Upgrade 6**: 100 Iron Rod, 100 Iron Plate, 100 Wire, 50 Concrete.",
          "Build the **Space Elevator** somewhere central with room around it. It's a permanent landmark, so take your time choosing the spot.",
          "Build 2–4 **Biomass Burners** (30 MW each) and keep them fed by hand. This only lasts until Coal Power in Tier 3.",
        ],
      },
    ],
    side: [
      {
        id: "p0-side-explore",
        title: "Scout the desert",
        steps: [
          "Fly a drone-eye loop: climb the tallest rock nearby and mark (map stamps) every node type you can see.",
          "Mark any **white/purple glowing crash sites** (hard drives) and **Mercer Spheres** (purple pulsing orbs) for later.",
        ],
      },
    ],
  },
  {
    id: "p1",
    title: "Groundwork",
    tier: "Tier 1",
    blurb: "Three small milestones. Your starter modules already make everything they need. You just collect it and walk to the HUB.",
    missions: [
      {
        id: "p1-base",
        title: "Milestone: Base Building",
        goal: "Foundations unlocked",
        steps: [
          "Turn in **Base Building**: 200 Concrete, 100 Iron Plate, 100 Iron Rod.",
          "Put foundations under your starter modules if you like. Grid-snapped foundations make every later blueprint line up.",
        ],
      },
      {
        id: "p1-logistics",
        title: "Milestone: Logistics",
        goal: "Splitters, Mergers and Conveyor Lifts unlocked",
        steps: [
          "Turn in **Logistics**: 150 Iron Plate, 150 Iron Rod, 300 Wire.",
          "Splitters let you build the **storage-with-overflow** pattern (see the Rules tab, *Overflow before Smart Splitters*).",
        ],
      },
      {
        id: "p1-field",
        title: "Milestone: Field Research (the MAM)",
        goal: "MAM built, first research running",
        steps: [
          "Turn in **Field Research**: 300 Wire, 300 Screws, 100 Iron Plate.",
          "Build the **MAM** next to the HUB.",
          "Research only these, in order: **Mercer Sphere Analysis** (1 Mercer Sphere), **SAM Analysis** (10 SAM), **Caterium** (10 Caterium Ore), **Quartz** (10 Raw Quartz). Ignore the rest of the MAM for now.",
        ],
      },
    ],
    side: [
      {
        id: "p1-side-spheres",
        title: "Mercer Sphere hunt #1",
        steps: [
          "Set the Object Scanner to **Mercer Sphere** and sweep the area around your base.",
          "Collect 5+. You'll need 1 for analysis and more for the Depot later (see Tier 3).",
        ],
      },
      {
        id: "p1-side-samples",
        title: "Grab research samples",
        steps: [
          "Pick up 30+ **SAM**, 60+ **Caterium Ore**, 30+ **Raw Quartz** and 60+ **Sulfur** by hand when you find them. Unlocking the scanner entries above makes them easier to find.",
        ],
      },
    ],
  },
  {
    id: "p2",
    title: "Assembly Line",
    tier: "Tier 2 · Space Elevator Phase 1",
    blurb: "Assemblers arrive. One small Smart Plating line pays off Phase 1 of the Space Elevator, and the AWESOME Sink starts turning overflow into coupons.",
    missions: [
      {
        id: "p2-parts",
        title: "Milestone: Part Assembly",
        goal: "Assembler unlocked",
        steps: ["Turn in **Part Assembly**: 200 Cable, 200 Iron Rod, 500 Screws, 300 Iron Plate."],
      },
      {
        id: "p2-sink",
        title: "Milestone: Resource Sink Bonus Program",
        goal: "AWESOME Sink built, overflow earns coupons",
        steps: [
          "Turn in **Resource Sink Bonus Program**: 400 Concrete, 500 Wire, 200 Iron Rod, 200 Iron Plate.",
          "Build the AWESOME Sink near your storage. From now on, **every module's overflow ends at the sink**.",
          "Spend your first coupons in the AWESOME Shop on whatever looks fun. There's no wrong choice here.",
        ],
      },
      {
        id: "p2-smart",
        title: "Build Module: Smart Plating",
        goal: "2 Smart Plating/min from a dedicated iron node",
        steps: [
          "Use a **second normal iron node** (Mk.1 = 60/min; set the miner to **77.5%** so it gives exactly the 46.5 ore/min this module needs).",
          "Build the chain below from bottom to top: smelters → rods/plates → screws → RIP and Rotor assemblers → Smart Plating assembler.",
          "Smart Plating goes to a storage container. Overflow goes to the sink.",
        ],
        calc: { targets: { "Smart Plating": 2 } },
      },
      {
        id: "p2-elev1",
        title: "Ship Space Elevator Phase 1",
        goal: "Tiers 3 and 4 unlocked",
        steps: [
          "Wait for 50 Smart Plating (25 minutes of the module above). Work on the next milestone while it runs.",
          "Load them into the Space Elevator and send it.",
        ],
      },
      {
        id: "p2-logmk2",
        title: "Milestone: Logistics Mk.2",
        goal: "Mk.2 belts (120/min) unlocked",
        steps: ["Turn in **Logistics Mk.2**: 50 Reinforced Iron Plate, 200 Concrete, 300 Iron Rod, 300 Iron Plate."],
      },
      {
        id: "p2-clear",
        title: "Milestone: Obstacle Clearing",
        goal: "Chainsaw and Solid Biofuel unlocked",
        steps: [
          "Turn in **Obstacle Clearing**: 500 Screws, 100 Cable, 100 Concrete.",
          "Chainsaw the trees/bushes around your build area. That gives you biomass for the burners for free.",
        ],
      },
    ],
    side: [
      {
        id: "p2-side-jump",
        title: "Milestone: Jump Pads (fun, optional)",
        steps: ["Turn in **Jump Pads**: 50 Rotor, 300 Iron Plate, 150 Cable."],
      },
    ],
  },
  {
    id: "p3",
    title: "Coal & Steel",
    tier: "Tier 3",
    blurb: "Real power, your first on-site steel outpost, and the Dimensional Depot. Once the Depot is running you can stop walking back to base.",
    missions: [
      {
        id: "p3-coalms",
        title: "Milestone: Coal Power",
        goal: "Coal Generators and Water Extractors unlocked",
        steps: ["Turn in **Coal Power**: 150 Reinforced Iron Plate, 50 Rotor, 500 Cable."],
      },
      {
        id: "p3-coalplant",
        title: "Build Outpost: 600 MW Coal Plant",
        goal: "8 Coal Generators at 100% = 600 MW",
        steps: [
          "Find a coal node near water. Coal needed: **8 × 15 = 120 coal/min** (normal node with Mk.2, or a pure node with Mk.1, or two normal nodes with Mk.1).",
          "Water needed: **8 × 45 = 360 m³/min** = exactly **3 Water Extractors at 100%** (120 each).",
          "Run one Mk.1 pipe (300 m³/min max) from two extractors to gens 1–5, and a second pipe from extractor 3 to gens 6–8.",
          "Belt the coal into the generators as a manifold (one belt, splitter per gen). Fill the Mk.1 belt before connecting power.",
          "Connect to your grid. Your Biomass Burners can retire now.",
        ],
      },
      {
        id: "p3-steelms",
        title: "Milestone: Basic Steel Production",
        goal: "Foundry, Steel Beam, Steel Pipe, Versatile Framework",
        steps: ["Turn in **Basic Steel Production**: 50 Modular Frame, 150 Rotor, 500 Concrete, 1000 Wire. (Hand-craft the Modular Frames, or let the Smart Plating module's iron feed a small frame line.)"],
      },
      {
        id: "p3-steel",
        title: "Build Outpost: Steel at the node",
        goal: "15 Steel Beam + 20 Steel Pipe/min, made where iron and coal meet",
        steps: [
          "Find an iron node and a coal node close together. Build here, so **ore never travels**.",
          "Run both miners at the rates in the box (90 iron + 90 coal/min). A normal node with Mk.1 gives 60, so use 2 nodes or wait for Mk.2.",
          "Build the foundries first, then the constructors. Send output to storage, with overflow to the sink.",
        ],
        calc: { targets: { "Steel Beam": 15, "Steel Pipe": 20 } },
      },
      {
        id: "p3-sam",
        title: "Build Outpost: Reanimated SAM",
        goal: "15 Reanimated SAM/min for SAM Fluctuators",
        steps: [
          "In the MAM, research **SAM Reanimation** (20 SAM), then **SAM Fluctuator** (10 Reanimated SAM, 100 Steel Pipe, 200 Wire).",
          "Use the scanner to find a SAM node. A Mk.1 Miner on a **normal** node gives exactly the 60 SAM/min needed (impure: Mk.1 at 100% gives 30, so the constructor runs at 25%).",
          "Build the constructor below and belt it into a storage container.",
        ],
        calc: { targets: { "Reanimated SAM": 15 } },
      },
      {
        id: "p3-depot",
        title: "Unlock the Dimensional Depot",
        goal: "Building materials upload to the cloud. No more trips to base.",
        steps: [
          "Hand-craft **11 SAM Fluctuators** (each: 6 Reanimated SAM, 5 Wire, 3 Steel Pipe).",
          "In the MAM Mercer Sphere tree, research **Dimensional Depot**: 1 Mercer Sphere, 11 SAM Fluctuator.",
          "Each **Depot Uploader** costs 1 Mercer Sphere, 10 SAM Fluctuator, 10 Modular Frame, 100 Wire. Build your first one on the Iron Plate/Rod/Screw storage.",
          "Next uploaders, in priority order: Concrete → Wire/Cable → Steel Beam/Pipe → Reinforced Iron Plate.",
        ],
      },
      {
        id: "p3-vf",
        title: "Build Module: Versatile Framework",
        goal: "2.5 Versatile Framework/min (Phase 2 needs 1000)",
        steps: [
          "Build this right next to the steel outpost. It takes **all 15 Steel Beam/min** by belt, so redirect the beam output here.",
          "Give it its own iron node for the Modular Frames: **30 iron ore/min** (Mk.1 on a normal node at **50%**).",
          "Build from the bottom up as listed. VF goes to storage (and later to an uploader).",
        ],
        calc: { targets: { "Versatile Framework": 2.5 }, supplied: ["Steel Beam"] },
      },
    ],
    side: [
      {
        id: "p3-side-caterium",
        title: "Caterium run → Smart Splitter",
        steps: [
          "MAM: **Caterium Ingots** (50 Caterium Ore) → **Quickwire** (50 Caterium Ingot) → **AI Limiter** (200 Quickwire, 50 Copper Sheet) → **Smart Splitter** (10 AI Limiter, 50 RIP).",
          "Hand-craft the Caterium parts from ore you carry back. You don't need a factory yet.",
          "Then swap each module's overflow splitter for a Smart Splitter (Rules tab, *Overflow*).",
        ],
      },
      {
        id: "p3-side-security",
        title: "Milestone: Vehicular Transport (optional)",
        steps: ["Turn in **Vehicular Transport**: 25 Modular Frame, 100 Rotor, 200 Cable, 400 Iron Plate. Useful later for the Buffer Rule truck routes."],
      },
      {
        id: "p3-side-spheres",
        title: "Mercer Sphere hunt #2",
        steps: ["Collect 10+ Mercer Spheres. Each uploader costs one, and Depot upgrades need 3 → 7 → 13 → 23."],
      },
    ],
  },
  {
    id: "p4",
    title: "Phase 2 Push",
    tier: "Tier 4 · Space Elevator Phase 2",
    blurb: "Mk.2 miners, Mk.3 belts and Blueprints. Then three calm modules that build up Phase 2 while you're AFK.",
    missions: [
      {
        id: "p4-advsteel",
        title: "Milestone: Advanced Steel Production",
        goal: "Miner Mk.2, Encased Industrial Beam, Stator, Motor, Automated Wiring",
        steps: [
          "Turn in **Advanced Steel Production**: 100 Steel Pipe, 100 Modular Frame, 200 Rotor, 500 Concrete.",
          "Swap your Mk.1 miners for Mk.2 (double rate) only where a module needs more ore. Otherwise leave them alone.",
        ],
      },
      {
        id: "p4-blueprints",
        title: "Milestone: FICSIT Blueprints",
        goal: "Blueprint Designer unlocked",
        steps: [
          "Turn in **FICSIT Blueprints**: 100 Modular Frame, 200 Steel Beam, 500 Cable, 1000 Concrete.",
          "Make your three core 4×4 blueprints: **Smelter Stack**, **Assembler Pair** and **Logistics Pillar** (vertical lift + splitter). Rules tab has the checklist.",
        ],
      },
      {
        id: "p4-logmk3",
        title: "Milestone: Logistics Mk.3",
        goal: "Mk.3 belts (270/min) + Industrial Storage Container",
        steps: ["Turn in **Logistics Mk.3**: 200 Steel Beam, 200 Steel Pipe, 400 Reinforced Iron Plate."],
      },
      {
        id: "p4-sp",
        title: "Upgrade Module: Smart Plating to 5/min",
        goal: "5 Smart Plating/min. 1000 takes 200 minutes.",
        steps: [
          "Rebuild (or copy with your blueprints) the Smart Plating module at the size below.",
          "Iron need goes up to 116.25 ore/min, so use a Mk.2 miner on a normal node (120) clocked to **96.875%**.",
        ],
        calc: { targets: { "Smart Plating": 5 } },
      },
      {
        id: "p4-aw",
        title: "Build Module: Automated Wiring",
        goal: "1 Automated Wiring/min (Phase 2 needs 100)",
        steps: [
          "Needs steel pipe (from the steel outpost or the Depot) plus copper. Place it near copper.",
          "Build as listed below.",
        ],
        calc: { targets: { "Automated Wiring": 1 }, supplied: ["Steel Pipe"] },
      },
      {
        id: "p4-elev2",
        title: "Ship Space Elevator Phase 2",
        goal: "Tiers 5 and 6 unlocked",
        steps: [
          "Collect **1000 Smart Plating, 1000 Versatile Framework, 100 Automated Wiring**.",
          "Go mercer-hunting or tidy the base while it fills up. Then send it.",
        ],
      },
    ],
    side: [
      {
        id: "p4-side-hyper",
        title: "Milestone: Hypertubes (optional)",
        steps: ["Turn in **Hypertubes**: 50 Encased Industrial Beam, 300 Steel Pipe, 500 Copper Sheet."],
      },
      {
        id: "p4-side-power",
        title: "Milestone: Expanded Power Infrastructure (optional)",
        steps: ["Turn in **Expanded Power Infrastructure**: 50 Encased Industrial Beam, 100 Steel Beam, 200 Modular Frame, 2000 Wire. Power Storage buffers your grid against blackouts."],
      },
      {
        id: "p4-side-eib",
        title: "Build Module: Encased Industrial Beam",
        steps: ["Small module for the many EIB costs in Tiers 4–6."],
        calc: { targets: { "Encased Industrial Beam": 6 } },
      },
      {
        id: "p4-side-depotup",
        title: "Depot upgrade: Upload 30/min",
        steps: ["MAM: **Upload Upgrade: 30/min**: 3 Mercer Sphere, 47 SAM Fluctuator."],
      },
    ],
  },
  {
    id: "p5",
    title: "Oil",
    tier: "Tier 5",
    blurb: "Oil gets refined where it comes out of the ground, and only solid plastic and rubber leave. The same oil gives you 1000 MW of fuel power.",
    missions: [
      {
        id: "p5-oilms",
        title: "Milestone: Oil Processing",
        goal: "Oil Extractor, Refinery, Plastic, Rubber, Fuel, Circuit Board",
        steps: ["Turn in **Oil Processing**: 50 Motor, 100 Encased Industrial Beam, 500 Steel Pipe, 500 Copper Sheet. (Craft Motors by hand, or build a 1/min Motor line.)"],
      },
      {
        id: "p5-plastic",
        title: "Build Outpost: Plastic + Rubber at the oil field",
        goal: "60 Plastic + 60 Rubber/min. Solids only leave the site.",
        steps: [
          "Pick an oil field with at least 180 crude/min (e.g. one pure node at 240, clocked down to 75%).",
          "Build the refineries below. Heavy Oil Residue is a byproduct, so it gets its own **overflow**: send it to a Fluid Buffer or package it and sink it, so refineries never back up.",
          "Put a Depot Uploader on the Plastic and Rubber.",
        ],
        calc: { targets: { Plastic: 60, Rubber: 60 } },
      },
      {
        id: "p5-fuelpower",
        title: "Build Outpost: 1000 MW Fuel Power",
        goal: "4 Fuel Generators at 100% = 1000 MW",
        steps: [
          "Fuel Generator: **250 MW** burning **20 Fuel/min**, so 4 gens = 80 Fuel/min.",
          "Build the refineries below **next to the oil**, with the generators right beside them.",
          "Polymer Resin byproduct → package/sink, or belt it into storage for later Residual recipes.",
        ],
        calc: { targets: { Fuel: 80 } },
      },
      {
        id: "p5-petrolms",
        title: "Milestone: Petroleum Power",
        goal: "Fuel Generator + Industrial Fluid Buffer",
        steps: ["Turn in **Petroleum Power**: 100 Motor, 100 Encased Industrial Beam, 200 Rubber, 200 Plastic. (Do this one *before* placing the generators above.)"],
      },
      {
        id: "p5-logmk4",
        title: "Milestone: Logistics Mk.4",
        goal: "Mk.4 belts (480/min) + Truck",
        steps: ["Turn in **Logistics Mk.4**: 200 Rubber, 300 Encased Industrial Beam, 400 Modular Frame."],
      },
      {
        id: "p5-circuit",
        title: "Build Module: Circuit Boards",
        goal: "5 Circuit Board/min (feeds Computers in Tier 6)",
        steps: ["Place it next to the plastic outpost, with copper sheets coming in by truck or Depot."],
        calc: { targets: { "Circuit Board": 5 } },
      },
    ],
    side: [
      {
        id: "p5-side-jetpack",
        title: "Milestone: Jetpack",
        steps: ["Turn in **Jetpack**: 50 Motor, 1000 Cable, 1000 Iron Plate."],
      },
      {
        id: "p5-side-pack",
        title: "Milestone: Fluid Packaging",
        steps: ["Turn in **Fluid Packaging**: 200 Plastic, 400 Steel Beam, 1000 Copper Sheet. Useful for packaging HOR/resin into the sink."],
      },
      {
        id: "p5-side-quickwire",
        title: "Build Outpost: Caterium",
        steps: ["Caterium ore → Quickwire at the node. You'll need lots of Quickwire later (AI Limiters, HSCs)."],
        calc: { targets: { Quickwire: 60 } },
      },
    ],
  },
  {
    id: "p6",
    title: "Manufacturing & Trains",
    tier: "Tier 6 · Space Elevator Phase 3",
    blurb: "The Manufacturer arrives, along with Computers, Heavy Frames and trains. Space Elevator Phase 3 is the biggest build so far, so it's split into four small modules.",
    missions: [
      {
        id: "p6-manu",
        title: "Milestone: Industrial Manufacturing",
        goal: "Manufacturer, Computer, Heavy Modular Frame, Modular Engine, ACU",
        steps: ["Turn in **Industrial Manufacturing**: 200 Motor, 200 Modular Frame, 400 Plastic, 1000 Cable."],
      },
      {
        id: "p6-trainms",
        title: "Milestone: Monorail Train Technology",
        goal: "Trains unlocked",
        steps: [
          "Turn in **Monorail Train Technology**: 250 Motor, 500 Encased Industrial Beam, 1000 Steel Beam, 1000 Steel Pipe.",
          "First line: oil outpost ⇄ main base. Use the **Buffer Rule** (Rules tab) at both ends.",
        ],
      },
      {
        id: "p6-me",
        title: "Build Module: Modular Engine",
        goal: "1 Modular Engine/min (Phase 3 needs 500)",
        steps: ["Rubber comes from the oil outpost and Smart Plating from your 5/min module. Build the rest as listed below."],
        calc: { targets: { "Modular Engine": 1 }, supplied: ["Smart Plating", "Rubber", "Steel Pipe"] },
      },
      {
        id: "p6-computer",
        title: "Build Module: Computers",
        goal: "2.5 Computer/min",
        steps: ["Sits next to the Circuit Board module. One Manufacturer at 100%."],
        calc: { targets: { Computer: 2.5 }, supplied: ["Circuit Board", "Plastic"] },
      },
      {
        id: "p6-hmf",
        title: "Build Module: Heavy Modular Frame",
        goal: "1 Heavy Modular Frame/min",
        steps: ["Steel outpost supplies pipe/beam. Expand that outpost or give this module its own iron + coal."],
        calc: { targets: { "Heavy Modular Frame": 1 }, supplied: ["Steel Pipe", "Steel Beam", "Concrete"] },
      },
      {
        id: "p6-acu",
        title: "Build Module: Adaptive Control Unit",
        goal: "0.5 ACU/min (Phase 3 needs 100)",
        steps: ["Pulls Computers, HMF and Automated Wiring from the Depot or by belt."],
        calc: { targets: { "Adaptive Control Unit": 0.5 }, supplied: ["Computer", "Heavy Modular Frame", "Automated Wiring", "Circuit Board"] },
      },
      {
        id: "p6-vf2",
        title: "Scale Versatile Framework to 10/min",
        goal: "2500 VF in ~4 hours",
        steps: ["Copy your VF module with a blueprint so you have two of them."],
        calc: { targets: { "Versatile Framework": 10 } },
      },
      {
        id: "p6-elev3",
        title: "Ship Space Elevator Phase 3",
        goal: "Tiers 7 and 8 unlocked",
        steps: ["Collect **2500 Versatile Framework, 500 Modular Engine, 100 Adaptive Control Unit**, then send it."],
      },
    ],
    side: [
      {
        id: "p6-side-signal",
        title: "Milestone: Railway Signalling",
        steps: ["Turn in **Railway Signalling**: 50 Computer, 400 Steel Pipe, 1000 Copper Sheet. Needed once you have two trains on one track."],
      },
      {
        id: "p6-side-pipe2",
        title: "Milestone: Pipeline Engineering Mk.2",
        steps: ["Turn in **Pipeline Engineering Mk.2**: 50 Heavy Modular Frame, 1000 Plastic, 1000 Rubber. Mk.2 pipes carry 600 m³/min."],
      },
      {
        id: "p6-side-bp2",
        title: "Milestone: FICSIT Blueprints Mk.2",
        steps: ["Turn in **FICSIT Blueprints Mk.2**: 100 Heavy Modular Frame, 100 Computer, 400 Rubber, 1500 Concrete. Unlocks bigger blueprint designer for floors of your vertical factories."],
      },
      {
        id: "p6-side-depot60",
        title: "Depot upgrade: Upload 60/min",
        steps: ["MAM: **Upload Upgrade: 60/min**: 7 Mercer Sphere, 103 SAM Fluctuator. Build a small SAM Fluctuator Manufacturer line if hand-crafting gets old."],
        calc: { targets: { "SAM Fluctuator": 2 }, supplied: ["Steel Pipe"] },
      },
    ],
  },
  {
    id: "p7",
    title: "The Aluminum Wall",
    tier: "Tier 7",
    blurb: "This is where it got overwhelming last time. Do it in three steps: the water loop first, then the refineries, then the foundries. The math is all below.",
    missions: [
      {
        id: "p7-bauxms",
        title: "Milestone: Bauxite Refinement",
        goal: "Alumina Solution, Aluminum Scrap, Aluminum Ingot unlocked",
        steps: ["Turn in **Bauxite Refinement**: 100 Computer, 100 Heavy Modular Frame, 250 Motor, 500 Rubber."],
      },
      {
        id: "p7-water",
        title: "Aluminum step 1: the water loop (build this first)",
        goal: "VIP water loop built and tested before any refinery runs",
        steps: [
          "Read the Rules tab card **Aluminum VIP water loop** once.",
          "Pick a bauxite node with quartz and coal reachable (or bring those in by train). Build on-site.",
          "Place **1 Water Extractor** (fresh water = 180 needed − 60 byproduct = **120 m³/min**, exactly one extractor at 100%).",
          "Run the **byproduct water** pipe from the Scrap refinery so it joins the line **after** the fresh water valve, right at the front of the Alumina refinery. Byproduct gets priority.",
          "Cap the fresh line with a **Valve set to 120**.",
          "Add the emergency overflow: a branch to a **Refinery making Wet Concrete** (or a Fluid Buffer) that only fills if the loop backs up.",
        ],
      },
      {
        id: "p7-refine",
        title: "Aluminum step 2: refineries + silica",
        goal: "120 Alumina Solution and 180 Aluminum Scrap per minute",
        steps: [
          "Build the Alumina Solution refinery and the Scrap refinery at the clocks below. Hook up the water loop from step 1.",
          "Build the Silica constructors from Raw Quartz. The Alumina refinery also gives 50 Silica/min as a byproduct, so merge it in.",
          "Run for 5 minutes and check every pipe is flowing and no refinery says *output full*.",
        ],
        calc: { targets: { "Aluminum Ingot": 120 } },
      },
      {
        id: "p7-ingot",
        title: "Aluminum step 3: foundries → ingots → upload",
        goal: "120 Aluminum Ingot/min leaving the site as solids",
        steps: [
          "Add the 2 Foundries at 100%. Ingots go to storage + uploader, overflow to the sink.",
          "Tick this once ingots have been flowing for 10 minutes without a stall.",
        ],
      },
      {
        id: "p7-alclad",
        title: "Build Module: Alclad Sheet + Casing",
        goal: "30 Alclad Sheet + 40 Aluminum Casing per minute",
        steps: ["Fed by the 120 ingot/min outpost (by belt or Depot) plus 10 Copper Ingot/min. Uses exactly 90 of the 120 ingots; the other 30 overflow to storage."],
        calc: { targets: { "Alclad Aluminum Sheet": 30, "Aluminum Casing": 40 }, supplied: ["Aluminum Ingot", "Copper Ingot"] },
      },
      {
        id: "p7-control",
        title: "Milestone: Control System Development",
        goal: "Battery, Radio Control Unit, Supercomputer, Assembly Director System",
        steps: ["Turn in **Control System Development**: 200 Alclad Aluminum Sheet, 400 Aluminum Casing, 200 Computer, 1000 Plastic."],
      },
      {
        id: "p7-logmk5",
        title: "Milestone: Logistics Mk.5",
        goal: "Mk.5 belts (780/min)",
        steps: ["Turn in **Logistics Mk.5**: 200 Alclad Aluminum Sheet, 400 Encased Industrial Beam, 600 Reinforced Iron Plate."],
      },
      {
        id: "p7-super",
        title: "Build Module: Supercomputer",
        goal: "0.5 Supercomputer/min (feeds ADS and Nuclear Power)",
        steps: ["Big chain. Build it one machine type at a time, top to bottom of the list."],
        calc: { targets: { Supercomputer: 0.5 }, supplied: ["Computer", "Plastic", "Quickwire"] },
      },
    ],
    side: [
      {
        id: "p7-side-hover",
        title: "Milestone: Hoverpack",
        steps: ["Turn in **Hoverpack**: 100 Alclad Aluminum Sheet, 100 Heavy Modular Frame, 100 Computer, 250 Motor."],
      },
      {
        id: "p7-side-hazmat",
        title: "Milestone: Hazmat Suit",
        steps: ["Turn in **Hazmat Suit**: 50 Gas Filter, 100 Aluminum Casing, 500 Quickwire. Needed before you handle Uranium."],
      },
      {
        id: "p7-side-depot120",
        title: "Depot upgrade: Upload 120/min",
        steps: ["MAM: **Upload Upgrade: 120/min**: 13 Mercer Sphere, 151 SAM Fluctuator."],
      },
    ],
  },
  {
    id: "p8",
    title: "Nuclear & Advanced Parts",
    tier: "Tier 8 · Space Elevator Phase 4",
    blurb: "Nuclear power and the Phase 4 parts. Every module here is still just a target rate and a box of machines.",
    missions: [
      {
        id: "p8-nucms",
        title: "Milestone: Nuclear Power",
        goal: "Nuclear Power Plant, Uranium Fuel Rod, Magnetic Field Generator",
        steps: ["Turn in **Nuclear Power**: 50 Supercomputer, 200 Heavy Modular Frame, 1000 Cable, 2000 Concrete."],
      },
      {
        id: "p8-nuke",
        title: "Build Outpost: 2 Nuclear Plants (5000 MW)",
        goal: "0.4 Uranium Fuel Rod/min, 2 plants at 100%",
        steps: [
          "Each plant: **2500 MW**, burns **0.2 Uranium Fuel Rod/min**, needs **240 m³ water/min** (2 extractors each).",
          "Build the fuel rod chain below at the uranium node. Wear the Hazmat Suit.",
          "Waste: 10 Uranium Waste/min per plant. It **can't be sunk**. Belt it into Industrial Storage Containers, far from where you walk.",
        ],
        calc: { targets: { "Uranium Fuel Rod": 0.4 }, supplied: ["Encased Industrial Beam", "Stator", "AI Limiter", "Concrete"] },
      },
      {
        id: "p8-advalu",
        title: "Milestone: Advanced Aluminum Production",
        goal: "Heat Sink, Cooling System, Fused Modular Frame, Resource Wells",
        steps: ["Turn in **Advanced Aluminum Production**: 50 Radio Control Unit, 200 Aluminum Casing, 400 Alclad Aluminum Sheet, 3000 Wire."],
      },
      {
        id: "p8-edge",
        title: "Milestone: Leading-Edge Production",
        goal: "Turbo Motor, Miner Mk.3, Thermal Propulsion Rocket",
        steps: ["Turn in **Leading-Edge Production**: 50 Fused Modular Frame, 100 Supercomputer, 1000 Steel Pipe."],
      },
      {
        id: "p8-particle",
        title: "Milestone: Particle Enrichment",
        goal: "Particle Accelerator, Nuclear Pasta",
        steps: ["Turn in **Particle Enrichment**: 50 Turbo Motor, 100 Fused Modular Frame, 200 Cooling System, 2500 Quickwire."],
      },
      {
        id: "p8-ads",
        title: "Build Module: Assembly Director System",
        goal: "0.5 ADS/min",
        steps: [
          "Needs **1 ACU/min + 0.5 Supercomputer/min**: copy your ACU module once (2 × 0.5) and your Supercomputer module once, so the originals keep feeding everything else.",
          "Read the exact Phase 4 counts off the Space Elevator screen and write them on a sign next to this module.",
        ],
        calc: { targets: { "Assembly Director System": 0.5 }, supplied: ["Adaptive Control Unit", "Supercomputer"] },
      },
      {
        id: "p8-mfg",
        title: "Build Module: Magnetic Field Generator",
        goal: "1 MFG/min",
        steps: ["Uses Versatile Framework from your VF modules and Electromagnetic Control Rods."],
        calc: { targets: { "Magnetic Field Generator": 1 }, supplied: ["Versatile Framework", "Stator", "AI Limiter"] },
      },
      {
        id: "p8-tpr",
        title: "Build Module: Thermal Propulsion Rocket",
        goal: "0.5 TPR/min",
        steps: [
          "Nitrogen Gas comes from a **Resource Well** (one Pressurizer + Extractors on its satellite nodes). Build this module at the well.",
          "Build one machine type at a time, in the order of the box: Heat Sink → Cooling System → Fused Frame → Turbo Motor → Rocket.",
        ],
        calc: { targets: { "Thermal Propulsion Rocket": 0.5 }, supplied: ["Modular Engine", "Heavy Modular Frame", "Radio Control Unit", "Motor", "Rubber", "Alclad Aluminum Sheet", "Aluminum Casing", "Copper Sheet"] },
      },
      {
        id: "p8-pasta",
        title: "Build Module: Nuclear Pasta",
        goal: "0.5 Nuclear Pasta/min",
        steps: [
          "Build this **at a copper field**. It needs 600 copper ore/min, so copper never leaves the site. If you own **Pure Copper Ingot**, tick it in Settings: that cuts the ore to 240/min.",
          "Particle Accelerators draw a lot of power that varies as they run. Make sure the nuclear plants are online first.",
        ],
        calc: { targets: { "Nuclear Pasta": 0.5 }, supplied: ["Fused Modular Frame", "Radio Control Unit"] },
      },
      {
        id: "p8-elev4",
        title: "Ship Space Elevator Phase 4",
        goal: "Tier 9 unlocked",
        steps: ["Fill the elevator with the ADS, Magnetic Field Generators, Nuclear Pasta and Thermal Propulsion Rockets it asks for, then send it."],
      },
    ],
    side: [
      {
        id: "p8-side-drones",
        title: "Milestone: Aeronautical Engineering",
        steps: ["Turn in **Aeronautical Engineering**: 50 Radio Control Unit, 100 Alclad Aluminum Sheet, 200 Aluminum Casing, 300 Motor. Drones replace short truck routes."],
      },
      {
        id: "p8-side-depot240",
        title: "Depot upgrade: Upload 240/min",
        steps: ["MAM: **Upload Upgrade: 240/min**: 23 Mercer Sphere, 199 SAM Fluctuator."],
      },
    ],
  },
  {
    id: "p9",
    title: "Project Assembly",
    tier: "Tier 9 · Space Elevator Phase 5",
    blurb: "The finale: matter conversion, quantum parts and the last shipment.",
    missions: [
      {
        id: "p9-matter",
        title: "Milestone: Matter Conversion",
        goal: "Converter, Ficsite, Time Crystal, Biochemical Sculptor",
        steps: ["Turn in **Matter Conversion**: 100 Fused Modular Frame, 250 Radio Control Unit, 500 Cooling System."],
      },
      {
        id: "p9-quantum",
        title: "Milestone: Quantum Encoding",
        goal: "Quantum Encoder, Dark Matter, Superposition Oscillator, AI Expansion Server",
        steps: ["Turn in **Quantum Encoding**: 50 Time Crystal, 100 Ficsite Trigon, 200 Turbo Motor, 400 Supercomputer."],
      },
      {
        id: "p9-spatial",
        title: "Milestone: Spatial Energy Regulation",
        goal: "Singularity Cell, Ballistic Warp Drive",
        steps: ["Turn in **Spatial Energy Regulation**: 100 Superposition Oscillator, 250 Turbo Motor, 500 Radio Control Unit, 1000 SAM Fluctuator."],
      },
      {
        id: "p9-sculptor",
        title: "Build Module: Biochemical Sculptor",
        goal: "2 Biochemical Sculptor/min (Phase 5 needs 1000)",
        steps: ["Converters and Ficsite first, then the sculptor line."],
        calc: { targets: { "Biochemical Sculptor": 2 }, supplied: ["Assembly Director System", "Aluminum Ingot", "Reanimated SAM"] },
      },
      {
        id: "p9-ai",
        title: "Build Module: AI Expansion Server",
        goal: "0.5 AI Expansion Server/min (Phase 5 needs 256)",
        steps: ["Quantum Encoders give off Dark Matter Residue as a byproduct, so send it to its own overflow."],
        calc: { targets: { "AI Expansion Server": 0.5 }, supplied: ["Magnetic Field Generator", "Supercomputer", "Crystal Oscillator", "Alclad Aluminum Sheet", "Aluminum Ingot", "Reanimated SAM"] },
      },
      {
        id: "p9-bwd",
        title: "Build Module: Ballistic Warp Drive",
        goal: "0.5 Ballistic Warp Drive/min (Phase 5 needs 200)",
        steps: ["Reuses your Thermal Propulsion Rocket module. Expand it, or upload its output and pull from the Depot."],
        calc: { targets: { "Ballistic Warp Drive": 0.5 }, supplied: ["Thermal Propulsion Rocket", "Nuclear Pasta", "Alclad Aluminum Sheet", "Crystal Oscillator", "Heavy Modular Frame", "Reanimated SAM"] },
      },
      {
        id: "p9-pasta2",
        title: "Scale Nuclear Pasta to 1/min",
        goal: "1000 Nuclear Pasta in ~17 hours of runtime",
        steps: ["Copy your pasta module once with blueprints (2 × 0.5/min). Let it run while you build the other Phase 5 modules."],
        calc: { targets: { "Nuclear Pasta": 1 }, supplied: ["Fused Modular Frame", "Radio Control Unit"] },
      },
      {
        id: "p9-elev5",
        title: "Ship Space Elevator Phase 5 🚀",
        goal: "Project Assembly complete",
        steps: ["Collect **1000 Nuclear Pasta, 1000 Biochemical Sculptor, 256 AI Expansion Server, 200 Ballistic Warp Drive**, then send it and watch the ending."],
      },
    ],
    side: [
      {
        id: "p9-side-peak",
        title: "Milestone: Peak Efficiency",
        steps: ["Turn in **Peak Efficiency**: 250 Time Crystal, 250 Ficsite Trigon, 5000 Alclad Aluminum Sheet, 10000 Iron Plate. Mk.6 belts (1200/min)."],
      },
      {
        id: "p9-side-bp3",
        title: "Milestone: FICSIT Blueprints Mk.3",
        steps: ["Turn in **FICSIT Blueprints Mk.3**: 100 Neural-Quantum Processor, 250 Time Crystal, 500 Ficsite Trigon, 500 Fused Modular Frame."],
      },
    ],
  },
];

// The approved alternates. Ticking one in Settings swaps it into every calculation.
window.APPROVED_ALTS = [
  { name: "Alternate: Pure Iron Ingot", note: "Refinery: iron ore + water → more ingots per ore." },
  { name: "Alternate: Pure Copper Ingot", note: "Refinery: copper ore + water → 2.5× ingots per ore." },
  { name: "Alternate: Pure Caterium Ingot", note: "Refinery: caterium ore + water." },
  { name: "Alternate: Solid Steel Ingot", note: "Foundry: iron ingot + coal → steel." },
  { name: "Alternate: Sloppy Alumina", note: "No silica byproduct. Only take this together with Electrode Scrap, and only if you have oil nearby for Petroleum Coke." },
  { name: "Alternate: Electrode Aluminum Scrap", note: "Uses Petroleum Coke instead of Coal." },
];

// Your fixed playstyle rules, so you don't have to decide them again every session.
window.RULES = [
  {
    title: "100% uptime, exact clocks",
    body: [
      "Every module's box tells you **how many machines** and the **exact clock %**. All machines in a group run at the same clock.",
      "Type clocks with 4 decimals (e.g. 66.6667). The game accepts them.",
      "Miners: clock the miner so it gives exactly the ore the module needs. Mk.1 / Mk.2 / Mk.3 on a normal node = 60 / 120 / 240 per min (impure ×0.5, pure ×2).",
    ],
  },
  {
    title: "Overflow (Smart Splitter)",
    body: [
      "Module output → **Smart Splitter**: *Center* = main storage / Depot Uploader. *Overflow* = next production chain or AWESOME Sink.",
      "Result: storage fills first, then the sink takes everything else. Machines never stall and you keep earning coupons.",
    ],
  },
  {
    title: "Overflow before Smart Splitters",
    body: [
      "Until the Smart Splitter is researched (Tier 3 side quest): put a plain **Splitter** before the storage. Output 1 → storage, Output 2 → sink.",
      "It sends half to the sink until storage is full, then everything. Not perfect, but nothing ever stalls.",
    ],
  },
  {
    title: "Refine at the source",
    body: [
      "Ore and fluids **never** leave the outpost. Only solid parts travel: ingots, beams, plastic, rubber, aluminum ingots.",
      "If a recipe needs a second raw input (e.g. coal for steel), pick a site where both are close.",
    ],
  },
  {
    title: "The Buffer Rule (trains & trucks)",
    body: [
      "Before every **loading** platform: Industrial Storage Container → **two Mk.3+ belts** → platform.",
      "After every **unloading** platform: platform → **two Mk.3+ belts** → Industrial Storage Container → factory.",
      "The container absorbs the ~25 s docking pause, so the factory side keeps a steady 100% flow.",
    ],
  },
  {
    title: "Alternate recipes: the short list",
    body: [
      "Default to **standard recipes**. Hard drive picks: take one from this list if it's offered, otherwise take whatever is first and forget it.",
      "Approved: **Pure Iron Ingot, Pure Copper Ingot, Pure Caterium Ingot, Solid Steel Ingot, Sloppy Alumina + Electrode Aluminum Scrap**.",
      "Tick the ones you've unlocked in **Settings** and every mission's math updates by itself.",
    ],
  },
  {
    title: "Aluminum VIP water loop",
    body: [
      "Byproduct water from the Scrap refinery feeds **straight into** the Alumina refinery's water input. It joins **after** the fresh water valve, so it always gets used first.",
      "Fresh water line has a **Valve capped at (water needed − byproduct)**. Base recipes: 180 − 60 = **120 m³/min**.",
      "Emergency overflow: a branch to a Wet Concrete refinery or Fluid Buffer, so a backed-up loop never jams the Scrap refinery.",
    ],
  },
  {
    title: "Blueprints (4×4 foundation modules)",
    body: [
      "**Smelter Stack**: 2 smelters, input manifold, power pole, output to one side.",
      "**Assembler Pair**: 2 assemblers, 2 inputs, 1 output, overflow splitter slot.",
      "**Logistics Pillar**: conveyor lift up/down + splitter/merger + power, for vertical multi-floor builds.",
      "Make one, test it once, then just stamp it.",
    ],
  },
  {
    title: "Power cheat sheet",
    body: [
      "Biomass Burner **30 MW**: 10 Biomass/min or 4 Solid Biofuel/min.",
      "Coal Generator **75 MW**: 15 coal/min + 45 m³ water/min. 8 gens = 600 MW = 120 coal + 3 Water Extractors.",
      "Fuel Generator **250 MW**: 20 Fuel/min.",
      "Nuclear Plant **2500 MW**: 0.2 Uranium Fuel Rod/min + 240 m³ water/min.",
      "Underclocked machines use less power: power × (clock)^1.32. Each mission box shows the module's total.",
    ],
  },
];
