import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import packageInfo from '../package.json';
import { loadCPM, loadPokeGOLogo, loadTimestamp } from './store/actions/store.action';
import { showSpinnerWithMsg } from './store/actions/spinner.action';
// import importedComponent from 'react-imported-component';

import './App.scss';

import NavbarComponent from './components/Navbar';
// import FooterComponent from './components/Footer'

import Home from './pages/Home/Home-v2';
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
import { loadTheme } from './store/actions/theme.action';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { getDesignThemes } from './assets/themes/themes';
import { SYNC_MSG, TRANSITION_TIME } from './util/Constants';
import { DataModel } from './store/models/store.model';

// const AsyncHome = importedComponent(
//     () => import(/* webpackChunkName:'Home' */ './pages/Home/Home')
// );

// const AsyncTypeEffect = importedComponent(
//     () => import(/* webpackChunkName:'TypeEffect' */ './pages/TypeEffect/TypeEffect')
// );

// const AsyncWeather = importedComponent(
//     () => import(/* webpackChunkName:'Weather' */ './pages/Weather/Weather')
// );

// const AsyncSearchPokemon = importedComponent(
//     () => import(/* webpackChunkName:'SearchPokemon' */ './pages/Search/Pokemon/Search')
// );

// const AsyncSearchMove = importedComponent(
//     () => import(/* webpackChunkName:'SearchMove' */ './pages/Search/Move/Search')
// );

// const AsyncPokemon = importedComponent(
//     () => import(/* webpackChunkName:'Pokemon' */ './pages/Pokemon/Pokemon')
// );

// const AsyncFindTable = importedComponent(
//     () => import(/* webpackChunkName:'FindTable' */ './pages/Tools/FindTable/FindTable')
// );

// const AsyncCalculateStats = importedComponent(
//     () => import(/* webpackChunkName:'CalculateStats' */ './pages/Tools/CalculateStats/CalculateStats')
// );

// const AsyncDamage = importedComponent(
//     () => import(/* webpackChunkName:'Damage' */ './pages/Tools/BattleDamage/Damage')
// );

// const AsyncDpsTable = importedComponent(
//     () => import(/* webpackChunkName:'DpsTable' */ './pages/DpsSheet/DpsTable')
// );

// const AsyncMove = importedComponent(
//     () => import(/* webpackChunkName:'Move' */ './pages/Move/Move')
// );

// const AsyncError = importedComponent(
//     () => import(/* webpackChunkName:'Error' */ './pages/Error/Error')
// );

// const AsyncLeagues = importedComponent(
//     () => import(/* webpackChunkName:'Leagues' */ './pages/Leagues/Leagues')
// );

// const AsyncSearchBattle = importedComponent(
//     () => import(/* webpackChunkName:'SearchBattle' */ './pages/Tools/SearchBattle/SearchBattle')
// );

// const AsyncStatsTable = importedComponent(
//     () => import(/* webpackChunkName:'StatsTable' */ './pages/Tools/StatsTable/Stats')
// );

// const AsyncSticker = importedComponent(
//     () => import(/* webpackChunkName:'Sticker' */ './pages/Sticker/Sticker')
// );

// const AsyncRaidBattle = importedComponent(
//     () => import(/* webpackChunkName:'RaidBattle' */ './pages/Tools/RaidBattle/RaidBattle')
// );

// const AsyncCalculatePoint = importedComponent(
//     () => import(/* webpackChunkName:'CalculatePoint' */ './pages/Tools/CalculatePoint/CalculatePoint')
// );

// const AsyncRankingPVP = importedComponent(
//     () => import(/* webpackChunkName:'RankingPVP' */ './pages/PVP/Ranking/PVP')
// );

// const AsyncPokemonPVP = importedComponent(
//     () => import(/* webpackChunkName:'PokemonPVP' */ './pages/PVP/Pokemon/Pokemon')
// );

// const AsyncPVPHome = importedComponent(
//     () => import(/* webpackChunkName:'PVPHome' */ './pages/PVP/Home')
// );

// const AsyncTeamPVP = importedComponent(
//     () => import(/* webpackChunkName:'TeamPVP' */ './pages/PVP/Teams/PVP')
// );

// const AsyncBattle = importedComponent(
//     () => import(/* webpackChunkName:'Battle' */ './pages/PVP/Battle/Battle')
// );

