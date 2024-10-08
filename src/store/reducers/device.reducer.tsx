import { DeviceActions } from '../actions';
import { DeviceActionsUnion } from '../actions/device.action';

export interface DeviceModel {
  isMobile: boolean;
  browserName: string | null;
  osName: string | null;
}

const initialize: DeviceModel = {
  isMobile: false,
  browserName: null,
  osName: null,
};

const DeviceReducer = (state: DeviceModel = initialize, action: DeviceActionsUnion) => {
  switch (action.type) {
    case DeviceActions.DeviceActionTypes.setDevice: {
      return action.payload;
    }
    default:
      return state;
  }
};

export default DeviceReducer;
