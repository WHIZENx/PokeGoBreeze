# PokeGoBreeze - Pokémon GO Tools & Information

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/badge/version-6.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.4.5-646CFF?logo=vite)

[![Vercel Production](https://img.shields.io/badge/Production-Vercel-000000?logo=vercel&logoColor=white)](https://poke-go-breeze.vercel.app/)
[![Firebase Production](https://img.shields.io/badge/Production-Firebase-FFCA28?logo=firebase&logoColor=black)](https://pokego-breeze.web.app/)

</div>

## Overview

PokeGoBreeze is a web application for Pokémon GO trainers who want to explore game data, compare Pokémon, analyze battles, and use gameplay calculators. The public web client consumes processed, versioned data from the PokeGoBreeze API so that data preparation and calculation logic stay consistent across pages.

**Key Highlights:**
- 🎮 Pokédex with 1,000+ Pokémon, forms, assets, moves, and detailed statistics
- ⚔️ Advanced PVP battle simulator with league rankings
- 📊 Comprehensive damage, DPS/TDO, and stats calculators
- 📰 Readable Game Master patch notes for webapp-relevant changes
- 🌟 Scheduled updates from Pokémon GO Game Master snapshots
- 🎨 Beautiful, responsive UI with theme customization
- ⚡ Fast performance with optimized loading and caching
- 📱 Mobile-friendly responsive design

## Architecture & Tech Stack

### Web/API Boundary

This repository contains the public React web client. Processed game data and calculation-heavy operations are provided by a separate API service through versioned `/api/v1` endpoints.

- The API publishes metadata and generated sections from one consistent Game Master snapshot.
- Pages request only the sections and endpoint results they need instead of loading the complete dataset at startup.
- The web client validates the processed-data schema before accepting a dataset.
- Pokémon GO assets use centralized URL resolution and fallback handling in the web client.
- Internal data-processing implementation and generated server data are not part of this public repository.

For local development, set `REACT_APP_DATA_API_URL` to a compatible deployed API or to the API service running locally.

The versions below reflect the currently committed `package-lock.json`.

### Frontend Framework
- **Core**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 6.4.5
- **State Management**:
  - Redux 4.2.1 with React-Redux 7.2.9
  - Redux Thunk 2.4.2 for async operations
  - Redux Persist 6.0.0 for browser caching
- **Routing**: React Router DOM 7.18.3
- **HTTP Client**: Axios 1.20.0

### UI & Styling
- **Component Libraries**:
  - Material UI (MUI) 5.18.0
  - MUI Icons Material 5.18.0
  - Styled Components 6.4.1
  - Emotion React 11.14.0 and Emotion Styled 11.14.1
- **Styling System**:
  - Tailwind CSS 3.4.19 is the primary design system for component and page changes
  - SCSS/Sass 1.83.0 with modern `@use` syntax supports global styles and cases that cannot be expressed reliably with Tailwind
  - Custom theming system with dark/light modes
  - PostCSS 8.5.26 with Autoprefixer 10.5.0
  - Shared typography tokens keep MUI, Tailwind, semantic elements, and native controls on one font and metric system
- **Data Visualization**:
  - React Data Table Component 8.12.0 for data grids
  - React XArrows 2.0.2 for visual connections
- **Utilities**:
  - Lodash 4.18.1 for data manipulation
  - Moment 2.31.0 for date/time handling
  - DOMPurify 3.4.17 for safe HTML rendering
  - Immutability Helper 3.1.1 for state updates
  - usehooks-ts 2.16.0 for reusable React hooks
  - React Device Detect 2.2.3 for device-aware UI

### Storage & Security
- **Client Storage**: LocalForage 1.10.0 with IndexedDB (localStorage fallback)
- **Data Persistence**: Redux Persist 6.0.0 caches public data and preferences without client-side encryption; `sensitiveData` is excluded

### Development Tools
- **Build System**: Vite 6 with custom configuration
  - Code splitting and lazy route imports
  - Chunk optimization for vendor libraries
  - Node.js polyfills (stream, buffer, util, process, events, vm)
- **Code Quality**:
  - ESLint 10.10.0 flat config with typescript-eslint 8.70.0 and eslint-react 5.19.1
  - Prettier 3.6.2 for code formatting
  - Stylelint 17.16.0 with `@stylistic/stylelint-plugin` 5.3.1 for SCSS/CSS linting
  - `@nabla/vite-plugin-eslint` 3.0.1 and `vite-plugin-stylelint` 6.3.0 for development feedback
- **TypeScript**:
  - Strict type checking (TypeScript 5.5.3)
  - Custom type definitions
  - Separate app/node tsconfig files

### Performance Optimization
- **Navigation and data loading**:
  - Route-level lazy imports keep feature code out of the initial bundle
  - The current page remains visible while the next route and its required data load
  - PvP Detail navigation prepares its page module and Pokémon response before switching views, avoiding an empty detail layout between rankings or matchup selections
  - API requests use debouncing, cancellation, stale-response guards, and request deduplication where applicable
  - Pages request and cache only their required processed-data sections
- **Production build**:
  - Vite splits major vendor libraries into stable chunks
  - JavaScript and CSS are minified for production
  - Fingerprinted assets use long-lived hosting cache headers

### Deployment & DevOps
- **Hosting**:
  - Vercel deployments for production and branch environments
  - Firebase Hosting deployments and pull-request previews
- **Containerization**: Docker Compose development environment with hot reload
- **CI/CD**:
  - GitHub Actions for automated workflows
  - A push to `develop`, `stage`, or `main` deploys that branch from this repository
- **Analytics**:
  - Vercel Analytics and Speed Insights run on `.vercel.app` hosts.
  - Firebase Hosting and other hosts skip the Vercel-only script endpoints so SPA fallbacks do not execute HTML as JavaScript.

## Project Structure

This tree shows the complete top-level `src` layout and selected feature subdirectories.

```text
src/
├── assets/                 # Images, icons, global styles, themes, and shared style types
│   ├── generated/          # Generated local UI, move-type, and Pokémon icon assets
│   │   ├── move-type-hq/
│   │   ├── move-type-mask/
│   │   ├── pokemon-go-ui/
│   │   └── pokemon-icons/
│   ├── styles/
│   └── types/
├── components/             # Reusable UI and domain components
│   ├── Card/
│   ├── Commons/
│   ├── Effective/
│   ├── ErrorBoundary/
│   ├── Find/
│   ├── Info/               # Pokémon detail sections, assets, evolution, encounter, and training costs
│   ├── Layout/             # Shared stable-height and page layout primitives
│   ├── Link/
│   ├── Raid/
│   ├── Spinner/
│   ├── Sprites/
│   ├── enums/
│   └── models/
├── composables/            # Reusable application hooks and store adapters
├── contexts/               # Options and snackbar React contexts
├── core/                   # Shared domain contracts
│   ├── constants/
│   ├── enums/
│   └── models/
├── enums/                  # Application-level enumerations
├── pages/                  # Route views and page-local code
│   ├── Error/
│   ├── GameMasterUpdates/
│   ├── Move/
│   ├── News/
│   ├── PVP/
│   │   ├── Battle/
│   │   ├── Leagues/
│   │   ├── Pokemon/
│   │   ├── Ranking/
│   │   ├── Teams/
│   │   ├── components/
│   │   ├── enums/
│   │   ├── models/
│   │   └── utils/
│   ├── Pokedex/
│   ├── Pokemon/
│   ├── Search/
│   │   ├── Moves/
│   │   ├── Pokemon/
│   │   └── Types/
│   ├── Sheets/
│   │   ├── DpsTdo/
│   │   └── StatsRanking/
│   ├── Sticker/
│   ├── Tools/
│   │   ├── BattleDamage/
│   │   ├── CalculatePoint/
│   │   ├── CalculateStats/
│   │   ├── CatchChance/
│   │   ├── FindTable/
│   │   ├── RaidBattle/
│   │   ├── SearchBattle/
│   │   └── StatsInfo/
│   ├── Trainer/            # Trainer Lab battle simulator and level rewards
│   ├── TypeEffect/
│   ├── Weather/
│   └── models/
├── services/               # API, processed-data, CPM, route-prefetch, and calculation services
│   └── models/
├── store/                  # Redux state and persistence
│   ├── actions/
│   ├── constants/
│   ├── middleware/
│   ├── models/
│   └── reducers/
├── types/                  # Global TypeScript declarations
├── utils/                  # Shared configuration and utilities
│   ├── configs/
│   ├── enums/
│   ├── extensions/
│   ├── helpers/
│   ├── hooks/
│   └── models/
├── App.tsx                 # Lazy routes and application bootstrap
├── App.scss
├── index.tsx               # React entry point
├── index.scss
├── react-app-env.d.ts
├── reportWebVitals.tsx
└── logo.svg
```

## Features

### 🏠 Home & Information

#### **Pokédex** (`/`)
Server-paginated Pokémon catalogue with name matching, release status, missing GO stats, type, generation, game version, and special-form filters. Each result links to its Pokémon detail page.
Its form list and totals use the same canonical/GO identity mapping as Pokémon Details. GO stats and assets are assigned only to the canonical form that owns the matching GO identity; other PokéAPI forms remain visible as not released in GO.

#### **Event Tickets** (`/news`)
API-backed Game Master ticket and event entries with dates, descriptions,
bonuses, rewards, and related assets when supplied by the generated snapshot.
This is not a live proxy of the official Pokémon GO News feed.

#### **Game Master Updates** (`/game-master-updates`, `/game-master-updates/:patchSlug`)
Paginated patch notes for web-relevant Game Master changes. Entries can be searched and filtered by section and status, while detail routes show readable changes and links to supported Pokémon or moves.

### 🔍 Search & Discovery

#### **Search Pokémon** (`/search-pokemon`)
Remote name/ID selector with incremental result loading, previous/next navigation, and the selected Pokémon's full detail view.

#### **Search Moves** (`/search-moves`)
Separate fast- and charged-move tables with name/ID and type filters. Results expose the available PVE/PVP values and link to move detail pages.

#### **Search Types** (`/search-types`)
Browse Pokémon and fast/charged moves by type, with Pokémon GO release filtering, result totals, and separate tables for each result category.

### 📖 Detailed Information

#### **Pokémon Details** (`/pokemon/:id`)
Displays identity, forms and availability, base and battle stats, move lists and best-move rankings, type/weather information, counters, evolution data, upgrade costs, and available media assets.
Canonical display names remain separate from their underlying Pokémon GO form identity so stats, ranks, moves, encounter data, and assets stay synchronized without duplicating equivalent forms. PokéAPI-only forms remain selectable but display as not released in GO and do not borrow GO stats, assets, ranks, or availability from the canonical default.

#### **Move Details** (`/move/:id`)
Displays move identity and type, weather boost, PVE/PVP power and energy values, PVP buffs, timing and damage-window metadata, DPS/EPS comparisons, and Pokémon that can learn the move.

### ⚔️ Battle Analysis

#### **Type Effectiveness** (`/type-effective`)
Interactive attacker and defender charts showing Pokémon GO damage multipliers for weaknesses, neutral matchups, and resistances.

#### **Battle Leagues** (`/battle-leagues`)
Searchable league directory with CP limits, rules, cup restrictions, and eligible Pokémon assets supplied by the API.

#### **Damage Calculator** (`/damage-calculate`)
Calculates attack damage for a selected attacker, defender, and move while applying supported battle, weather, type, and Pokémon modifiers.

#### **Search Battle Stats** (`/search-battle-stats`)
Searches a Pokémon's CP/IV combinations and calculated battle values for league-oriented comparison.

### 🏆 PVP (Player vs Player) Tools

#### **PVP Home** (`/pvp`)
Navigation hub for rankings, teams, and the battle simulator across the league and data series currently available from the API.

#### **PVP Rankings** (`/pvp/rankings/:serie/:cp`)
League-specific ranking tables with role score modes, Pokémon search, sorting, recommended moves, and expandable matchup/counter details.

#### **PVP Teams** (`/pvp/teams/:serie/:cp`)
League team-performance data with top performers, team combinations, move sets, game counts, and sortable score columns.

#### **PVP Battle Simulator** (`/pvp/battle`, `/pvp/battle/:cp`, `/pvp/battle/:cp/replay`)
Compares two Pokémon using selected league, IV, move, and shield settings, then presents the API simulation as an animated battle timeline. Replay routes restore a serialized battle for deterministic playback.

#### **PVP Pokémon Analysis** (`/pvp/:cp/:serie/:pokemon`)
League-specific Pokémon analysis with scores, recommended moves, calculated stats, and best matchup/counter lists.

### 📊 Data Sheets & Rankings

#### **DPS/TDO Sheets** (`/dps-tdo-sheets`)
Server-calculated DPS/TDO results for Pokémon and move combinations, with attacker/target settings, combat modifiers, release/form filters, and sortable columns. When the release-only filter is disabled, unreleased forms are identified by an inline badge in the Pokémon Name cell without adding another results column.

#### **Stats Ranking** (`/stats-ranking`)
Global base-stat ranking table for Attack, Defense, Stamina, and stat product, with name/release filters and an expandable Pokémon summary.

#### **Stats Table** (`/stats-table`)
League IV/stat-product table for a selected Pokémon and CP limit, with optional CP and exact-IV inputs for narrowing combinations.

### 🧮 Calculators & Tools

#### **Find CP/IV** (`/find-cp-iv`)
Finds possible level and IV combinations from a Pokémon and CP, or calculates CP values from selected IVs and levels.
All three tables request `page` and `limit` from the Find API and sort across
the complete result on the server. Changing page size or sorting resets to the
first page; a new search uses the submitted inputs, and subsequent pagination
keeps those inputs until another search is submitted. Averages and appraisal
counts come from the API's full-result summary. Existing rows remain visible
under a header progress bar while the next page loads, and obsolete requests
are cancelled.
With local Web and API running, `npm run audit:find-pagination` checks the
three tables in a temporary headless Google Chrome profile. It verifies page
navigation, page size, sort reset, full-result summaries, and submitted inputs.
Google Chrome must be installed at its standard macOS application path;
`WEB_BASE_URL` overrides `http://localhost:9000`.

#### **Calculate Stats** (`/calculate-stats`)
Calculates CP, HP, battle stats, level, and power-up costs for a selected Pokémon and IV spread, including supported buddy, lucky, shadow, and purified states.

#### **Raid Battle Tool** (`/raid-battle`)
Select a raid boss, tier, moves, weather, and time limit to find counters, build trainer teams, run the raid simulation, and estimate the required player count.

#### **Calculate Point** (`/calculate-point`)
Calculates attack breakpoints, defense breakpoints, and bulkpoints across Pokémon levels and IVs for PVE or PVP battles.

#### **Catch Chance Calculator** (`/calculate-catch-chance`)
Calculates catch probability from species, level and encounter settings, ball, berry, throw quality, curveball, and medal bonuses.

### 🌤️ Weather & Environment

#### **Weather Boosts** (`/weather-boosts`)
Maps each Pokémon GO weather condition to its boosted types and finds matching weather for one or two selected Pokémon types.

### 🎨 Collections

#### **Stickers** (`/stickers`)
Browses sticker data and pack information with Pokémon association and shop-availability filters.

### 🧪 Experimental

#### **Trainer Lab** (`/trainer`)
API-backed Team Leader battle simulator with league, opponent, team, IV, level,
move, and timeline controls plus Trainer level rewards. The experimental route
is registered and indexed but remains hidden from the primary navigation.

### 🧭 Navigation & Errors

#### **Error / Not Found** (`*`)
Displays the application error page for unmatched URLs. Runtime errors are handled by a route-aware error boundary that resets after navigation.

### ⚙️ Application Features

- **🌓 Theme System**: Light and dark modes with a persistent preference
- **📱 Responsive Design**: Layouts for desktop, tablet, and mobile viewports
- **⏳ Route Transitions**: Keeps the current page visible and shows global progress until a lazy route and its data are ready
- **🛡️ Error Recovery**: Route-aware error boundaries reset when navigation changes
- **🔄 Versioned Data**: Generated sections are synchronized from one Game Master snapshot
- **📦 On-demand Loading**: Pages load and cache only the processed sections they use
- **💾 Browser Storage**: Public data and preferences are cached locally without client-side encryption
- **🎯 Search Tools**: Search and autocomplete for quick navigation
- **📊 Data Tables**: Sortable, filterable, responsive result tables

## Product & Engineering Priorities

### Product Goals

1. Present current Pokémon GO data in practical search, detail, battle, and calculator views.
2. Keep tools usable across desktop and mobile layouts.
3. Link related Pokémon, moves, leagues, counters, and update records for efficient navigation.
4. Keep calculations and generated data aligned with the API's published Game Master snapshot.

### Operational Priorities

- **Data consistency**: Accept supported processed-data schemas and consume mutually dependent sections from one source snapshot.
- **Focused loading**: Minimize initial payloads by fetching only the sections required by the current route.
- **Resilient navigation**: Cancel stale work, recover from route errors, and preserve the current page during lazy transitions.
- **Supported browsers**: Follow the repository's declared Browserslist targets.

## Getting Started

### Prerequisites
- **Node.js**: v24.x (matches `package.json` and CI)
- **npm**: a version compatible with Node.js 24
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/WHIZENx/PokeGoBreeze.git
cd PokeGoBreeze
```

2. **Install dependencies**
```bash
npm ci
```

3. **Set up configuration**

   PokeGoBreeze loads its runtime config from one of two sources — use whichever fits your setup:

   **Option A — `config.json` (recommended for local dev, no Vercel account needed)**

   Copy the local config and environment examples:
   ```bash
   cp config.example.json config.json
   cp .env.example .env
   ```
   Edit `config.json` with the application options and version keys. This file
   is gitignored and takes precedence over Vercel Edge Config when present, so
   Edge Config credentials are not required. Set `REACT_APP_DATA_API_URL` in
   `.env` to a compatible API and leave `REACT_APP_VERSION` empty when the
   version should come from `config.json`.

   **Option B — Vercel Edge Config**

   Copy `.env.example` to `.env` and supply at minimum the Edge Config credentials:
   ```bash
   cp .env.example .env
   ```

   Configuration variables:

   | Variable | When required | Purpose |
   |---|---|---|
   | `REACT_APP_DEPLOYMENT_MODE` | Optional | `development` (default), `staging`, or `production` |
   | `REACT_APP_DATA_API_URL` | Data-backed pages | Base URL of a compatible PokeGoBreeze API deployment |
   | `REACT_APP_EDGE_TOKEN` | Local `deploy.sh` | Edge Config write token |
   | `REACT_APP_EDGE_READ_TOKEN` | Edge Config mode | Edge Config read token when `config.json` is absent |
   | `REACT_APP_EDGE_ID` | Edge Config mode or deployment | Edge Config ID (for example, `ecfg_xxx`) |
   | `REACT_APP_VERSION` | Optional | Overrides the version selected from config |
   | `MONGODB_URI` | Optional | Records deployment versions when running `deploy.sh` |

   GitHub Actions deployment uses the `REACT_APP_EDGE_ID`,
   `REACT_APP_EDGE_READ_TOKEN`, `REACT_APP_EDGE_TOKEN`, and `VERCEL_TOKEN`
   secrets plus the `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` Actions variables.
   `MONGODB_URI` is optional. Firebase branch deployments use `FIREBASE_TOKEN`,
   while same-repository pull-request previews use
   `FIREBASE_SERVICE_ACCOUNT_POKEGO_BREEZE`. Treat
   [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) as the
   authoritative credential list. Branches map to Vercel as follows:
   `develop` → Preview develop, `stage` → Preview stage, and `main` →
   Production. Firebase Hosting uses the same branch and API environment
   mapping:

   | Branch | Firebase Hosting | Data API |
   |---|---|---|
   | `develop` | `pokego-breeze-develop.web.app` | `pokego-breeze-api-develop.vercel.app` |
   | `stage` | `pokego-breeze-stage.web.app` | `pokego-breeze-api-stage.vercel.app` |
   | `main` | `pokego-breeze.web.app` | `pokego-breeze-api.vercel.app` |

   The deployment workflow validates that the selected API URL is embedded in
   the Firebase build and verifies the hosted SPA route after deployment. SPA
   documents revalidate immediately, while fingerprinted assets use immutable
   caching. The workspace is not part of this deployment.

   > See [`.env.example`](.env.example) for all variables with descriptions and example values.

### Development

**Start the development server**:
```bash
npm run develop
# or
npm start
```

The development server includes:
- ⚡ Hot Module Replacement (HMR) via Vite
- 🔍 ESLint and Stylelint real-time checking
- 🎨 SCSS preprocessing
- 🔧 Source maps for debugging

Data-backed pages also require `REACT_APP_DATA_API_URL`. When developing through the workspace repository, run the web and API services together; when cloning only this repository, point the variable at a compatible API deployment.

**Other development commands**:
```bash
# Lint code (ESLint + Stylelint)
npm run lint

# Check both TypeScript projects without emitting files
npm run typecheck

# Format code (Prettier + Stylelint)
npm run format

# Lint code only
npm run lint:code

# Lint styles only
npm run lint:style

# Format code only
npm run format:code

# Format styles only
npm run format:style
```

### Production Build

**Full production build** (loads config, lints, generates the sitemap, and builds `dist/`):
```bash
REACT_APP_DEPLOYMENT_MODE=production npm run deploy
```

**Build without linting or runtime config loading**:
```bash
npm run build
```

The npm `prebuild` lifecycle cleans `dist/` automatically before `npm run build`.

**Preview production build locally**:
```bash
# After building, you can preview the production build
npx vite preview
```

### Docker Development

**Development with Docker** (hot-reload on `localhost:9000`):
```bash
# Copy the Compose example and configure config.json or Edge Config first
cp docker-compose.example.yml docker-compose.yml
cp config.example.json config.json
cp .env.example .env  # set REACT_APP_DATA_API_URL and local values

# Build and start development container
docker compose up app-dev
```

The committed example is supported for local development. Production releases
use the Firebase and Vercel workflows below; the example Compose production
service does not currently inject the build-time configuration required by
`npm run deploy`.

### Deployment Options

#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Build and deploy only the production hosting target
REACT_APP_DEPLOYMENT_MODE=production npm run deploy
firebase deploy --project pokego-breeze --only hosting:pokego-breeze
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### Cloudflare Pages
```bash
# Build the same static output used by the other hosting providers
REACT_APP_DEPLOYMENT_MODE=production npm run deploy

# Deploy dist/ with the committed _headers cache rules
npx wrangler pages deploy dist --project-name pokego-breeze
```

Vercel remains the canonical SEO origin. Firebase Hosting is deployed by the
committed workflow. Cloudflare Pages is an optional manual deployment target;
the repository currently has no Cloudflare deployment workflow, so its hosted
state may be unavailable or stale. When deployed, `public/_headers` supplies
the static-asset cache policy and Cloudflare's SPA fallback handles routes
because the build has no top-level `404.html`.

### Common Project Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Vite dev server (loads `config.json` if present, otherwise fetches Vercel Edge Config) |
| `npm run develop` | Alias for `npm start` |
| `npm run build` | Generate sitemap files, build the production bundle, and prerender SEO routes |
| `npm run build:vite` | Build the production bundle only, without sitemap generation or SEO prerendering |
| `npm run prebuild` | Clean `dist/` (runs automatically before `npm run build`) |
| `npm run deploy` | Load configuration, then lint, generate sitemap files, build, and prerender for the configured deployment mode |
| `npm run audit:prod` | Audit production dependencies at high severity or above |
| `npm run lint` | Run ESLint and Stylelint |
| `npm run lint:code` | Run ESLint only |
| `npm run lint:style` | Run Stylelint only |
| `npm run typecheck` | Check the app and Node/Vite TypeScript projects without emitting files |
| `npm run format` | Format code with Prettier and Stylelint |
| `npm run format:code` | Run Prettier only |
| `npm run format:style` | Run Stylelint --fix only |
| `npm run generate:sitemap` | Generate the sitemap index and grouped sitemap files from the API SEO-route manifest |
| `npm run prerender:seo` | Prerender static and API-provided SEO routes into `dist/` |
| `npm run update:local-ui-assets` | Refresh generated local Pokémon GO UI and move-type assets |
| `npm run update:pokemon-icon-sheet` | Refresh the generated Pokémon icon sheet and index |
| `npm run test-vite` | Start Vite directly without runtime config loading |
| `npm run debug-vite` | Start Vite directly with `--debug --force` for diagnostics |

Feature-specific `test:*` and `audit:*` commands are declared in
`package.json` and organized under [`scripts/`](scripts/README.md).

### Browser Support

The production CSS/tooling target follows `browserslist` in `package.json`: browsers with more than 0.2% usage, excluding dead browsers and Opera Mini. Vite emits ES2015-compatible JavaScript. Development targets the latest Chrome, Firefox, and Safari.

### Troubleshooting

**Port already in use**:
```bash
# Identify and kill the process using the Vite dev-server port (macOS/Linux)
lsof -ti:<port> | xargs kill -9

# Or change the port in vite.config.ts / via the --port flag
```

**Clear Vite cache**:
```bash
rm -rf node_modules/.vite
npm run develop
```

**Build errors**:
```bash
# Reinstall exactly from the committed lockfile
rm -rf node_modules
npm ci
```

## Contributing

Contributions are welcome and greatly appreciated! Whether you're fixing bugs, adding features, or improving documentation, your help makes PokeGoBreeze better for everyone.

### How to Contribute

1. **Fork the repository**
   - Click the "Fork" button at the top right of the repository page

2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/PokeGoBreeze.git
   cd PokeGoBreeze
   ```

3. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Make your changes**
   - Follow the existing code style and conventions
   - Add tests if applicable
   - Update documentation as needed

5. **Run quality checks**
   ```bash
   npm run lint       # Require zero code/style warnings and errors
   npm run typecheck  # Check both TypeScript projects
   npm run build      # Verify sitemap, Vite build, and SEO prerendering
   ```

   Run the focused `test:*` or `audit:*` command related to the changed feature.
   `npm run format` mutates files and should be used before these checks rather
   than treated as a validation command.

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature" # Use conventional commits
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Describe your changes in detail

### Contribution Guidelines

- **Code Style**: Follow the existing code style. Use ESLint and Prettier configurations provided.
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks
- **Documentation**: Update README and code comments as needed
- **Branch Naming**: Use descriptive names like `feature/pvp-team-builder` or `fix/damage-calculator-bug`

### Areas for Contribution

- 🐛 **Bug Fixes**: Report and fix bugs
- ✨ **New Features**: Suggest and implement new tools or features
- 📊 **Data Presentation**: Improve how API data and Game Master changes are presented in the web client
- 🎨 **UI/UX Improvements**: Enhance the user interface and experience
- 📚 **Documentation**: Improve code documentation and user guides
- ♿ **Accessibility**: Make the app more accessible to all users
- 🌐 **Localization**: Add support for additional languages
- ⚡ **Performance**: Optimize load times and rendering

### Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and device information
- Console errors (if any)

## Project Status

### Implemented Capabilities

- Added paginated Game Master patch notes with readable field changes and linked entity assets.
- Moved processed datasets and calculation-heavy tools to versioned API endpoints.
- Added page-level section loading, request deduplication, cancellation, and schema validation.
- Kept the current route visible during lazy navigation and added route-aware error recovery.
- Centralized Pokémon GO asset resolution and fallbacks across detail and counter views.
- Upgraded routing, dependency versions, and the lint/build toolchain.

## Performance & Optimization

- **Route splitting**: Lazy route imports and manually separated vendor chunks reduce the initial application bundle.
- **Focused data loading**: Each route declares the processed-data sections it requires.
- **Request control**: Shared section requests are deduplicated; page requests use cancellation or stale-response checks where needed.
- **Transition handling**: The previous page remains mounted until the next lazy page and required data are ready.
- **Production output**: Vite minifies JavaScript and CSS and emits fingerprinted assets for long-lived hosting caches.
- **API caching**: Generated datasets and calculation responses use the API's cache behavior rather than browser-side recomputation.

## Security

- **Client Storage**: Public data and preferences are cached without encryption; sensitiveData is excluded from persistence
- **Deployment Secrets**: CI and hosting credentials belong in GitHub/Vercel/Firebase secret stores, never in client configuration
- **Operational Telemetry**: Vercel Analytics and Speed Insights contain no Pokémon GO account credentials
- **HTTPS Only**: All production deployments use HTTPS
- **Dependency Controls**: The committed lockfile, targeted overrides, and `npm audit` are used to control dependency risk

## Acknowledgments

- **Pokémon GO**: © 2016-2026 Niantic, Inc. © 2016-2026 Pokémon. © 1995-2026 Nintendo/Creatures Inc./GAME FREAK inc.
- **Data Sources**: Thanks to PokeMiners and the wider Pokémon GO community for Game Master and asset contributions
- **Open Source Libraries**: Built with amazing open-source tools and libraries
- **Contributors**: Special thanks to all contributors who have helped improve this project

## FAQ

### Is this app affiliated with Niantic or Pokémon GO?
No, PokeGoBreeze is an independent, community-driven project and is not affiliated with Niantic or The Pokémon Company.

### How often is the data updated?
The API checks for new Game Master snapshots on a schedule. The web client receives the refreshed version after the API finishes generating and publishing a complete, consistent section set.

### Can I use this app offline?
Some previously loaded browser assets may remain cached, but data-backed pages and calculators require access to the PokeGoBreeze API.

### Is my data secure?
Browser storage is not encrypted; do not place account credentials or other secrets in client-side configuration. Vercel-hosted production deployments also use Vercel Analytics and Speed Insights.

### Can I suggest new features?
Absolutely! Please open an issue on GitHub with your feature request.

### How can I report a bug?
Open an issue on GitHub with details about the bug, including steps to reproduce it.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
This project uses several open-source libraries. See `package.json` for a complete list.

## Links & Resources

- 🌐 **Production (Firebase)**: [pokego-breeze.web.app](https://pokego-breeze.web.app/)
- 🌐 **Production (Vercel)**: [poke-go-breeze.vercel.app](https://poke-go-breeze.vercel.app/)
- 💻 **GitHub Repository**: [WHIZENx/PokeGoBreeze](https://github.com/WHIZENx/PokeGoBreeze)
- 📝 **Issues & Bug Reports**: [GitHub Issues](https://github.com/WHIZENx/PokeGoBreeze/issues)
- 📢 **Feature Requests**: [GitHub Discussions](https://github.com/WHIZENx/PokeGoBreeze/discussions)

## Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing code or documentation
- 📢 Sharing with other Pokémon GO trainers

---

**Made with ❤️ by the Pokémon GO community**

*Pokémon and Pokémon GO are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc.*
