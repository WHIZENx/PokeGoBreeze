import { SearchingOptionsModel } from '../../core/models/searching.model';
import { SET_DPS_SHEET_OPTIONS } from '../actions/options.action';

const initialize = null;

const OptionsReducer = (state: SearchingOptionsModel | null = initialize, action: { type: string; payload: any }) => {
  switch (action.type) {
    case SET_DPS_SHEET_OPTIONS:
      return {
        ...state,
        dpsSheet: action.payload,
      };

    default:
      return state;
  }
};

export default OptionsReducer;
