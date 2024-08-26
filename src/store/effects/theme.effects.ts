import { Dispatch } from 'redux';
import { SetValue } from '../models/state.model';
import { ThemeActions } from '../actions';

export const loadTheme = (dispatch: Dispatch, stateTheme: string, setStateTheme: SetValue<string>) => {
  setStateTheme(stateTheme ?? 'light');
  return dispatch(ThemeActions.SetTheme.create(stateTheme));
};
