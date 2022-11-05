import React, { Fragment, useEffect } from 'react';
import packageInfo from '../package.json';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { loadStore } from './store/actions/store.action';
import { hideSpinner } from './store/actions/spinner.action';
import APIService from './services/API.service';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import importedComponent from 'react-imported-component';

import './App.css';

import NavbarComponent from './components/Navbar';
// import FooterComponent from './components/Footer'

import Home from './pages/Home/Home';
import SearchPokemon from './pages/Search/Pokemon/Search';
import SearchMove from './pages/Search/Move/Search';
import TypeEffect from './pages/TypeEffect/TypeEffect';
import Weather from './pages/Weather/Weather';
import Pokemon from './pages/Pokemon/Pokemon';
import FindTable from './pages/Tools/FindTable/FindTable';
import CalculateStats from './pages/Tools/CalculateStats/CalculateStats';
import Damage from './pages/Tools/BattleDamage/Damage';
import DpsTable from './pages/DpsSheet/DpsTable';
import Move from './pages/Move/Move';
import Error from './pages/Error/Error';
import Leagues from './pages/PVP/Leagues/Legues';
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
import { loadStats } from './store/actions/stats.action';
import CatchChance from './pages/Tools/CatchChance/CatchChane';
import { useLocalStorage } from 'usehooks-ts';
import SearchTypes from './pages/Search/Types/Types';

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
//     () => import(/* webpackChunkName:'Leagues' */ './pages/Leagues/Legues')
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

const App = () => {
  const dispatch = useDispatch();
  const data = useSelector((state: RootStateOrAny) => state.store);
  const stats = useSelector((state: RootStateOrAny) => state.stats);

  const [stateTimestamp, setStateTimestamp] = useLocalStorage(
    'timestamp',
    JSON.stringify({
      gamemaster: null,
      battle: null,
    })
  );
  const [stateMove, setStateMove] = useLocalStorage('moves', null);
  const [stateCandy, setStateCandy] = useLocalStorage('candy', null);
  const [stateImage, setStateImage] = useLocalStorage('assets', null);
  const [stateSound, setStateSound] = useLocalStorage('sounds', null);
  const [statePVP, setStatePVP] = useLocalStorage('pvp', null);
  const [, setVersion] = useLocalStorage('version', '');

  useEffect(() => {
    const axios = APIService;
    const cancelToken = axios.getAxios().CancelToken;
    const source = cancelToken.source();
    loadStore(
      dispatch,
      null,
      stateTimestamp,
      stateMove,
      stateCandy,
      stateImage,
      stateSound,
      statePVP,
      null,
      setStateTimestamp,
      setStateMove,
      setStateCandy,
      setStateImage,
      setStateSound,
      setStatePVP,
      axios,
      source
    );
  }, [dispatch]);

  useEffect(() => {
    setVersion(packageInfo.version);
    dispatch(loadStats());
  }, [dispatch]);

  useEffect(() => {
    if (data.data && stats) {
      dispatch(hideSpinner());
    }
  }, [dispatch, data.data, stats]);

  return (
    <Fragment>
      <BrowserRouter>
        <NavbarComponent />
        {data.data && stats && (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/type-effective" element={<TypeEffect />} />
            <Route path="/weather-boosts" element={<Weather />} />
            <Route path="/search-pokemon" element={<SearchPokemon />} />
            <Route path="/search-moves" element={<SearchMove />} />
            <Route path="/search-types" element={<SearchTypes />} />
            <Route path="/pokemon/:id" element={<Pokemon />} />
            <Route path="/move/:id" element={<Move />} />
            <Route path="/find-cp-iv" element={<FindTable />} />
            <Route path="/calculate-stats" element={<CalculateStats />} />
            <Route path="/search-battle-stats" element={<SearchBattle />} />
            <Route path="/stats-table" element={<StatsTable />} />
            <Route path="/damage-calculate" element={<Damage />} />
            <Route path="/raid-battle" element={<RaidBattle />} />
            <Route path="/calculate-point" element={<CalculatePoint />} />
            <Route path="/calculate-catch-chance" element={<CatchChance />} />
            <Route path="/pvp" element={<PVPHome />} />
            <Route path="/pvp/rankings/:serie/:cp/:type" element={<RankingPVP />} />
            <Route path="/pvp/:cp/:type/:pokemon" element={<PokemonPVP />} />
            <Route path="/pvp/teams/:serie/:cp" element={<TeamPVP />} />
            <Route path="/pvp/battle" element={<Battle />} />
            <Route path="/pvp/battle/:cp" element={<Battle />} />
            <Route path="/dps-tdo-table" element={<DpsTable />} />
            <Route path="/battle-leagues" element={<Leagues />} />
            <Route path="/stickers" element={<Sticker />} />
            <Route path="*" element={<Error />} />
          </Routes>
        )}
        {/* <FooterComponent /> */}
      </BrowserRouter>
      <Spinner />
    </Fragment>
  );
};

export default App;
