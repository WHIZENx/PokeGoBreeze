import { useSelector, useDispatch } from 'react-redux';
import { SpinnerState } from '../store/models/state.model';
import { ShowSpinner, HideSpinner, ShowSpinnerMsg, SetBar, SetPercent } from '../store/actions/spinner.action';
import { ErrorModel } from '../store/reducers/spinner.reducer';
import { useMemo } from 'react';

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

  const spinnerBar = useMemo(() => spinnerData.bar, [spinnerData.bar]);
  const spinnerPercent = useMemo(() => spinnerData.bar.percent, [spinnerData.bar.percent]);
  const spinnerBarIsShow = useMemo(() => spinnerData.bar.isShow, [spinnerData.bar.isShow]);
  const spinnerIsError = useMemo(() => spinnerData.error?.isError, [spinnerData.error?.isError]);
  const spinnerMessage = useMemo(() => spinnerData.error?.message, [spinnerData.error?.message]);
  const spinnerIsLoading = useMemo(() => spinnerData.isLoading, [spinnerData.isLoading]);

  return {
    spinnerData,
    showSpinner,
    hideSpinner,
    showSpinnerMsg,
    setBar,
    setPercent,
    spinnerBar,
    spinnerPercent,
    spinnerMessage,
    spinnerBarIsShow,
    spinnerIsError,
    spinnerIsLoading,
  };
};

export default useSpinner;
