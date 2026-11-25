# Sizzle & Serve

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=referral&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun rank](https://make.fun/badge/best-cooking-game-20261125-0137/shutokasai1207-wq/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=referral&utm_campaign=best-cooking-game-20261125-0137)
[![make.fun reward](https://make.fun/badge/best-cooking-game-20261125-0137/shutokasai1207-wq/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=referral&utm_campaign=best-cooking-game-20261125-0137)

A tiny original cooking game for the [make.fun best-cooking-game-20261125-0137 bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). Run a one-chef kitchen through the lunch rush: grab ingredients from the crates, chop them on the boards, grill patties on the stoves, build dishes on the plates, and serve each order before its ticket runs out. Combos multiply your score; burnt patties go in the trash.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static HTTP server). No network requests, no build step.

- **Move:** WASD or arrow keys (mouse click on a station walks the chef there and uses it)
- **Use a station:** E or Space
- **Goal:** complete as many orders as you can in a 3-minute shift

Kitchen stations: ingredient crates (bun, patty, tomato, lettuce, cheese, onion), two chopping boards, two stoves, two plating counters, a serving window, and a trash bin. The menu: Classic Burger, Cheese Burger, and Garden Salad.

## Files

- `game/` — the playable game (plain canvas 2D, all art drawn in code, all sound synthesized with Web Audio)
  - `game/src/config.js` — constants, recipes, kitchen layout
  - `game/src/input.js` — keyboard and mouse input
  - `game/src/audio.js` — synthesized sound effects and music
  - `game/src/world.js` — player, stations, chopping and cooking
  - `game/src/orders.js` — order tickets, patience, scoring and combos
  - `game/src/render.js` — all canvas drawing
  - `game/src/main.js` — game loop, screens, screenshot staging
- `screenshots/` — real renders of the game running in a browser
- `main.ts` — copies `game/` and `screenshots/` to the output and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's library, copied unchanged

## License

MIT — see [LICENSE](LICENSE).

---

Built with [make.fun](https://make.fun/r/tbtbaqb8) — sign up with referral code `tbtbaqb8`.
