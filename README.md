# Satisfactory Guide

A personal, one-step-at-a-time guide from landing in the Rocky Desert to Project Assembly (Satisfactory 1.x, Peaceful mode).

- **Now** shows only the mission you're on. The next one appears once you tick this one off.
- **List**, **Flowchart** and **Mind map** show the same progress three different ways. Click any mission to open it.
- Every factory mission has a **machine box**: machine counts, exact clock %, raw ore/min, what to bring in, byproducts to overflow and total power. Switch between table and flow diagram.
- **Rules** holds the fixed playstyle rules (overflow, Buffer Rule, refine at source, approved alternates, aluminum water loop).
- **Settings**: tick the approved alternates you've unlocked and all the math updates. You can also export/import a progress backup.

Progress is saved in your browser (localStorage).

## Using it

No install or build needed. Either:

- **Open `index.html`** in a browser (double-click it after downloading the repo), or
- **GitHub Pages**: repo *Settings → Pages → Deploy from a branch*, pick the branch and `/ (root)`. Then bookmark the URL.

Progress is saved per browser and per address, so keep using the same one. Use *Export* to move it.

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
