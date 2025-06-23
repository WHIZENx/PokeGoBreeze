import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { loadTimestamp } from './store/effects/store.effects';

import './App.scss';

import NavbarComponent from './components/Navbar';
// import FooterComponent from './components/Footer'

import News from './pages/News/News';
import Pokedex from './pages/Pokedex/Pokedex';
import SearchPokemon from './pages/Search/Pokemon/Search';
import SearchMove from './pages/Search/Moves/SearchMoves';
import TypeEffect from './pages/TypeEffect/TypeEffect';
import Weather from './pages/Weather/Weather';
import Pokemon from './pages/Pokemon/Pokemon';
import FindTable from './pages/Tools/FindTable/FindTable';
import CalculateStats from './pages/Tools/CalculateStats/CalculateStats';
import Damage from './pages/Tools/BattleDamage/Damage';
import DpsTdo from './pages/Sheets/DpsTdo/DpsTdo';
import Move from './pages/Move/Move';
import Error from './pages/Error/Error';
import Leagues from './pages/PVP/Leagues/Leagues';
import SearchBattle from './pages/Tools/SearchBattle/SearchBattle';
import StatsTable from './pages/Tools/StatsTable/Stats';
import Sticker from './pages/Sticker/Sticker';
import RaidBattle from './pages/Tools/RaidBattle/RaidBattle';
import CalculatePoint from './pages/Tools/CalculatePoint/CalculatePoint';
import RankingPVP from './pages/PVP/Ranking/PVP';
import PokemonPVP from './pages/PVP/Pokemon/Pokemon';
import PVPHome from './pages/PVP/Home';
import TeamPVP from './pages/PVP/Teams/PVP';
import Battle from './pages/PVP/Battle/Battle';

import Spinner from './components/Spinner/Spinner';
import CatchChance from './pages/Tools/CatchChance/CatchChance';
import { useLocalStorage } from 'usehooks-ts';
import SearchTypes from './pages/Search/Types/Types';
import StatsRanking from './pages/Sheets/StatsRanking/StatsRanking';
import { loadTheme } from './store/effects/theme.effects';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { getDesignThemes } from './utils/models/overrides/themes.model';
import { LOAD_DATA_DELAY, TRANSITION_TIME } from './utils/constants';
import { TypeTheme } from './enums/type.enum';
import { DeviceActions, SpinnerActions } from './store/actions';
import { LocalStorageConfig } from './store/constants/local-storage';
import { RouterState, StoreState, TimestampState } from './store/models/state.model';
import { Action } from 'history';
import { debounce } from 'lodash';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { clearLocalStorageExcept } from './utils/configs/local-storage.config';
import { getStyleList } from './utils/utils';
import { defaultOptions, OptionsContext } from './contexts/options.context';
import optionsObserver from './utils/hooks/optionsObserver';

const ColorModeContext = createContext({
  toggleColorMode: () => true,
});

function App() {
  const dispatch = useDispatch();
  const data = useSelector((state: StoreState) => state.store.data);
  const timestamp = useSelector((state: TimestampState) => state.timestamp);
  const router = useSelector((state: RouterState) => state.router);

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const [, setStateTimestamp] = useLocalStorage(LocalStorageConfig.Timestamp, 0);
  const [version, setStateVersion] = useLocalStorage(LocalStorageConfig.Version, '');
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentVersion, setCurrentVersion] = useState<string>();
  const styleSheet = useRef(getStyleList());

  optionsObserver();

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
    if (router && router.action === Action.Pop) {
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
  }, [router]);

  useEffect(() => {
    if (timestamp?.gamemaster) {
      setStateTimestamp(timestamp.gamemaster);
    }
  }, [timestamp?.gamemaster]);

  useEffect(() => {
    const controller = new AbortController();
    if (!isLoaded) {
      const currentVersion = process.env.REACT_APP_VERSION;
      setCurrentVersion(currentVersion);
      dispatch(SpinnerActions.SetBar.create(true));
      dispatch(SpinnerActions.SetPercent.create(0));
      setIsLoaded(true);
      const isCurrentVersion = currentVersion === version;
      setStateVersion(currentVersion || '');
      loadData(controller.signal, isCurrentVersion);
    }
  }, [isLoaded]);

  useEffect(() => {
    dispatch(DeviceActions.SetDevice.create());
    loadTheme(dispatch, stateTheme, setStateTheme);
  }, [dispatch]);

  const loadData = (signal: AbortSignal, isCurrentVersion: boolean, delay = LOAD_DATA_DELAY) => {
    return new Promise<void>((resolve, reject) => {
      const resolveHandler = async () => {
        resolve(await loadTimestamp(dispatch, data, timestamp, isCurrentVersion));
      };

      const debouncedResolve = debounce(resolveHandler, delay);

      if (signal instanceof AbortSignal) {
        const abortHandler = () => {
          debouncedResolve.cancel();
          reject();
        };

        signal.addEventListener('abort', abortHandler, { once: true });

        const originalResolve = debouncedResolve;
        debouncedResolve.cancel = () => {
          signal.removeEventListener('abort', abortHandler);
          originalResolve.cancel();
        };
      }

      debouncedResolve();
    });
  };

  return (
    <Box className="min-h-100" sx={{ backgroundColor: 'background.default', transition: TRANSITION_TIME }}>
      <NavbarComponent mode={theme.palette.mode} toggleColorMode={colorMode.toggleColorMode} version={currentVersion} />
      <Routes>
        <Route path="/" element={<Pokedex styleSheet={styleSheet.current} />} />
        <Route path="/news" element={<News />} />
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
        <Route path="/stats-table" element={<StatsTable />} />
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
        <Route path="/stickers" element={<Sticker />} />
        <Route path="*" element={<Error />} />
      </Routes>
      {/* <FooterComponent /> */}
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
    document.documentElement.setAttribute('data-bs-theme', newTheme.palette.mode);
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
            <App />
          </OptionsContext.Provider>
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
