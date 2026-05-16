import type { Dispatch } from 'redux';
import { SetBar, SetPercent, ShowSpinnerMsg } from '../../store/actions/spinner.action';
import type { ErrorModel } from '../../store/reducers/spinner.reducer';

export const createProgressHelpers = (dispatch: Dispatch) => ({
  startProgress: () => {
    dispatch(SetBar.create(true));
    dispatch(SetPercent.create(0));
  },
  setProgress: (percent: number) => {
    dispatch(SetPercent.create(percent));
  },
  completeProgress: (delay = 500) => {
    dispatch(SetPercent.create(100));
    setTimeout(() => dispatch(SetBar.create(false)), delay);
  },
  hideProgress: () => {
    dispatch(SetBar.create(false));
  },
  errorProgress: (error: ErrorModel) => {
    dispatch(SetBar.create(false));
    dispatch(ShowSpinnerMsg.create(error));
  },
});
