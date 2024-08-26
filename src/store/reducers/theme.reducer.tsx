import { ThemeActions } from '../actions';
import { ThemeActionsUnion } from '../actions/theme.action';

const ThemeReducer = (state = 'light', action: ThemeActionsUnion) => {
  switch (action.type) {
    case ThemeActions.ThemeActionTypes.setTheme:
      return action.payload;
    case ThemeActions.ThemeActionTypes.resetTheme:
      return 'light';
    default:
      return state;
  }
};

export default ThemeReducer;
