import router from './router.reducer';
import spinner from './spinner.reducer';
import store from './store.reducer';
import searching from './searching.reducer';
import options from './options.reducer';
import stats from './stats.reducer';
import theme from './theme.reducer';
import device from './device.reducer';
import timestamp from './timestamp.reducer';

const rootReducer = {
  router,
  spinner,
  store,
  searching,
  options,
  stats,
  device,
  theme,
  timestamp,
};

export default rootReducer;
