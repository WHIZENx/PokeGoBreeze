import spinner from './spinner.reducer';
import store from './store.reducer';
import searching from './searching.reducer';
import options from './options.reducer';
import stats from './stats.reducer';

const rootReducer = {
  spinner,
  store,
  searching,
  options,
  stats,
};

export default rootReducer;
