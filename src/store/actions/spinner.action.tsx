export const SHOW_SPINNER = 'SHOW_SPINNER';
export const SHOW_SPINNER_MSG = 'SHOW_SPINNER_MSG';
export const HIDE_SPINNER = 'HIDE_SPINNER';

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
