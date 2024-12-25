import { AnyIfEmpty } from 'react-redux';
import configureStore from '..';
import { StoreModel } from './store.model';
import { IStatsRank } from '../../core/models/stats.model';
import { SpinnerModel } from '../reducers/spinner.reducer';
import { OptionsSheetModel } from '../../core/models/options-sheet.model';
import { SearchingOptionsModel } from '../../core/models/searching.model';
import { DeviceModel } from '../reducers/device.reducer';
import { Dispatch, SetStateAction } from 'react';

const store = configureStore();

interface StoreStateModel {
  store: StoreModel;
}
interface StatsStateModel {
  stats: IStatsRank | null;
}
interface SpinnerStateModel {
  spinner: SpinnerModel;
}
interface SearchingStateModel {
  searching: SearchingOptionsModel;
}
interface OptionsSheetStateModel {
  options: OptionsSheetModel | null;
}
interface ThemeStateModel {
  theme: string;
}
interface DeviceStateModel {
  device: DeviceModel;
}

export type RouterState = ReturnType<typeof store.getState>;

export type StatsState = AnyIfEmpty<StatsStateModel>;
export type SpinnerState = AnyIfEmpty<SpinnerStateModel>;
export type SearchingState = AnyIfEmpty<SearchingStateModel>;
export type OptionsSheetState = AnyIfEmpty<OptionsSheetStateModel>;

export type StoreState = AnyIfEmpty<StoreStateModel>;

export type ThemeState = AnyIfEmpty<ThemeStateModel>;

export type DeviceState = AnyIfEmpty<DeviceStateModel>;

export declare type SetValue<T> = Dispatch<SetStateAction<T>>;
