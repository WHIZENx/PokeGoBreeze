import { OptionDPSModel } from '../models/options.model';

export const SET_DPS_SHEET_OPTIONS = 'SET_DPS_SHEET_OPTIONS';

export const setDPSSheetPage = (payload: OptionDPSModel) => ({
  type: SET_DPS_SHEET_OPTIONS,
  payload,
});
