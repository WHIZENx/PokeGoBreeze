import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
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
import Leagues from './pages/Leagues/Legues';
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

const App = () => {

    return (
      <SnackbarProvider
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      maxSnack={1}>
        <BrowserRouter>
            <NavbarComponent />
            <Routes>
              <Route path="/" element={<Home/>}></Route>
              <Route path="/type-effective" element={<TypeEffect/>}></Route>
              <Route path="/weather-boosts" element={<Weather/>}></Route>
              <Route path="/search-pokemon" element={<SearchPokemon/>}></Route>
              <Route path="/search-move" element={<SearchMove/>}></Route>
              <Route path="/pokemon/:id" element={<Pokemon/>}></Route>
              <Route path="/moves/:id" element={<Move/>}></Route>
              <Route path="/find-cp-iv" element={<FindTable/>}></Route>
              <Route path="/calculate-stats" element={<CalculateStats/>}></Route>
              <Route path="/search-battle-stats" element={<SearchBattle/>}></Route>
              <Route path="/stats-table" element={<StatsTable/>}></Route>
              <Route path="/damage-calculate" element={<Damage/>}></Route>
              <Route path="/raid-battle" element={<RaidBattle/>}></Route>
              <Route path="/calculate-point" element={<CalculatePoint/>}></Route>
              <Route path="/pvp" element={<PVPHome/>}></Route>
              <Route path="/pvp/rankings/:serie/:cp/:type" element={<RankingPVP/>}></Route>
              <Route path="/pvp/:cp/:type/:pokemon" element={<PokemonPVP/>}></Route>
              <Route path="/pvp/teams/:serie/:cp" element={<TeamPVP/>}></Route>
              <Route path="/pvp/battle" element={<Battle/>}></Route>
              <Route path="/dps-tdo-table" element={<DpsTable/>}></Route>
              <Route path="/battle-leagues" element={<Leagues/>}></Route>Sticker
              <Route path="/stickers" element={<Sticker/>}></Route>
              <Route path="*" element={<Error/>}></Route>
            </Routes>
            {/* <FooterComponent /> */}
        </BrowserRouter>
      </SnackbarProvider>
    );
}

export default App;