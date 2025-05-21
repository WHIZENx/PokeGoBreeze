# PokeGoBreeze - Pokémon GO Tools & Information

## Overview
PokeGoBreeze is a comprehensive web application that provides a suite of tools and information for Pokémon GO players. The application helps trainers optimize their gameplay by offering detailed Pokémon statistics, battle calculators, move analysis, and more - all within a user-friendly interface that syncs with the latest Pokémon GO game data.

## Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux with Redux Thunk and Redux Persist
- **Routing**: React Router v6
- **UI Components**: 
  - Material UI (MUI) v5
  - React Bootstrap
  - Styled Components
- **Data Visualization**: 
  - React Data Table Component
  - React XArrows
- **Styling**: SCSS/Sass with custom theming system
- **Storage**: LocalForage (IndexedDB with fallback to localStorage)
- **Security**: Crypto-js for data encryption
- **Performance Optimization**:
  - Code splitting with React Imported Component
  - Redux DevTools optimization for large state
  - Debounced loading patterns

### Build & Development Tools
- **Build System**: Webpack with custom configuration
- **Development Server**: Webpack Dev Server
- **Code Quality**:
  - ESLint
  - Prettier
  - Stylelint
- **Testing**: Jest and React Testing Library
- **CI/CD**:
  - GitHub Actions
  - Travis CI for Firebase deployment
  - Vercel integration

### Deployment
- **Primary Hosting**: Firebase
- **Secondary Hosting**: Vercel
- **Containerization**: Docker support for development and production

## Project Structure

```
/src
├── assets           # Static assets, images, and icons
├── components       # Reusable UI components
├── core             # Core functionality and utilities
├── data             # Static data files and game data
├── enums            # TypeScript enumerations
├── pages            # Application pages and routes
│   ├── Move         # Move details and information
│   ├── News         # Game news and updates
│   ├── PVP          # PVP battle simulator and rankings
│   ├── Pokedex      # Pokémon listing and information
│   ├── Pokemon      # Individual Pokémon details
│   ├── Search       # Search functionality for Pokémon/moves/types
│   ├── Sheets       # Data sheets (DPS/TDO, rankings)
│   ├── Sticker      # Sticker collection
│   ├── Tools        # Various calculators and tools
│   ├── TypeEffect   # Type effectiveness charts
│   └── Weather      # Weather boost information
├── services         # API services and data fetching
├── store            # Redux store configuration
│   ├── actions      # Redux actions
│   ├── effects      # Side effects and async logic
│   ├── reducers     # State reducers
│   └── selectors    # State selectors
├── styles           # Global styles and theme definitions
└── util             # Utility functions and helpers
```

## Features

### Pokémon Database
- **Pokédex**: Complete database of all 905+ Pokémon with detailed stats
- **Search**: Advanced filtering by name, type, stats, and more
- **Pokémon Details**: Comprehensive information including:
  - Base stats and CP ranges
  - Type effectiveness
  - Evolution chains
  - Shiny forms
  - Recommended movesets
  - Weather boosts

### Move Analysis
- **Move Database**: All available moves in Pokémon GO
- **Stats**: Damage, energy cost, cooldown time
- **DPS Calculation**: Damage Per Second analysis
- **Move Comparisons**: Compare effectiveness across different Pokémon

### Battle Tools
- **Damage Calculator**: Simulate battle damage between Pokémon
- **DPS & TDO Sheets**: Damage Per Second and Total Damage Output rankings
- **Raid Battle Simulator**: Optimize raid battle teams
- **PVP Analysis**:
  - League rankings (Great, Ultra, Master)
  - Team builder
  - Battle simulator
  - Stats ranking per league

### Utility Tools
- **CP & IV Calculator**: Find possible IV combinations from CP
- **Stats Calculator**: Calculate overall stats for any Pokémon
- **Catch Chance Calculator**: Probability of catching Pokémon
- **Weather Boost Finder**: Find Pokémon boosted by current weather

### Special Features
- **Dark/Light Theme**: Customizable UI theme
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Offline Support**: Core functionality available offline
- **Data Synchronization**: Regular updates to match game data
- **Performance Optimization**: Fast loading and interaction

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

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run develop
```

### Production Build
```bash
# Build for production
npm run deploy

# Run with Docker
docker-compose up
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Links
- [Live Site (Firebase)](https://pokego-breeze.web.app/)
- [Alternative Site (Vercel)](https://poke-go-breeze.vercel.app/)
