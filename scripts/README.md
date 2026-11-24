# Web scripts

Keep scripts grouped by their responsibility:

- `audits/` contains exhaustive data and rendered-page audits.
- `tests/` contains focused, deterministic regression tests.
- `data/` contains generated-asset download and update scripts.
- `support/` contains shared helpers for scripts.
- `withConfig.js` remains at the scripts root because it is the runtime wrapper for development and deployment commands.

Extend the suite for the affected behavior when adding a regression.

| Command | Coverage |
| --- | --- |
| `npm run test:pokedex` | Pokédex query serialization, search navigation, and card image candidates |
| `npm run test:pokemon-images` | Image loading surfaces and fallback sequences across Detail, Ranking, and Tools |
| `npm run test:route-navigation` | Route hydration, mobile navigation, and PvP navigation and loading states |
| `npm run test:app-shell` | API error messages, request cancellation, pre-hydration markup, hosting rewrites and caching, and public SEO assets |
| `npm run test:design-system` | Tailwind tokens and utilities, responsive variants, and shared typography |

Use the named package commands in `package.json` where available. Run the Raid
Battle layout audit directly with `node scripts/audits/auditRaidBattleLayout.mjs`
while Web and API are running. Add `--headed` to watch the Chrome interaction.
Run `npm run audit:typography -- --interactive` for a visible Chrome pass over
all registered routes at desktop and mobile widths in both Light and Dark themes.
Audit output is disposable and should use `artifacts/` or `/private/tmp`.
Successful local audits should not leave reports in the repository.

Run `npm run audit:assets` to verify both generated asset bundles, or run
`audit:local-ui-assets` and `audit:pokemon-icon-sheet` separately. These checks
use committed files and the icon audit reads the local API Pokémon data.
The two existing update commands share one entry point that requires a bundle
target. Each update downloads and replaces only its selected bundle.
