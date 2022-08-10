import { combineReducers } from 'redux';
import spinner from './spinner.reducer';
import store from './store.reducer';

const rootReducer = combineReducers({
    spinner,
    store
});

export default rootReducer;