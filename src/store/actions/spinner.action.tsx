export const SHOW_SPINNER = 'SHOW_SPINNER';
export const HIDE_SPINNER = 'HIDE_SPINNER';

export const showSpinner = (error: any = null) => ({
  type: SHOW_SPINNER,
  payload: {
    error,
  },
});

export const hideSpinner = () => ({
  type: HIDE_SPINNER,
});
