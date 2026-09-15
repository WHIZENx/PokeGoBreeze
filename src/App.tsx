import React, {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Route, Routes, useLocation, type Location } from 'react-router-dom';

import './App.scss';

const News = lazy(() => import('./pages/News/News'));
const GameMasterUpdates = lazy(() => import('./pages/GameMasterUpdates/GameMasterUpdates'));
const Pokedex = lazy(() => import('./pages/Pokedex/Pokedex'));
const SearchPokemon = lazy(() => import('./pages/Search/Pokemon/Search'));
const SearchMove = lazy(() => import('./pages/Search/Moves/SearchMoves'));
const TypeEffect = lazy(() => import('./pages/TypeEffect/TypeEffect'));
const Weather = lazy(() => import('./pages/Weather/Weather'));
const Pokemon = lazy(() => import('./pages/Pokemon/Pokemon'));
const FindTable = lazy(() => import('./pages/Tools/FindTable/FindTable'));
const CalculateStats = lazy(() => import('./pages/Tools/CalculateStats/CalculateStats'));
const Damage = lazy(() => import('./pages/Tools/BattleDamage/Damage'));
const DpsTdo = lazy(() => import('./pages/Sheets/DpsTdo/DpsTdo'));
const Move = lazy(() => import('./pages/Move/Move'));
const Error = lazy(() => import('./pages/Error/Error'));
const Leagues = lazy(() => import('./pages/PVP/Leagues/Leagues'));
const SearchBattle = lazy(() => import('./pages/Tools/SearchBattle/SearchBattle'));
const StatsInfo = lazy(() => import('./pages/Tools/StatsInfo/StatsInfo'));
const Sticker = lazy(() => import('./pages/Sticker/Sticker'));
const RaidBattle = lazy(() => import('./pages/Tools/RaidBattle/RaidBattle'));
const CalculatePoint = lazy(() => import('./pages/Tools/CalculatePoint/CalculatePoint'));
const RankingPVP = lazy(() => import('./pages/PVP/Ranking/PVP'));
const PokemonPVP = lazy(() => import('./pages/PVP/Pokemon/Pokemon'));
const PVPHome = lazy(() => import('./pages/PVP/Home'));
const TeamPVP = lazy(() => import('./pages/PVP/Teams/PVP'));
const Battle = lazy(() => import('./pages/PVP/Battle/Battle'));
const CatchChance = lazy(() => import('./pages/Tools/CatchChance/CatchChance'));
const SearchTypes = lazy(() => import('./pages/Search/Types/Types'));
const StatsRanking = lazy(() => import('./pages/Sheets/StatsRanking/StatsRanking'));
const TrainerLab = lazy(() => import('./pages/Trainer/TrainerLab'));
import Spinner from './components/Spinner/Spinner';
import { useLocalStorage } from 'usehooks-ts';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { getDesignThemes } from './utils/models/overrides/themes.model';
import { TypeTheme } from './enums/type.enum';
import { LocalStorageConfig } from './store/constants/local-storage';
import { Action } from 'history';
import { debounce } from 'lodash';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { clearLocalStorageExcept } from './utils/configs/local-storage.config';
import { getStyleList } from './utils/utils';
import { defaultOptions, OptionsContext } from './contexts/options.context';
import useOptionsObserver from './utils/hooks/useOptionsObserver';
import { loadDataDelay, transitionTime } from './utils/helpers/options-context.helpers';
import useTimestamp from './composables/useTimestamp';
import useSpinner from './composables/useSpinner';
import useDevice from './composables/useDevice';
import { useTheme as useThemeStore } from './composables/useTheme';
import useRouter from './composables/useRouter';
import ResponsiveAppBar from './components/Commons/Navbars/ResponsiveAppBar';
import { SnackbarProvider } from './contexts/snackbar.context';
import { createProgressHelpers } from './utils/helpers/progress-helpers';
import { useDispatch } from 'react-redux';
import useDataStore from './composables/useDataStore';
import { getProcessedDataSectionsForRoute } from './utils/configs/processed-data-routes.config';
import type { ProcessedDataSection } from './services/processed-data.service';

