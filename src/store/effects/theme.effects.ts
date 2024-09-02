import { Dispatch } from 'redux';
import { SetValue } from '../models/state.model';
import { ThemeActions } from '../actions';
import { TypeTheme } from '../../enums/type.enum';

export const loadTheme = (dispatch: Dispatch, stateTheme: TypeTheme, setStateTheme: SetValue<TypeTheme>) => {
  setStateTheme(stateTheme ?? TypeTheme.LIGHT);
  return dispatch(ThemeActions.SetTheme.create(stateTheme));
};
