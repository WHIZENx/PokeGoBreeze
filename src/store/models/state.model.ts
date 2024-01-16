import { AnyIfEmpty } from 'react-redux';
import configureStore from '..';
import { StoreModel } from './store.model';
import { StatsModel } from '../../core/models/stats.model';
import { SpinnerModel } from '../reducers/spinner.reducer';
import { OptionsSheetModel } from '../../core/models/options-sheet.model';
import { SearchingOptionsModel } from '../../core/models/searching.model';
import { DeviceModel } from '../reducers/device.reducer';
import { Dispatch, SetStateAction } from 'react';

const store = configureStore();

export type RouterState = ReturnType<typeof store.getState>;

export type StatsState = AnyIfEmpty<{ stats: StatsModel }>;
export type SpinnerState = AnyIfEmpty<{ spinner: SpinnerModel }>;
export type SearchingState = AnyIfEmpty<{ searching: SearchingOptionsModel }>;
export type OptionsSheetState = AnyIfEmpty<{ options: OptionsSheetModel }>;

export type StoreState = AnyIfEmpty<{ store: StoreModel }>;

export type ThemeState = AnyIfEmpty<{ theme: string }>;

export type DeviceState = AnyIfEmpty<{ device: DeviceModel }>;

export declare type SetValue<T> = Dispatch<SetStateAction<T>>;
