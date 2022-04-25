import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from 'notistack'
import './App.css';

import NavbarComponent from './components/Navbar'
// import FooterComponent from './components/Footer'

import Home from './pages/Home/Home'
import Search from './pages/Search/Search'
import TypeEffect from './pages/TypeEffect/TypeEffect'
import Weather from './pages/Weather/Weather';
import Pokemon from './pages/Pokemon/Pokemon';
import FindTable from './pages/CalculateTools/FindTable/FindTable';
import Calculate from './pages/CalculateTools/Calculate/Calculate';
import StatsTable from './pages/Table/Stats';
import Damage from './pages/Battle/Damage/Damage';
import DpsTable from './pages/Battle/DpsSheet/DpsTable';
import Move from './pages/Move/Move';

const App = () => {

    return (
      <SnackbarProvider
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      maxSnack={1}>
        <BrowserRouter>
          <div className="App">
            <NavbarComponent />
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/type-effective" element={<TypeEffect />}></Route>
              <Route path="/weather-boosts" element={<Weather />}></Route>
              <Route path="/search" element={<Search/>}></Route>
              <Route path="/find-cp-iv" element={<FindTable/>}></Route>
              <Route path="/calculate-cp-iv" element={<Calculate/>}></Route>
              <Route path="/pokemon/:id" element={<Pokemon/>}></Route>
              <Route path="/move/:id" element={<Move/>}></Route>
              <Route path="/stats-table" element={<StatsTable/>}></Route>
              <Route path="/damage-calculate" element={<Damage/>}></Route>
              <Route path="/dps-table" element={<DpsTable/>}></Route>
            </Routes>
            {/* <FooterComponent /> */}
          </div>
        </BrowserRouter>
      </SnackbarProvider>
    );
}

export default App;