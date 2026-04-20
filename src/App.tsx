import React, { createContext, lazy, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import './App.scss';

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
import { IStyleData } from './utils/models/util.model';
import { defaultOptions, OptionsContext } from './contexts/options.context';
import useOptionsObserver from './utils/hooks/useOptionsObserver';
import { transitionTime } from './utils/helpers/options-context.helpers';
import useTimestamp from './composables/useTimestamp';
import useSpinner from './composables/useSpinner';
import useDevice from './composables/useDevice';
import { useTheme as useThemeStore } from './composables/useTheme';
import useRouter from './composables/useRouter';
import ResponsiveAppBar from './components/Commons/Navbars/ResponsiveAppBar';
import { SnackbarProvider } from './contexts/snackbar.context';

const News = lazy(() => import('./pages/News/News'));
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

const ColorModeContext = createContext({
  toggleColorMode: () => true,
});

function App() {
  const { loadTimestamp } = useTimestamp();
  const { timestampGameMaster } = useTimestamp();
  const { setBar, setPercent } = useSpinner();
  const { setDevice } = useDevice();
  const { loadTheme } = useThemeStore();
  const { routerData, routerAction } = useRouter();

  const colorMode = useContext(ColorModeContext);

  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const [, setStateTimestamp] = useLocalStorage(LocalStorageConfig.Timestamp, 0);
  const [version, setStateVersion] = useLocalStorage(LocalStorageConfig.Version, '');
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentVersion, setCurrentVersion] = useState<string>();
  const [styleSheet, setStyleSheet] = useState<IStyleData[]>([]);

  useOptionsObserver();

  useEffect(() => {
    setStyleSheet(getStyleList());
  }, []);

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

  useEffect(() => {
    if (!isLoaded) {
      const currentVersion = process.env.REACT_APP_VERSION;
      setCurrentVersion(currentVersion);
      setBar(true);
      setPercent(0);
      setIsLoaded(true);
      const isCurrentVersion = currentVersion === version;
      setStateVersion(currentVersion || '');
      loadTimestamp(isCurrentVersion);
    }
  }, [isLoaded]);

  useEffect(() => {
    setDevice();
    loadTheme(stateTheme, setStateTheme);
  }, []);

  return (
    <Box className="tw-min-h-full" sx={{ backgroundColor: 'background.default', transition: transitionTime() }}>
      <ResponsiveAppBar toggleColorMode={colorMode.toggleColorMode} version={currentVersion} />
      <Suspense>
        <Routes>
          <Route path="/" element={<Pokedex styleSheet={styleSheet} />} />
          <Route path="/news" element={<News />} />
          <Route path="/type-effective" element={<TypeEffect />} />
          <Route path="/weather-boosts" element={<Weather />} />
          <Route path="/search-pokemon" element={<SearchPokemon />} />
          <Route path="/pokemon/:id" element={<Pokemon />} />
          <Route path="/search-moves" element={<SearchMove />} />
          <Route path="/move/:id" element={<Move />} />
          <Route path="/search-types" element={<SearchTypes styleSheet={styleSheet} />} />
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
          <Route path="/pvp/rankings/:serie/:cp" element={<RankingPVP styleSheet={styleSheet} />} />
          <Route path="/pvp/teams/:serie/:cp" element={<TeamPVP styleSheet={styleSheet} />} />
          <Route path="/pvp/battle" element={<Battle />} />
          <Route path="/pvp/battle/:cp" element={<Battle />} />
          <Route path="/pvp/:cp/:serie/:pokemon" element={<PokemonPVP styleSheet={styleSheet} />} />
          <Route path="/battle-leagues" element={<Leagues />} />
          <Route path="/stickers" element={<Sticker />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
      <Spinner />
    </Box>
  );
}

export default function Main() {
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
        <ErrorBoundary>
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
