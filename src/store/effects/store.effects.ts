import { Dispatch } from 'redux';
import { calculateBaseCPM, calculateCPM } from '../../core/cpm';
import { BASE_CPM } from '../../utils/constants';
import { StoreActions } from '../actions';
import { DynamicObj } from '../../utils/extension';
import { minIv, maxIv } from '../../utils/helpers/options-context.helpers';

export const loadBaseCPM = (dispatch: Dispatch) =>
  dispatch(StoreActions.SetCPM.create(calculateBaseCPM(BASE_CPM, minIv(), maxIv())));

export const loadCPM = (dispatch: Dispatch, cpmList: DynamicObj<number>) =>
  dispatch(StoreActions.SetCPM.create(calculateCPM(cpmList, minIv(), Object.keys(cpmList).length)));