// tslint:disable-next-line: no-empty
const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const dispatch = useDispatch();
  const data: DataModel | null = useSelector((state: RootStateOrAny) => state.store.data);
  const stats = useSelector((state: RootStateOrAny) => state.stats);

  const [stateTheme, setStateTheme] = useLocalStorage('theme', 'light');
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(
    'timestamp',
    JSON.stringify({
      gamemaster: null,
      pvp: null,
      images: null,
      sounds: null,
    })
  );
  const [stateCandy, setStateCandy] = useLocalStorage('candy', null);
  const [stateImage, setStateImage] = useLocalStorage('assets', null);
  const [stateSound, setStateSound] = useLocalStorage('sounds', null);
  const [, setVersion] = useLocalStorage('version', '');

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    dispatch(showSpinnerWithMsg(SYNC_MSG));
    loadTheme(dispatch, stateTheme, setStateTheme);
    loadCPM(dispatch);
    loadPokeGOLogo(dispatch);
    loadTimestamp(
      dispatch,
      stateTimestamp,
      setStateTimestamp,
      setStateImage,
      setStateSound,
      setStateCandy,
      stateImage,
      stateSound,
      stateCandy
    );
    // loadStore(
    //   dispatch,
    //   stateTimestamp,
    //   stateMove,
    //   stateCandy,
    //   stateImage,
    //   stateSound,
    //   statePVP,
    //   setStateTimestamp,
    //   setStateMove,
    //   setStateCandy,
    //   setStateImage,
    //   setStateSound,
    //   setStatePVP
    // );
  }, [dispatch]);

  useEffect(() => {
    setVersion(packageInfo.version);
  }, [dispatch]);

  // useEffect(() => {
  //   if (data?.assets && data.candy && data.combat && data.cpm && data.details && data.evolution && data.leagues && data && stats) {
  //     dispatch(hideSpinner());
  //     setIsLoadDataSuccess(true);
  //   }
  // }, [dispatch, data, stats]);

  const renderPage = (page: JSX.Element, condition: boolean = false) => {
    return condition ? page : <></>;
  };

  return (
    <Box sx={{ minHeight: '100%', backgroundColor: 'background.default', transition: TRANSITION_TIME }}>
      <NavbarComponent mode={theme.palette.mode} toggleColorMode={colorMode.toggleColorMode} />
      {data && stats && (
        <Routes>
          <Route path="/" element={renderPage(<Home />, data.typeEff && data.pokemonData && data.details && data.assets ? true : false)} />
          <Route path="/type-effective" element={renderPage(<TypeEffect />, data.typeEff ? true : false)} />
          <Route path="/weather-boosts" element={renderPage(<Weather />, data.typeEff && data.weatherBoost ? true : false)} />
          <Route
            path="/search-pokemon"
            element={renderPage(
              <SearchPokemon />,
              data.pokemonName && data.pokemonData && data.evolution && data.details && data.released && data.candy && data.assets
                ? true
                : false
            )}
          />
          <Route path="/search-moves" element={renderPage(<SearchMove />, data.combat && data.typeEff ? true : false)} />
          <Route path="/search-types" element={renderPage(<SearchTypes />, data.released && data.combat && data.typeEff ? true : false)} />
          <Route
            path="/pokemon/:id"
            element={renderPage(
              <Pokemon />,
              data.pokemonName && data.pokemonData && data.evolution && data.details && data.released && data.candy && data.assets
                ? true
                : false
            )}
          />
          <Route
            path="/move/:id"
            element={renderPage(
              <Move />,
              data.weatherBoost && data.combat && data.options && data.released && data.typeEff && data.pokemonCombat ? true : false
            )}
          />
          <Route path="/find-cp-iv" element={renderPage(<FindTable />, data.pokemonName && data.pokemonData ? true : false)} />
          <Route
            path="/calculate-stats"
            element={renderPage(<CalculateStats />, data.pokemonName && data.pokemonData && data.options ? true : false)}
          />
          <Route
            path="/search-battle-stats"
            element={renderPage(
              <SearchBattle />,
              data.pokemonName && data.pokemonData && data.evolution && data.options && data.assets ? true : false
            )}
          />
          <Route path="/stats-table" element={renderPage(<StatsTable />, data.pokemonName && data.pokemonData ? true : false)} />
          <Route
            path="/damage-calculate"
            element={renderPage(<Damage />, data.pokemonName && data.pokemonData && data.options && data.typeEff ? true : false)}
          />
          <Route
            path="/raid-battle"
            element={renderPage(
              <RaidBattle />,
              data.pokemonName &&
                data.pokemonData &&
                data.pokemonCombat &&
                data.combat &&
                data.options &&
                data.typeEff &&
                data.weatherBoost &&
                data.details &&
                data.assets
                ? true
                : false
            )}
          />
          <Route
            path="/calculate-point"
            element={renderPage(<CalculatePoint />, data.pokemonName && data.pokemonData && data.options && data.typeEff ? true : false)}
          />
          <Route
            path="/calculate-catch-chance"
            element={renderPage(<CatchChance />, data.pokemonName && data.pokemonData && data.pokemon ? true : false)}
          />
          <Route path="/pvp" element={renderPage(<PVPHome />, data.leagues ? true : false)} />
          <Route
            path="/pvp/rankings/:serie/:cp/:type"
            element={renderPage(<RankingPVP />, data.pokemonData && data.assets && data.combat && data.pokemonCombat ? true : false)}
          />
          <Route
            path="/pvp/:cp/:type/:pokemon"
            element={renderPage(<PokemonPVP />, data.pokemonData && data.assets && data.combat && data.pokemonCombat ? true : false)}
          />
          <Route
            path="/pvp/teams/:serie/:cp"
            element={renderPage(<TeamPVP />, data.pokemonData && data.assets && data.combat && data.pokemonCombat ? true : false)}
          />
          <Route
            path="/pvp/battle"
            element={renderPage(<Battle />, data.options && data.typeEff && data.pokemonData && data.assets && data.combat ? true : false)}
          />
          <Route
            path="/pvp/battle/:cp"
            element={renderPage(<Battle />, data.options && data.typeEff && data.pokemonData && data.assets && data.combat ? true : false)}
          />
          <Route
            path="/dps-tdo-sheets"
            element={renderPage(
              <DpsTdo />,
              data.pokemonData && data.typeEff && data.weatherBoost && data.combat && data.pokemonCombat && data.options && data.details
                ? true
                : false
            )}
          />
          <Route
            path="/stats-ranking"
            element={renderPage(<StatsRanking />, data.pokemonData && data.combat && data.pokemonCombat ? true : false)}
          />
          <Route path="/battle-leagues" element={renderPage(<Leagues />, data.leagues && data.assets ? true : false)} />
          <Route path="/stickers" element={renderPage(<Sticker />, data.stickers ? true : false)} />
          <Route path="*" element={<Error />} />
        </Routes>
      )}
      {/* <FooterComponent /> */}
      <Spinner />
    </Box>
  );
}

export default function Main() {
  const [stateMode]: any = useLocalStorage('theme', 'light');
  const [mode, setMode] = useState<'light' | 'dark'>(stateMode ?? 'light');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
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
