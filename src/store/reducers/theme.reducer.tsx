import { LOAD_THEME, RESET_THEME } from '../actions/theme.action';

const ThemeReducer = (state: string = 'light', action: any) => {
  switch (action.type) {
    case LOAD_THEME:
      return action.payload;
    case RESET_THEME:
      return 'light';
    default:
      return state;
  }
};

export default ThemeReducer;