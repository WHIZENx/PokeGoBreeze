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

const { store, persistor } = configureStore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <>
    <Provider store={store}>
      <PersistGate loading={<LoadingPersist />} persistor={persistor}>
        <BrowserRouter>
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
