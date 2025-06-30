import { useSelector, useDispatch } from 'react-redux';
import { RouterState } from '../store/models/state.model';
import {
  LocationChangeAction,
  PushAction,
  ReplaceAction,
  GoAction,
  GoBackAction,
  GoForwardAction,
} from '../store/actions/router.action';
import { RouterChange, RouterModify } from '../core/models/router.model';
import { useMemo } from 'react';

/**
 * Custom hook to access and update the router state from Redux store
 * This replaces direct usage of useSelector((state: RouterState) => state.router)
 *
 * @returns The router state object with all properties and update methods
 */
export const useRouter = () => {
  const dispatch = useDispatch();
  const routerData = useSelector((state: RouterState) => state.router);

  /**
   * Update location in the router store
   * @param value The new location data
   */
  const locationChange = (value: RouterChange) => {
    dispatch(LocationChangeAction.create(value));
  };

  /**
   * Push a new location to the router history
   * @param value The new location data
   */
  const push = (value: RouterModify) => {
    dispatch(PushAction.create(value));
  };

  /**
   * Replace the current location in the router history
   * @param value The new location data
   */
  const replace = (value: RouterModify) => {
    dispatch(ReplaceAction.create(value));
  };

  /**
   * Go to a specific position in the router history
   * @param value The position to go to
   */
  const go = (value: number) => {
    dispatch(GoAction.create(value));
  };

  /**
   * Go back one step in the router history
   */
  const goBack = () => {
    dispatch(GoBackAction.create());
  };

  /**
   * Go forward one step in the router history
   */
  const goForward = () => {
    dispatch(GoForwardAction.create());
  };

  const routerAction = useMemo(() => routerData.action, [routerData.action]);
  const routerLocation = useMemo(() => routerData.location, [routerData.location]);

  return {
    routerData,
    routerAction,
    routerLocation,
    locationChange,
    push,
    replace,
    go,
    goBack,
    goForward,
  };
};

export default useRouter;
