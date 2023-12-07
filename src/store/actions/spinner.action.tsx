export const SHOW_SPINNER = 'SHOW_SPINNER';
export const SHOW_SPINNER_MSG = 'SHOW_SPINNER_MSG';
export const HIDE_SPINNER = 'HIDE_SPINNER';
export const SET_BAR = 'SET_BAR';
export const SET_PERCENT = 'SET_PERCENT';

export const showSpinner = (error: any = null) => ({
  type: SHOW_SPINNER,
  payload: {
    error,
  },
});

export const showSpinnerWithMsg = (message: string, error: any = null) => ({
  type: SHOW_SPINNER_MSG,
  payload: {
    message,
    error,
  },
});

export const hideSpinner = () => ({
  type: HIDE_SPINNER,
});

export const setBar = (show: boolean) => ({
  type: SET_BAR,
  payload: show,
});

export const setPercent = (percent: number) => ({
  type: SET_PERCENT,
  payload: percent,
});
