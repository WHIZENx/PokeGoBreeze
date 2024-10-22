/* eslint-disable no-unused-vars */
import { isMobile, browserName, osName } from 'react-device-detect';
import { Action } from 'redux';
import { DeviceModel } from '../reducers/device.reducer';

export enum DeviceActionTypes {
  setDevice = '[Device] SetDevice',
}

export class SetDevice implements Action {
  readonly type = DeviceActionTypes.setDevice;

  constructor(public payload: DeviceModel) {}

  static create() {
    const { type, payload } = new SetDevice({
      isMobile,
      browserName,
      osName,
    });
    return {
      type,
      payload,
    };
  }
}

export type DeviceActionsUnion = SetDevice;
