import { TypeTheme } from '../../enums/type.enum';
import { ThemeActions } from '../actions';
import { ThemeActionsUnion } from '../actions/theme.action';

const ThemeReducer = (state = TypeTheme.Light, action: ThemeActionsUnion) => {
  switch (action.type) {
    case ThemeActions.ThemeActionTypes.setTheme:
      return action.payload;
    case ThemeActions.ThemeActionTypes.resetTheme:
      return TypeTheme.Light;
    default:
      return state;
  }
};

export default ThemeReducer;
