# PokeGoBreeze - Pokémon GO Tools & Information

<div align="center">

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Version](https://img.shields.io/badge/version-6.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.4.2-646CFF?logo=vite)

[Production](https://poke-go-breeze.vercel.app/) • [Staging](https://poke-go-breeze-stage.vercel.app/)

</div>

## Overview

PokeGoBreeze is a comprehensive, feature-rich web application designed for Pokémon GO trainers of all levels. It provides an extensive suite of tools and resources to help players optimize their gameplay, build competitive teams, analyze battles, and make informed decisions. The application features real-time data synchronization with the latest Pokémon GO game mechanics, an intuitive user interface with dark/light theme support, and powerful calculators for various gameplay scenarios.

**Key Highlights:**
- 🎮 Complete Pokédex with 900+ Pokémon and detailed statistics
- ⚔️ Advanced PVP battle simulator with league rankings
- 📊 Comprehensive damage, DPS/TDO, and stats calculators
- 🌟 Real-time game data updates
- 🎨 Beautiful, responsive UI with theme customization
- ⚡ Fast performance with optimized loading and caching
- 📱 Mobile-friendly responsive design

## Architecture & Tech Stack

### Frontend Framework
- **Core**: React 18.2.0 with TypeScript 5.5.3
- **Build Tool**: Vite 6.4.2 (migrated from Webpack for faster builds)
- **State Management**: 
  - Redux 4.2.0 with React-Redux 7.2.6
  - Redux Thunk 2.4.1 for async operations
  - Redux Persist 6.0.0 with encrypted storage
- **Routing**: React Router DOM v6.20.0
- **HTTP Client**: Axios 1.12.0

### UI & Styling
- **Component Libraries**:
  - Material UI (MUI) v5.6 - Primary UI framework
  - MUI Icons Material 5.6.2
  - Styled Components 6.1.8
  - Emotion (React & Styled) 11.11
- **Styling System**:
  - SCSS/Sass 1.83.0 with modern @use syntax
  - Tailwind CSS 3.4.17 for utility classes
  - Custom theming system with dark/light modes
  - PostCSS with Autoprefixer 10.4
- **Data Visualization**:
  - React Data Table Component 7.4.7 for data grids
  - React XArrows 2.0.2 for visual connections
- **Utilities**:
  - Lodash 4.17.21 for data manipulation
  - Moment 2.30.1 for date/time handling
  - DOMPurify 3.2.6 for safe HTML rendering
  - Immutability Helper 3.1.1 for state updates
  - usehooks-ts 2.7.2 for reusable React hooks
  - React Device Detect 2.2.3 for device-aware UI

### Storage & Security
- **Client Storage**: LocalForage 1.10.0 with IndexedDB (localStorage fallback)
- **Encryption**: Crypto-js 4.2.0 AES encryption for persisted state
- **Data Persistence**: Redux Persist with encrypted serialization

### Development Tools
- **Build System**: Vite 6 with custom configuration
  - Code splitting and lazy loading
  - Chunk optimization for vendor libraries
  - Node.js polyfills (crypto, stream, buffer, util, process, vm)
- **Code Quality**:
  - ESLint 8.57.0 with TypeScript support (@typescript-eslint 5.45)
  - Prettier 3.2.5 for code formatting
  - Stylelint 15.11.0 for SCSS/CSS linting
  - Vite ESLint & Stylelint plugins for real-time feedback
- **TypeScript**:
  - Strict type checking (TypeScript 5.5.3)
  - Custom type definitions
  - Separate app/node tsconfig files

### Performance Optimization
- **Loading Strategies**:
  - Debounced loading patterns
  - Lazy component imports
  - Redux DevTools optimization for large states
  - Action sanitization and denylist
- **Build Optimization**:
  - Vendor code splitting (react, redux, mui, etc.)
  - Tree shaking and dead code elimination
  - CSS minification and optimization
  - Asset optimization and compression

### Deployment & DevOps
- **Hosting**:
  - Primary: Firebase Hosting
  - Secondary: Vercel
- **Containerization**: Docker support with docker-compose
- **CI/CD**:
  - GitHub Actions for automated workflows
  - Vercel integration for preview deployments
- **Analytics**:
  - Vercel Analytics
  - Vercel Speed Insights
  - Web Vitals tracking

## Project Structure

```
/src
├── assets           # Static assets, images, global styles and theme definitions, and icons
├── components       # Reusable UI components
│   ├── Card         # Card-based display components
│   ├── Commons      # Shared layout & navigation components (e.g. navbars)
│   ├── Effective    # Type effectiveness components
│   ├── ErrorBoundary # Global error boundary
│   ├── Find         # Find/search helper components
│   ├── Info         # Info display components
│   ├── Link         # Link-related components
│   ├── Raid         # Raid-related components
│   ├── Spinner      # Loading spinner
│   └── Sprites      # Pokémon sprite components
├── composables      # Reusable composition hooks (useTimestamp, useTheme, useDevice, useRouter, ...)
├── contexts         # React contexts (options, snackbar, ...)
├── core             # Core functionality and utilities
├── data             # Static data files and game data
├── enums            # TypeScript enumerations
├── pages            # Application pages and routes
│   ├── Error        # 404 / error page
│   ├── Move         # Move details and information
│   ├── News         # Game news and updates
│   ├── PVP          # PVP battle simulator, rankings, teams, leagues
│   ├── Pokedex      # Pokémon listing and information
│   ├── Pokemon      # Individual Pokémon details
│   ├── Search       # Search functionality for Pokémon/moves/types
│   ├── Sheets       # Data sheets (DPS/TDO, stats rankings)
│   ├── Sticker      # Sticker collection
│   ├── Tools        # Calculators: BattleDamage, CalculatePoint, CalculateStats,
│   │                #              CatchChance, FindTable, RaidBattle,
│   │                #              SearchBattle, StatsInfo
│   ├── Trainer      # Trainer-related views
│   ├── TypeEffect   # Type effectiveness charts
│   ├── Weather      # Weather boost information
│   └── models       # Page-level models / types
├── services         # API services and data fetching
├── store            # Redux store configuration
│   ├── actions      # Redux actions
│   ├── constants    # Action types and store constants
│   ├── middleware   # Custom Redux middleware
│   ├── models       # Store models / types
│   ├── reducers     # State reducers
│   └── configure.ts # Store setup with persistence
├── types            # Global TypeScript type definitions
└── utils            # Utility functions, hooks, helpers, and configs
```

## Features

### 🏠 Home & Information
#### **Pokédex** (`/`)
Main hub displaying the complete Pokémon database with filtering, sorting, and search capabilities. Browse through 900+ Pokémon with detailed stats, types, and quick access to individual Pokémon pages.

#### **Game News** (`/news`)
Latest Pokémon GO news, updates, events, and announcements. Stay informed about new features, special events, and game changes.

### 🔍 Search & Discovery
#### **Search Pokémon** (`/search-pokemon`)
Advanced Pokémon search with multiple filters including:
- Name, number, type, and generation
- Stats ranges (HP, Attack, Defense)
- Evolution stages and families
- Regional availability and forms

#### **Search Moves** (`/search-moves`)
Comprehensive move database search with filters for:
- Move type and category (Fast/Charged)
- Power, energy, and duration
- DPS and EPS calculations
- PVP and PVE effectiveness

#### **Search Types** (`/search-types`)
Type effectiveness lookup and analysis. Explore type matchups, strengths, and weaknesses for strategic team building.

### 📖 Detailed Information
#### **Pokémon Details** (`/pokemon/:id`)
In-depth information for individual Pokémon including:
- Base stats, CP, and HP calculations
- Type effectiveness chart
- Evolution chain and requirements
- Best movesets for PVE and PVP
- Shiny availability and forms
- Weather boosts and counters

#### **Move Details** (`/move/:id`)
Detailed move information with:
- Power, energy, and duration statistics
- Type and category
- DPS/EPS calculations
- List of Pokémon that can learn the move
- PVP and PVE viability ratings

### ⚔️ Battle Analysis
#### **Type Effectiveness** (`/type-effective`)
Interactive type matchup chart showing:
- Super effective and not very effective combinations
- Immune and resistant types
- Quick reference for battle strategy

#### **Battle Leagues** (`/battle-leagues`)
Overview of all PVP battle leagues with CP limits, rules, and meta information.

#### **Damage Calculator** (`/damage-calculate`)
Simulate battle damage between any two Pokémon:
- Select attacker and defender
- Choose moves and weather conditions
- Calculate exact damage per attack
- Account for STAB, type effectiveness, and stats

#### **Search Battle Stats** (`/search-battle-stats`)
Look up and compare battle statistics across multiple Pokémon for competitive analysis.

### 🏆 PVP (Player vs Player) Tools
#### **PVP Home** (`/pvp`)
Central hub for all PVP-related tools and resources.

#### **PVP Rankings** (`/pvp/rankings/:serie/:cp`)
League-specific rankings for:
- Great League (1500 CP)
- Ultra League (2500 CP)
- Master League (Unlimited)
Sorted by performance metrics, TDO, and viability.

#### **PVP Teams** (`/pvp/teams/:serie/:cp`)
Pre-built team compositions and meta teams for each league. Analyze team synergy, coverage, and counters.

#### **PVP Battle Simulator** (`/pvp/battle`)
Real-time battle simulator allowing you to:
- Select two Pokémon with custom IVs
- Choose movesets and shields
- Simulate turn-by-turn battles
- Analyze win conditions and optimal strategies

#### **PVP Pokémon Analysis** (`/pvp/:cp/:serie/:pokemon`)
Detailed PVP performance analysis for specific Pokémon including:
- League rankings and ratings
- Best IV spreads for each league
- Key matchups and counters
- Optimal move combinations
- Breakpoint and bulkpoint calculations

### 📊 Data Sheets & Rankings
#### **DPS/TDO Sheets** (`/dps-tdo-sheets`)
Comprehensive damage rankings showing:
- Damage Per Second (DPS) for all Pokémon
- Total Damage Output (TDO) calculations
- Best attackers by type
- Raid and gym battle recommendations

#### **Stats Ranking** (`/stats-ranking`)
Global Pokémon rankings by base stats:
- Highest Attack, Defense, HP
- Overall stat product
- CP potential at different levels
- Great/Ultra League stat product rankings

#### **Stats Table** (`/stats-table`)
Detailed statistics table with sortable columns for comparing Pokémon performance metrics.

### 🧮 Calculators & Tools
#### **Find CP/IV** (`/find-cp-iv`)
Reverse IV calculator to find possible IV combinations from:
- CP and HP values
- Pokémon level
- Appraisal information
Useful for checking newly caught or traded Pokémon.

#### **Calculate Stats** (`/calculate-stats`)
Calculate exact stats for any Pokémon at any level:
- Input IVs (Attack, Defense, HP)
- Select Pokémon level
- Get resulting CP, HP, and stats
- Compare different IV combinations

#### **Raid Battle Tool** (`/raid-battle`)
Raid battle optimizer helping you:
- Select raid boss and tier
- Build optimal counter teams
- Calculate time to win
- Determine minimum number of trainers needed

#### **Calculate Point** (`/calculate-point`)
Calculate various in-game points and rewards for activities like raids, catches, and tasks.

#### **Catch Chance Calculator** (`/calculate-catch-chance`)
Calculate probability of catching Pokémon based on:
- Pokémon species and level
- Ball type (Poké Ball, Great Ball, Ultra Ball)
- Berries used (Razz, Golden Razz, Silver Pinap)
- Throw quality (Nice, Great, Excellent)
- Medal bonuses

### 🌤️ Weather & Environment
#### **Weather Boosts** (`/weather-boosts`)
Complete guide to weather effects showing:
- Pokémon types boosted by each weather
- Increased CP ranges for weather-boosted spawns
- Best Pokémon to catch in each weather
- Weather-specific raid recommendations

### 🎨 Collections
#### **Stickers** (`/stickers`)
Browse and track the complete collection of in-game stickers, including special event stickers and their availability.

### ⚙️ Application Features
- **🌓 Theme System**: Toggle between light and dark modes with persistent preference
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Performance**: Fast page loads with optimized caching and code splitting
- **🔄 Auto-sync**: Regular updates to match the latest game data
- **💾 Offline Support**: Core features work offline with cached data
- **🔐 Secure Storage**: Encrypted local data storage for user preferences
- **🎯 Smart Search**: Fuzzy search and autocomplete for quick navigation
- **📊 Data Tables**: Sortable, filterable tables with export capabilities

## Goals & Success Metrics

### Primary Goals
1. Provide the most accurate and up-to-date Pokémon GO information
2. Offer comprehensive tools that enhance player experience and strategy
3. Maintain an intuitive, responsive UI accessible to all player levels
4. Ensure compatibility with the latest Pokémon GO game mechanics and updates

### Success Metrics
- **Data Accuracy**: Sync with official game data within 24 hours of updates
- **Tool Completeness**: Cover all major gameplay aspects (catching, battling, raids, PVP)
- **Performance**: <2s initial load time, <500ms for subsequent interactions
- **Accessibility**: Support all modern browsers and devices

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/WHIZENx/PokeGoBreeze.git
cd PokeGoBreeze
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `config.sh` file in the root directory (or set environment variables):
```bash
# config.sh
export REACT_APP_POKEGO_BREEZE_DB_URL="your_database_url"
export REACT_APP_TOKEN_PRIVATE_REPO="your_token"
export REACT_APP_ENCRYPTION_KEY="your_encryption_key"
export REACT_APP_ENCRYPTION_SALT="your_encryption_salt"
# ... other environment variables
```

**Note**: See `.env.example` for all required environment variables.

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

**Other development commands**:
```bash
# Lint code (ESLint + Stylelint)
npm run lint

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

**Build for production**:
```bash
npm run deploy
```

This command will:
1. Run linting checks
2. Build optimized production bundle with Vite
3. Generate sitemap for SEO
4. Output to `dist/` directory

**Manual build** (without linting):
```bash
npm run prebuild  # Clean dist folder
npm run build     # Build and generate sitemap
```

**Preview production build locally**:
```bash
# After building, you can preview the production build
npx vite preview
```

### Docker Deployment

**Development with Docker**:
```bash
# Build and start development container
docker-compose up
```

**Production with Docker**:
```bash
# Build production image
docker build -f Dockerfile -t pokego-breeze:latest .

# Run production container
docker run -p 80:80 pokego-breeze:latest
```

### Deployment Options

#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to Firebase
firebase deploy
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### Project Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Vite dev server (sources `config.sh` first) |
| `npm run develop` | Alias for `npm start` |
| `npm run build` | Build production bundle and generate sitemap |
| `npm run build:vite` | Build production bundle only (no sitemap) |
| `npm run prebuild` | Clean `dist/` folder before building |
| `npm run deploy` | Lint, build, and generate sitemap for deployment |
| `npm run lint` | Run ESLint and Stylelint |
| `npm run lint:code` | Run ESLint only |
| `npm run lint:style` | Run Stylelint only |
| `npm run format` | Format code with Prettier and Stylelint |
| `npm run format:code` | Run Prettier only |
| `npm run format:style` | Run Stylelint --fix only |
| `npm run generate:sitemap` | Generate sitemap.xml for SEO |
| `npm run debug-vite` | Start Vite with `--debug --force` for diagnostics |

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

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
# Clean install
rm -rf node_modules package-lock.json
npm install
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
   npm run lint    # Check for linting errors
   npm run format  # Format code
   ```

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
- 📊 **Data Updates**: Help keep Pokémon data current with game updates
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

## Project Roadmap

### Planned Features
- 🌐 **Multi-language Support**: Internationalization (i18n) for multiple languages
- 📊 **Advanced Analytics**: Detailed statistics and performance tracking
- 🤖 **Team Builder AI**: AI-powered team composition suggestions
- 📱 **Progressive Web App**: Full offline support with service workers
- 🔔 **Notifications**: Event reminders and update notifications
- 💾 **Cloud Sync**: Cross-device data synchronization
- 🎮 **Interactive Tutorials**: Guided tours for new users
- 🏆 **Community Features**: Share teams and strategies with other players

### Recent Updates
- 🚀 Upgraded Vite from v5 to v6 for faster builds and updated `.gitignore`
- 🖼️ Fixed Pokémon sprite ID padding to 4 digits
- 🛡️ Added Pokémon encounter fallback and guarded string replace errors
- 🎨 Adjusted HP bar gap styling
- ⚔️ Updated UI styling and fixed raid battle state management
- 🎨 Migrated to modern SCSS `@use` syntax
- 🔐 Enhanced security with encrypted storage
- 🎯 Continued TypeScript type-safety improvements across composables and stores

## Performance & Optimization

PokeGoBreeze is built with performance in mind:

- **Fast Initial Load**: < 2s on average network connection
- **Code Splitting**: Vendor and route-based splitting for smaller bundles
- **Lazy Loading**: Components load on-demand
- **Optimized Assets**: Compressed images and minified code
- **Efficient Caching**: Smart caching strategies for static assets
- **Redux Optimization**: Memoized selectors and normalized state
- **Tree Shaking**: Unused code is eliminated from production builds

## Security

- **Encrypted Storage**: User data is encrypted using AES encryption
- **Environment Variables**: Sensitive data stored securely
- **No Sensitive Data Collection**: App doesn't collect personal information
- **HTTPS Only**: All production deployments use HTTPS
- **Regular Updates**: Dependencies are regularly updated for security patches

## Acknowledgments

- **Pokémon GO**: © 2016-2026 Niantic, Inc. © 2016-2026 Pokémon. © 1995-2026 Nintendo/Creatures Inc./GAME FREAK inc.
- **Data Sources**: Thanks to the Pokémon GO community for data contributions
- **Open Source Libraries**: Built with amazing open-source tools and libraries
- **Contributors**: Special thanks to all contributors who have helped improve this project

## FAQ

### Is this app affiliated with Niantic or Pokémon GO?
No, PokeGoBreeze is an independent, community-driven project and is not affiliated with Niantic or The Pokémon Company.

### How often is the data updated?
We aim to update Pokémon data within 24-48 hours of official game updates.

### Can I use this app offline?
Yes, core features work offline with cached data. However, the latest updates require an internet connection.

### Is my data secure?
Yes, all local data is encrypted using AES encryption. We don't collect or store personal information on external servers.

### Can I suggest new features?
Absolutely! Please open an issue on GitHub with your feature request.

### How can I report a bug?
Open an issue on GitHub with details about the bug, including steps to reproduce it.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
This project uses several open-source libraries. See `package.json` for a complete list.

## Links & Resources

- 🌐 **Live Site (Firebase)**: [pokego-breeze.web.app](https://pokego-breeze.web.app/)
- 🌐 **Alternative Site (Vercel)**: [poke-go-breeze.vercel.app](https://poke-go-breeze.vercel.app/)
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
