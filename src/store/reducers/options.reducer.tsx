import { OptionsSheetModel } from '../../core/models/options-sheet.model';
import { OptionsActions } from '../actions';
import { OptionsActionsUnion } from '../actions/options.action';

const OptionsReducer = (state: OptionsSheetModel | null = null, action: OptionsActionsUnion) => {
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
