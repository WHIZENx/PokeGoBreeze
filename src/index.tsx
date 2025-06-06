import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.scss';

import { Provider } from 'react-redux';

import { SnackbarProvider } from 'notistack';

import reportWebVitals from './reportWebVitals';

import configureStore from './store/configure';
import Main from './App';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';

import RouterSync from './components/RouterSync';

const { store, persistor } = configureStore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <>
    <Provider store={store}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        maxSnack={1}
      >
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <RouterSync />
            <Main />
          </BrowserRouter>
        </PersistGate>
      </SnackbarProvider>
    </Provider>
    <Analytics />
    <SpeedInsights />
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
