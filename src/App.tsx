import React, { createContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { loadCPM, loadPokeGOLogo, loadTimestamp } from './store/effects/store.effects';

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
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { getDesignThemes } from './util/models/overrides/themes.model';
import { LOAD_DATA_DELAY, TRANSITION_TIME } from './util/constants';
import { TypeTheme } from './enums/type.enum';
import { DeviceActions, SpinnerActions } from './store/actions';
import { LocalStorageConfig } from './store/constants/localStorage';
import { LocalTimeStamp } from './store/models/local-storage.model';
import { RouterState, StoreState } from './store/models/state.model';
import { isNotEmpty } from './util/extension';
import { Action } from 'history';

// tslint:disable-next-line: no-empty
const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const dispatch = useDispatch();
  const data = useSelector((state: StoreState) => state.store.data);
  const router = useSelector((state: RouterState) => state.router);

  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.Theme, TypeTheme.Light);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(LocalStorageConfig.Timestamp, JSON.stringify(new LocalTimeStamp()));
  const [stateImage, setStateImage] = useLocalStorage(LocalStorageConfig.Assets, '');
  const [stateSound, setStateSound] = useLocalStorage(LocalStorageConfig.Sounds, '');

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(
      () =>
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        }),
      400
    );
  }, []);

  useEffect(() => {
    if (router && router.action === Action.Pop) {
      setTimeout(
        () =>
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
          }),
        1
      );
    }
  }, [router]);

  useEffect(() => {
    dispatch(DeviceActions.SetDevice.create());
    dispatch(SpinnerActions.SetBar.create(true));
    dispatch(SpinnerActions.SetPercent.create(0));
    loadTheme(dispatch, stateTheme, setStateTheme);
    loadPokeGOLogo(dispatch);
    dispatch(SpinnerActions.SetPercent.create(15));
  }, [dispatch]);

  useEffect(() => {
    const controller = new AbortController();
    if (!isLoaded) {
      setIsLoaded(true);
      loadData(controller.signal);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isNotEmpty(data.cpm) && isNotEmpty(data.options.playerSetting.levelUps)) {
      loadCPM(dispatch, data.options.playerSetting.cpMultipliers);
    }
  }, [data]);

  const loadData = (signal: AbortSignal, delay = LOAD_DATA_DELAY) => {
    return new Promise<void>((resolve, reject) => {
      let timeout: NodeJS.Timeout | number;
      const abortHandler = () => {
        clearTimeout(timeout);
        reject();
      };

      const resolveHandler = async () => {
        if (signal instanceof AbortSignal) {
          signal.removeEventListener('abort', abortHandler);
        }
        resolve(await loadTimestamp(dispatch, stateTimestamp, setStateTimestamp, setStateImage, setStateSound, stateImage, stateSound));
      };

      timeout = setTimeout(resolveHandler, delay);

      if (signal instanceof AbortSignal) {
        signal.addEventListener('abort', abortHandler, { once: true });
      }
    });
  };

  return (
    <Box sx={{ minHeight: '100%', backgroundColor: 'background.default', transition: TRANSITION_TIME }}>
      <NavbarComponent />
      <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/news" element={<News />} />
        <Route path="/type-effective" element={<TypeEffect />} />
        <Route path="/weather-boosts" element={<Weather />} />
        <Route path="/search-pokemon" element={<SearchPokemon />} />
        <Route path="/pokemon/:id" element={<Pokemon />} />
        <Route path="/search-moves" element={<SearchMove />} />
        <Route path="/move/:id" element={<Move />} />
        <Route path="/search-types" element={<SearchTypes />} />
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
        <Route path="/pvp/rankings/:serie/:cp/:type" element={<RankingPVP />} />
        <Route path="/pvp/teams/:serie/:cp" element={<TeamPVP />} />
        <Route path="/pvp/battle" element={<Battle />} />
        <Route path="/pvp/battle/:cp" element={<Battle />} />
        <Route path="/pvp/:cp/:type/:pokemon" element={<PokemonPVP />} />
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
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(getDesignThemes(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
