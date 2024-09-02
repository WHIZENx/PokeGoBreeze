import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { loadCPM, loadPokeGOLogo, loadTimestamp } from './store/effects/store.effects';

import './App.scss';

import NavbarComponent from './components/Navbar';
// import FooterComponent from './components/Footer'

import Home from './pages/Home/Home';
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
import { getDesignThemes, ThemeModify } from './util/models/overrides/themes.model';
import { TRANSITION_TIME } from './util/constants';
import { PaletteMode } from '@mui/material';
import { TypeTheme } from './enums/type.enum';
import { DeviceActions, SpinnerActions } from './store/actions';
import { LocalStorageConfig } from './store/constants/localStorage';
import { LocalTimeStamp } from './store/models/local-storage.model';

// tslint:disable-next-line: no-empty
const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const dispatch = useDispatch();

  const theme = useTheme<ThemeModify>();
  const colorMode = useContext(ColorModeContext);
  const [stateTheme, setStateTheme] = useLocalStorage(LocalStorageConfig.THEME, TypeTheme.LIGHT);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(LocalStorageConfig.TIMESTAMP, JSON.stringify(new LocalTimeStamp()));
  const [stateImage, setStateImage] = useLocalStorage(LocalStorageConfig.ASSETS, '');
  const [stateSound, setStateSound] = useLocalStorage(LocalStorageConfig.SOUNDS, '');

  useEffect(() => {
    const fetchData = async () => {
      await loadTimestamp(dispatch, stateTimestamp, setStateTimestamp, setStateImage, setStateSound, stateImage, stateSound);
    };
    dispatch(DeviceActions.SetDevice.create());
    dispatch(SpinnerActions.SetBar.create(true));
    dispatch(SpinnerActions.SetPercent.create(0));
    loadTheme(dispatch, stateTheme, setStateTheme);
    loadCPM(dispatch);
    loadPokeGOLogo(dispatch);
    dispatch(SpinnerActions.SetPercent.create(15));
    fetchData();
  }, [dispatch]);

  return (
    <Box sx={{ minHeight: '100%', backgroundColor: 'background.default', transition: TRANSITION_TIME }}>
      <NavbarComponent mode={theme.palette.mode} toggleColorMode={colorMode.toggleColorMode} />
      <Routes>
        <Route path="/" element={<Home />} />
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
  const [stateMode] = useLocalStorage(LocalStorageConfig.THEME, TypeTheme.LIGHT);
  const [mode, setMode] = useState(stateMode ?? TypeTheme.LIGHT);
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === TypeTheme.LIGHT ? TypeTheme.DARK : TypeTheme.LIGHT));
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(getDesignThemes(mode as PaletteMode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
