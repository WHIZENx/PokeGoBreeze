import { useSelector, useDispatch } from 'react-redux';
import { StoreState } from '../store/models/state.model';
import { SetLogoPokeGO } from '../store/actions/store.action';

/**
 * Custom hook to access and update the icon state from Redux store
 * This replaces direct usage of useSelector((state: StoreState) => state.store.icon)
 *
 * @returns The icon state and update methods
 */
export const useIcon = () => {
  const dispatch = useDispatch();
  const iconData = useSelector((state: StoreState) => state.store.icon);

  /**
   * Update icon state in the store
   * @param icon - The new icon state
   */
  const setIcon = (icon = '') => {
    dispatch(SetLogoPokeGO.create(icon.replace('Images/App Icons/', '').replace('.png', '')));
  };

  return {
    iconData,
    setIcon,
  };
};

export default useIcon;
