import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SnackbarProvider } from 'notistack'
import './App.css';

import Home from './pages/Home/Home'
import Search from './pages/Search/Search'
import Type from './pages/Type/Type'

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
            <Routes>
              <Route path="/" element={<Home />}></Route>
              <Route path="/search" element={<Search />}></Route>
              <Route path="/type_effective" element={<Type />}></Route>
            </Routes>
          </div>
        </BrowserRouter>
      </SnackbarProvider>
    );
}

export default App;
