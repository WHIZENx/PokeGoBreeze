import { combineReducers } from 'redux';
import spinner from './spinner.reducer';
import store from './store.reducer';
import stats from './stats.reducer';

const rootReducer = combineReducers({
  spinner,
  store,
  stats,
});

export default rootReducer;
