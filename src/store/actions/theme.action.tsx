import { Dispatch } from 'redux';

export const LOAD_THEME = 'LOAD_THEME';
export const RESET_THEME = 'RESET_THEME';

export const loadThemeData = (theme: string) => ({
  type: LOAD_THEME,
  payload: theme,
});

export const resetTheme = () => ({
  type: RESET_THEME,
});

export const loadTheme = (dispatch: Dispatch, stateTheme: any, setStateTheme: any) => {
  setStateTheme(stateTheme ?? 'light');
  return dispatch(loadThemeData(stateTheme));
};
