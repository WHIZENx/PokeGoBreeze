import { SearchingOptionsModel } from '../../core/models/searching.model';
import { OptionsActions } from '../actions';
import { OptionsActionsUnion } from '../actions/options.action';

const initialize = null;

const OptionsReducer = (state: SearchingOptionsModel | null = initialize, action: OptionsActionsUnion) => {
  switch (action.type) {
    case OptionsActions.OptionsActionTypes.setDpsSheetOptions:
      return {
        ...state,
        dpsSheet: action.payload,
      };

    default:
      return state;
  }
};

export default OptionsReducer;
