export const LOAD_GM = "LOAD_GM";
export const RESET_GM = "RESET_GM";

export const loadGM = (data) => ({
    type: LOAD_GM,
    payload: data
});

export const resetGM = () => ({
    type: RESET_GM
});