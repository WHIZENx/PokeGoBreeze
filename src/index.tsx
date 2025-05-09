import React from 'react';
import ReactDOM from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './index.scss';

import { Provider } from 'react-redux';

import { SnackbarProvider } from 'notistack';

import reportWebVitals from './reportWebVitals';

import { ReduxRouterSelector, ReduxRouter } from '@lagunovsky/redux-react-router';
import configureStore from './store';
import { history } from './store/configure';
import Main from './App';
import { RouterState } from './store/models/state.model';
import { PersistGate } from 'redux-persist/integration/react';

const { store, persistor } = configureStore();
const routerSelector: ReduxRouterSelector<RouterState> = (state) => state.router;

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
          <ReduxRouter history={history} routerSelector={routerSelector}>
            <Main />
          </ReduxRouter>
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