const ColorModeContext = createContext({
  toggleColorMode: () => true,
});

function RouteReady({ location }: { location: Location }) {
  const dispatch = useDispatch();
  useEffect(() => {
    createProgressHelpers(dispatch).completeProgress();
  }, [dispatch, location]);
  return null;
}

function App() {
  const { loadTimestamp, timestampGameMaster } = useTimestamp();
  const { startProgress } = useSpinner();
  const { setDevice } = useDevice();
  const { loadTheme } = useThemeStore();
  const { routerData, routerAction } = useRouter();
  const location = useLocation();
  const { pathname } = location;
  const { loadProcessedSections } = useDataStore();

  const colorMode = useContext(ColorModeContext);

  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const [, setStateTimestamp] = useLocalStorage(LocalStorageConfig.Timestamp, 0);
  const [, setStateVersion] = useLocalStorage(LocalStorageConfig.Version, '');
  const [isBootstrapLoaded, setIsBootstrapLoaded] = useState(false);
  const [loadedRouteDataKey, setLoadedRouteDataKey] = useState<string | null>(null);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [, startTransition] = useTransition();
  const routeDataRequestRef = useRef(0);
  const dispatch = useDispatch();
  const { errorProgress } = createProgressHelpers(dispatch);

  const [currentVersion, setCurrentVersion] = useState<string>();
  const styleSheet = useRef(getStyleList());
  const routeDataKey = useMemo(() => getProcessedDataSectionsForRoute(pathname).join('|'), [pathname]);

  useOptionsObserver();

  useEffect(() => {
    setTimeout(() => {
      clearLocalStorageExcept();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    }, 400);
  }, []);

  useEffect(() => {
    if (routerData && routerAction === Action.Pop) {
      const debounced = debounce(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
      }, 1);
      debounced();
      return () => {
        debounced.cancel();
      };
    }
  }, [routerData]);

  useEffect(() => {
    if (timestampGameMaster) {
      setStateTimestamp(timestampGameMaster);
    }
  }, [timestampGameMaster]);

  // Run once on mount. [isLoaded] would abort the signal on every re-render caused by setIsLoaded(true).
  useEffect(() => {
    const controller = new AbortController();
    const currentVersion = process.env.REACT_APP_VERSION;
    setCurrentVersion(currentVersion);
    startProgress();
    setStateVersion(currentVersion || '');
    loadData(controller.signal)
      .then(() => setIsBootstrapLoaded(true))
      .catch((e: unknown) => {
        if ((e as DOMException)?.name !== 'AbortError') {
          errorProgress({ message: `Load data error: ${e}`, isError: true });
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isBootstrapLoaded) {
      startProgress();
    }
  }, [isBootstrapLoaded, location]);

  useEffect(() => {
    if (!isBootstrapLoaded) {
      return;
    }
    const requestId = ++routeDataRequestRef.current;
    const routeDataSections = routeDataKey.split('|').filter(Boolean) as ProcessedDataSection[];
    if (routeDataSections.length === 0) {
      setLoadedRouteDataKey(routeDataKey);
      return;
    }
    loadProcessedSections(routeDataSections)
      .then(() => {
        if (requestId === routeDataRequestRef.current) {
          setLoadedRouteDataKey(routeDataKey);
        }
      })
      .catch((e: unknown) => {
        if (requestId === routeDataRequestRef.current) {
          errorProgress({ message: `Load page data error: ${e}`, isError: true });
        }
      });
  }, [isBootstrapLoaded, routeDataKey]);

  useEffect(() => {
    if (isBootstrapLoaded && loadedRouteDataKey === routeDataKey) {
      startTransition(() => setDisplayLocation(location));
    }
  }, [isBootstrapLoaded, loadedRouteDataKey, location, routeDataKey]);

  useEffect(() => {
    setDevice();
    loadTheme(stateTheme, setStateTheme);
  }, []);

  const loadData = (signal: AbortSignal, delay = loadDataDelay()) => {
    return new Promise<void>((resolve, reject) => {
      const resolveHandler = async () => {
        resolve(await loadTimestamp());
      };

      const debouncedResolve = debounce(resolveHandler, delay);

      if (signal instanceof AbortSignal) {
        const abortHandler = () => {
          debouncedResolve.cancel();
          reject(new DOMException('Aborted', 'AbortError'));
        };

        signal.addEventListener('abort', abortHandler, { once: true });

        const originalCancel = debouncedResolve.cancel;
        debouncedResolve.cancel = () => {
          signal.removeEventListener('abort', abortHandler);
          originalCancel.call(debouncedResolve);
        };
      }

      debouncedResolve();
    });
  };

  return (
    <Box className="tw-min-h-full" sx={{ backgroundColor: 'background.default', transition: transitionTime() }}>
      <ResponsiveAppBar toggleColorMode={colorMode.toggleColorMode} version={currentVersion} />
      {isBootstrapLoaded && loadedRouteDataKey !== null && (
        <Suspense fallback={null}>
          <Routes location={displayLocation}>
            <Route path="/" element={<Pokedex styleSheet={styleSheet.current} />} />
            <Route path="/news" element={<News />} />
            <Route path="/game-master-updates" element={<GameMasterUpdates />} />
            <Route path="/game-master-updates/:patchSlug" element={<GameMasterUpdates />} />
            <Route path="/type-effective" element={<TypeEffect />} />
            <Route path="/weather-boosts" element={<Weather />} />
            <Route path="/search-pokemon" element={<SearchPokemon />} />
            <Route path="/pokemon/:id" element={<Pokemon />} />
            <Route path="/search-moves" element={<SearchMove />} />
            <Route path="/move/:id" element={<Move />} />
            <Route path="/search-types" element={<SearchTypes styleSheet={styleSheet.current} />} />
            <Route path="/find-cp-iv" element={<FindTable />} />
            <Route path="/calculate-stats" element={<CalculateStats />} />
            <Route path="/search-battle-stats" element={<SearchBattle />} />
            <Route path="/stats-table" element={<StatsInfo />} />
            <Route path="/damage-calculate" element={<Damage />} />
            <Route path="/raid-battle" element={<RaidBattle />} />
            <Route path="/calculate-point" element={<CalculatePoint />} />
            <Route path="/calculate-catch-chance" element={<CatchChance />} />
            <Route path="/dps-tdo-sheets" element={<DpsTdo />} />
            <Route path="/stats-ranking" element={<StatsRanking />} />
            <Route path="/pvp" element={<PVPHome />} />
            <Route path="/pvp/rankings/:serie/:cp" element={<RankingPVP styleSheet={styleSheet.current} />} />
            <Route path="/pvp/teams/:serie/:cp" element={<TeamPVP styleSheet={styleSheet.current} />} />
            <Route path="/pvp/battle" element={<Battle />} />
            <Route path="/pvp/battle/:cp" element={<Battle />} />
            <Route path="/pvp/:cp/:serie/:pokemon" element={<PokemonPVP styleSheet={styleSheet.current} />} />
            <Route path="/battle-leagues" element={<Leagues />} />
            <Route path="/trainer" element={<TrainerLab />} />
            <Route path="/stickers" element={<Sticker />} />
            <Route path="*" element={<Error />} />
          </Routes>
          <RouteReady location={displayLocation} />
        </Suspense>
      )}
      <Spinner />
    </Box>
  );
}

export default function Main() {
  const { key: locationKey } = useLocation();
  const [stateMode] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const [mode, setMode] = useState(stateMode);
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === TypeTheme.Light ? TypeTheme.Dark : TypeTheme.Light));
        return true;
      },
    }),
    []
  );

  const theme = useMemo(() => {
    const newTheme = createTheme(getDesignThemes(mode));
    document.documentElement.setAttribute('data-theme', newTheme.palette.mode);
    return newTheme;
  }, [mode]);

  useEffect(() => {
    document.body.removeAttribute('style');
  }, []);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary resetKey={locationKey}>
          <OptionsContext.Provider value={defaultOptions}>
            <SnackbarProvider>
              <App />
            </SnackbarProvider>
          </OptionsContext.Provider>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
