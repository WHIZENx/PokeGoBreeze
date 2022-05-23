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
import Calculate from './pages/Tools/Calculate/Calculate';
import Damage from './pages/Tools/BattleDamage/Damage';
import DpsTable from './pages/DpsSheet/DpsTable';
import Move from './pages/Move/Move';
import Error from './pages/Error/Error';
import Leagues from './pages/Leagues/Legues';
import FindBattle from './pages/Tools/FindBattle/FindBattle';
import StatsTable from './pages/Tools/StatsTable/Stats';

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
              <Route path="/" element={<Home />}></Route>
              <Route path="/type-effective" element={<TypeEffect />}></Route>
              <Route path="/weather-boosts" element={<Weather />}></Route>
              <Route path="/search-pokemon" element={<SearchPokemon/>}></Route>
              <Route path="/search-move" element={<SearchMove/>}></Route>
              <Route path="/find-cp-iv" element={<FindTable/>}></Route>
              <Route path="/calculate-cp-iv" element={<Calculate/>}></Route>
              <Route path="/find-battle-stats" element={<FindBattle/>}></Route>
              <Route path="/pokemon/:id" element={<Pokemon/>}></Route>
              <Route path="/moves/:id" element={<Move/>}></Route>
              <Route path="/stats-table" element={<StatsTable/>}></Route>
              <Route path="/damage-calculate" element={<Damage/>}></Route>
              <Route path="/dps-tdo-table" element={<DpsTable/>}></Route>
              <Route path="/battle-leagues" element={<Leagues/>}></Route>
              <Route path="*" element={<Error/>}></Route>
            </Routes>
            {/* <FooterComponent /> */}
        </BrowserRouter>
      </SnackbarProvider>
    );
}

export default App;