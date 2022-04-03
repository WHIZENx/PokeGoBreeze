import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from 'notistack'
import './App.css';

import NavbarComponent from './components/Navbar'
import FooterComponent from './components/Footer'

import Home from './pages/Home/Home'
import Search from './pages/Search/Search'
import TypeEffect from './pages/TypeEffect/TypeEffect'
import Weather from './pages/Weather/Weather';
import Pokemon from './pages/Pokemon/Pokemon';

function App() {
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
              <Route path="/search" element={<Search />}></Route>
              <Route path="/type-effective" element={<TypeEffect />}></Route>
              <Route path="/weather-boosts" element={<Weather />}></Route>
              <Route path="/pokemon/:id" element={<Pokemon />}></Route>
            </Routes>
            {/* <FooterComponent /> */}
          </div>
        </BrowserRouter>
      </SnackbarProvider>
    );
}

export default App;