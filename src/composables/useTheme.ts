import { useSelector, useDispatch } from 'react-redux';
import { SetValue, ThemeState } from '../store/models/state.model';
import { SetTheme } from '../store/actions/theme.action';
import { TypeTheme } from '../enums/type.enum';

/**
 * Custom hook to access and update the theme state from Redux store
 * This replaces direct usage of useSelector((state: ThemeState) => state.theme)
 *
 * @returns The theme state and update methods
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  const themeData = useSelector((state: ThemeState) => state.theme);

  /**
   * Update theme state in the store
   * @param theme - The new theme state
   */
  const setTheme = (theme: TypeTheme) => {
    dispatch(SetTheme.create(theme));
  };

  const loadTheme = (stateTheme: TypeTheme, setStateTheme: SetValue<TypeTheme>) => {
    setStateTheme(stateTheme || TypeTheme.Light);
    return setTheme(stateTheme);
  };

  return {
    themeData,
    loadTheme,
    setTheme,
  };
};

export default useTheme;
