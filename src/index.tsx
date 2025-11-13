import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.scss';

import { Provider } from 'react-redux';

import reportWebVitals from './reportWebVitals';

import configureStore from './store/configure';
import Main from './App';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';

import RouterSync from './utils/hooks/useRouterSync';
import LoadingPersist from './components/Sprites/Loading/LoadingPersist';
import { TypeTheme } from './enums/type.enum';
import { LocalStorageConfig } from './store/constants/local-storage';
import { lightThemeBg, darkThemeBg } from './utils/helpers/options-context.helpers';

const { store, persistor } = configureStore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Set theme and apply it to HTML element before React renders
let theme = TypeTheme.Light;
try {
  const savedTheme = localStorage.getItem(LocalStorageConfig.Theme);
  if (savedTheme) {
    theme = JSON.parse(savedTheme) === TypeTheme.Dark ? TypeTheme.Dark : TypeTheme.Light;
  }
} catch {
  theme = TypeTheme.Light;
}

document.documentElement.setAttribute('data-theme', theme);
document.body.style.background = theme === TypeTheme.Dark ? darkThemeBg() : lightThemeBg();

root.render(
  <>
    <Provider store={store}>
      <PersistGate loading={<LoadingPersist />} persistor={persistor}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RouterSync />
          <Main />
        </BrowserRouter>
      </PersistGate>
    </Provider>
    <Analytics />
    <SpeedInsights />
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
