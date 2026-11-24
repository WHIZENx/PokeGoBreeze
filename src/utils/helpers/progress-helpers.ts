import type { Dispatch } from 'redux';
import { SetBar, SetPercent, ShowSpinnerMsg } from '../../store/actions/spinner.action';
import type { ErrorModel } from '../../store/reducers/spinner.reducer';

export const finishStartupProgress = () => {
  document.getElementById('startup-progress')?.remove();
};

export const createProgressHelpers = (dispatch: Dispatch) => ({
  startProgress: () => {
    dispatch(SetBar.create(true));
    dispatch(SetPercent.create(0));
  },
  setProgress: (percent: number) => {
    dispatch(SetPercent.create(percent));
  },
  hideProgress: () => {
    dispatch(SetBar.create(false));
  },
  errorProgress: (error: ErrorModel) => {
    finishStartupProgress();
    dispatch(SetBar.create(false));
    dispatch(ShowSpinnerMsg.create(error));
  },
});
