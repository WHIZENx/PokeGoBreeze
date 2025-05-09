import spinner from './spinner.reducer';
import store from './store.reducer';
import searching from './searching.reducer';
import options from './options.reducer';
import stats from './stats.reducer';
import theme from './theme.reducer';
import device from './device.reducer';
import timestamp from './timestamp.reducer';
import path from './path.reducer';

const rootReducer = {
  spinner,
  store,
  searching,
  options,
  stats,
  device,
  theme,
  path,
  timestamp,
};

export default rootReducer;
