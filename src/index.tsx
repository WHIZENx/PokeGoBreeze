import React from 'react';
import ReactDOM from 'react-dom';
import { Analytics } from '@vercel/analytics/react';
import './index.scss';

import { Provider } from 'react-redux';

import { SnackbarProvider } from 'notistack';

import reportWebVitals from './reportWebVitals';

import { ReduxRouterSelector, ReduxRouter } from '@lagunovsky/redux-react-router';
import configureStore, { history } from './store';
import Main from './App';

export type RouterState = ReturnType<typeof store.getState>;

if (module.hot) {
  module.hot.accept();
}

const store = configureStore();
const routerSelector: ReduxRouterSelector<RouterState> = (state) => state.router;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        maxSnack={1}
      >
        <ReduxRouter history={history} routerSelector={routerSelector}>
          <Main />
        </ReduxRouter>
      </SnackbarProvider>
    </Provider>
    <Analytics />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
