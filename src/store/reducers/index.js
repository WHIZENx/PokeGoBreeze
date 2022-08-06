import { combineReducers } from 'redux';
import spinner from './spinner.reducer';
import gameMaster from './gamemaster.reducer';

export default combineReducers({
    spinner,
    gameMaster
});