import { useSelector, useDispatch } from 'react-redux';
import { SpinnerState } from '../store/models/state.model';
import { ShowSpinner, HideSpinner, ShowSpinnerMsg, SetBar, SetPercent } from '../store/actions/spinner.action';
import { ErrorModel } from '../store/reducers/spinner.reducer';

/**
 * Custom hook to access and update the spinner state from Redux store
 * This replaces direct usage of useSelector((state: StoreState) => state.store.data)
 *
 * @returns The spinner state and update methods
 */
export const useSpinner = () => {
  const dispatch = useDispatch();
  const spinnerData = useSelector((state: SpinnerState) => state.spinner);

  /**
   * Show spinner in the store
   */
  const showSpinner = () => {
    dispatch(ShowSpinner.create());
  };

  /**
   * Hide spinner in the store
   */
  const hideSpinner = () => {
    dispatch(HideSpinner.create());
  };

  /**
   * Show spinner message in the store
   * @param error - The error message
   */
  const showSpinnerMsg = (error: ErrorModel) => {
    dispatch(ShowSpinnerMsg.create(error));
  };

  /**
   * Set spinner bar in the store
   * @param isShow - The bar state
   */
  const setBar = (isShow: boolean) => {
    dispatch(SetBar.create(isShow));
  };

  /**
   * Set spinner percent in the store
   * @param percent - The percent state
   */
  const setPercent = (percent: number) => {
    dispatch(SetPercent.create(percent));
  };

  /**
   * Get current spinner loading state
   * @returns The current loading state
   */
  const getSpinner = () => spinnerData;

  return {
    spinnerData,
    getSpinner,
    showSpinner,
    hideSpinner,
    showSpinnerMsg,
    setBar,
    setPercent,
  };
};

export default useSpinner;
