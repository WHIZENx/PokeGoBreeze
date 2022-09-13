export const SHOW_SPINNER = "SHOW_SPINNER";
export const HIDE_SPINNER = "HIDE_SPINNER";

export const showSpinner = (error = false) => ({
    type: SHOW_SPINNER,
    payload: {
        error: error
    }
});

export const hideSpinner = () => ({
    type: HIDE_SPINNER
});