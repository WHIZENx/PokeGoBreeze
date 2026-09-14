import type { Dispatch } from 'redux';
import { SetBar, SetPercent, ShowSpinnerMsg } from '../../store/actions/spinner.action';
import type { ErrorModel } from '../../store/reducers/spinner.reducer';

let hideTimer: ReturnType<typeof setTimeout> | undefined;

const cancelHide = () => {
  if (hideTimer !== undefined) {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }
};

export const createProgressHelpers = (dispatch: Dispatch) => ({
  startProgress: () => {
    cancelHide();
    dispatch(SetBar.create(true));
    dispatch(SetPercent.create(0));
  },
  setProgress: (percent: number) => {
    dispatch(SetPercent.create(percent));
  },
  completeProgress: (delay = 500) => {
    cancelHide();
    dispatch(SetPercent.create(100));
    hideTimer = setTimeout(() => {
      hideTimer = undefined;
      dispatch(SetBar.create(false));
    }, delay);
  },
  hideProgress: () => {
    cancelHide();
    dispatch(SetBar.create(false));
  },
  errorProgress: (error: ErrorModel) => {
    cancelHide();
    dispatch(SetBar.create(false));
    dispatch(ShowSpinnerMsg.create(error));
  },
});
