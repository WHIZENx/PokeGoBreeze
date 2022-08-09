import { combineReducers } from 'redux';
import spinner from './spinner.reducer';
import gameMaster from './gamemaster.reducer';

const rootReducer = combineReducers({
    spinner,
    gameMaster
});

export default rootReducer;