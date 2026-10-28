# Satisfactory Guide

A personal, one-step-at-a-time guide from landing in the Rocky Desert to Project Assembly (Satisfactory 1.x, Peaceful mode).

- **Now** shows your current mission, the focus picker, the tier's goal board (editable target rates and power goal) and every other mission in the tier. Drag or use ▲▼ to reorder; missions never move ahead of what they depend on.
- **My queue**: press **+ Queue** on any quest to line it up. The queue sits at the top of Now and List, can be dragged into any order, and the first ready quest in it becomes your current quest.
- **List** has five layouts (Stacked, Main | Side, By tag, By status, Table), tag filters and a hide-done toggle. Every section collapses and shows a count. **Flowchart** and **Mind map** show the same progress as diagrams.
- Every factory mission has a **machine box**: a floor-by-floor plan, a table and a flow diagram, with exact clocks, raw ore/min, what to bring in, byproducts and power.
- **Logistics**: a route calculator (vehicles, loop time → how many vehicles and how big the buffers), a "what feeds what" map of your built modules, and your own route list.
- **Alternates**: a ranked pick-list for hard drives. Tick what you own: unbuilt modules switch their math, built ones get an optional upgrade mission.
- **Stats**: power, modules, play time and how much of each part of the game (MAM, exploration, vehicles…) you've done.
- **Rules** holds the playstyle rules. **Settings** has the progress code backup.

Progress is saved in your browser. When opened as a claude.ai artifact while signed in, it also syncs to your account, so any device picks up where you left off.

## Using it

No install or build needed. Either:

- **Open `index.html`** in a browser (double-click it after downloading the repo), or
- **GitHub Pages**: repo *Settings → Pages → Deploy from a branch*, pick the branch and `/ (root)`. Then bookmark the URL.

Progress is saved per browser and per address, so keep using the same one. To move it, use the progress code in Settings.

## Files

| File | What it is |
| --- | --- |
| `js/missions.js` | The guide content: phases, missions, side quests, rules |
| `js/solver.js` | Production math (machine counts, clocks, byproduct netting) |
| `js/recipes.js` | Recipe data, generated. Don't edit by hand. |
| `js/app.js` | The UI and views |
| `tools/build_recipes.py` | Regenerates `js/recipes.js` after a game patch |
| `tests/check.js` | `node tests/check.js` checks the data and math |

To refresh recipe data after a game update:

```bash
curl -o /tmp/data.json https://raw.githubusercontent.com/greeny/SatisfactoryTools/dev/data/data.json
python3 tools/build_recipes.py /tmp/data.json > js/recipes.js
node tests/check.js
```
