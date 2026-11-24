import React, { type ComponentType, type ReactElement } from 'react';
import type { Location } from 'react-router-dom';
import type { RouteDetails } from './services/detail-route.service';
import type { IStyleData } from './utils/models/util.model';

interface PageContext {
  location: Location;
  styleSheet: IStyleData[];
  details: RouteDetails;
}

export type RenderPage = (context: PageContext) => ReactElement;

type PageModule<Props extends object> = () => Promise<{ default: ComponentType<Props> }>;

function page<Props extends object>(
  path: string,
  importPage: PageModule<Props>,
  render: (Component: ComponentType<Props>, context: PageContext) => ReactElement
) {
  let pending: Promise<RenderPage> | undefined;
  return {
    path,
    load: () =>
      (pending ??= importPage().then(
        ({ default: Component }) =>
          (context) =>
            render(Component, context),
        (error: unknown) => {
          pending = undefined;
          throw error;
        }
      )),
  };
}

const staticPage = (path: string, loader: PageModule<object>) => page(path, loader, (Page) => <Page />);

const gameMaster = () => import('./pages/GameMasterUpdates/GameMasterUpdates');
const battle = () => import('./pages/PVP/Battle/Battle');

export const appRoutes = [
  page(
    '/',
    () => import('./pages/Pokedex/Pokedex'),
    (Page, { styleSheet }) => <Page styleSheet={styleSheet} />
  ),
  staticPage('/news', () => import('./pages/News/News')),
  staticPage('/game-master-updates', gameMaster),
  staticPage('/game-master-updates/:patchSlug', gameMaster),
  staticPage('/type-effective', () => import('./pages/TypeEffect/TypeEffect')),
  staticPage('/weather-boosts', () => import('./pages/Weather/Weather')),
  staticPage('/search-pokemon', () => import('./pages/Search/Pokemon/Search')),
  page(
    '/pokemon/:id',
    () => import('./pages/Pokemon/Pokemon'),
    (Pokemon, { location, details }) => <Pokemon routeKey={location.pathname} preparedDetail={details.pokemon} />
  ),
  staticPage('/search-moves', () => import('./pages/Search/Moves/SearchMoves')),
  page(
    '/move/:id',
    () => import('./pages/Move/Move'),
    (Move, { location, details }) => <Move key={location.pathname} preparedDetail={details.move} />
  ),
  page(
    '/search-types',
    () => import('./pages/Search/Types/Types'),
    (Page, { styleSheet }) => <Page styleSheet={styleSheet} />
  ),
  staticPage('/find-cp-iv', () => import('./pages/Tools/FindTable/FindTable')),
  staticPage('/calculate-stats', () => import('./pages/Tools/CalculateStats/CalculateStats')),
  staticPage('/search-battle-stats', () => import('./pages/Tools/SearchBattle/SearchBattle')),
  staticPage('/stats-table', () => import('./pages/Tools/StatsInfo/StatsInfo')),
  staticPage('/damage-calculate', () => import('./pages/Tools/BattleDamage/Damage')),
  staticPage('/raid-battle', () => import('./pages/Tools/RaidBattle/RaidBattle')),
  staticPage('/calculate-point', () => import('./pages/Tools/CalculatePoint/CalculatePoint')),
  staticPage('/calculate-catch-chance', () => import('./pages/Tools/CatchChance/CatchChance')),
  staticPage('/dps-tdo-sheets', () => import('./pages/Sheets/DpsTdo/DpsTdo')),
  staticPage('/stats-ranking', () => import('./pages/Sheets/StatsRanking/StatsRanking')),
  staticPage('/pvp', () => import('./pages/PVP/Home')),
  page(
    '/pvp/rankings/:serie/:cp',
    () => import('./pages/PVP/Ranking/PVP'),
    (Page, { styleSheet }) => <Page styleSheet={styleSheet} />
  ),
  page(
    '/pvp/teams/:serie/:cp',
    () => import('./pages/PVP/Teams/PVP'),
    (Page, { styleSheet }) => <Page styleSheet={styleSheet} />
  ),
  page('/pvp/battle', battle, (Battle, { location }) => <Battle key={location.pathname} />),
  page('/pvp/battle/:cp', battle, (Battle, { location }) => <Battle key={location.pathname} />),
  page('/pvp/battle/:cp/replay', battle, (Battle, { location }) => <Battle key={location.pathname} replayMode />),
  page(
    '/r/:id',
    () => import('./pages/PVP/Battle/ShortReplay'),
    (Replay, { location }) => <Replay key={location.pathname} />
  ),
  page(
    '/pvp/:cp/:serie/:pokemon',
    () => import('./pages/PVP/Pokemon/Pokemon'),
    (Page, { location, styleSheet, details }) => (
      <Page key={location.pathname} styleSheet={styleSheet} preparedDetail={details.pvp} />
    )
  ),
  staticPage('/battle-leagues', () => import('./pages/PVP/Leagues/Leagues')),
  staticPage('/trainer', () => import('./pages/Trainer/TrainerLab')),
  staticPage('/stickers', () => import('./pages/Sticker/Sticker')),
  staticPage('*', () => import('./pages/Error/Error')),
];
